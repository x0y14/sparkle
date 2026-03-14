import { CSSResult } from "./styles/css-tag.js";
import { type HookContext, runInContext } from "./hooks/context.js";
import { createScheduler, type RenderScheduler } from "./hooks/scheduler.js";
import { morph } from "./morph.js";
import { camelToKebab, kebabToCamel } from "./utils.js";

export type PropType = {
  type:
    | typeof String
    | typeof Number
    | typeof Boolean
    | typeof Array
    | typeof Object;
  reflect?: boolean;
  value?: () => unknown;
  event?: { type: string; bubbles?: boolean; composed?: boolean };
};

export type SparkleComponentOptions<P extends Record<string, PropType>> = {
  props?: P;
  styles?: CSSStyleSheet | CSSStyleSheet[] | string | CSSResult;
  shadow?: boolean | ShadowRootInit;
  tag?: string;
};

export type SparkleRenderFn<P> = (props: P) => string | Node | null;

type InferProps<P extends Record<string, PropType>> = {
  [K in keyof P]: P[K]["type"] extends typeof String
    ? string
    : P[K]["type"] extends typeof Number
      ? number
      : P[K]["type"] extends typeof Boolean
        ? boolean
        : P[K]["type"] extends typeof Array
          ? unknown[]
          : P[K]["type"] extends typeof Object
            ? Record<string, unknown>
            : unknown;
};

type CoerceResult =
  | { ok: true; value: unknown }
  | { ok: false };

export function coerceValue(
  value: string | null,
  type: Function,
): CoerceResult {
  if (value === null) return { ok: true, value: type === Boolean ? false : undefined };
  switch (type) {
    case Boolean:
      return { ok: true, value: !(value === "false" || value === "0") };
    case Number: {
      if (value.trim() === "") return { ok: false };
      const n = Number(value);
      if (!Number.isFinite(n)) return { ok: false };
      return { ok: true, value: n };
    }
    case Array:
    case Object:
      try {
        return { ok: true, value: JSON.parse(value) };
      } catch {
        if (typeof console !== "undefined") {
          console.warn(`[sparkle] Failed to parse attribute value as JSON: "${value}"`);
        }
        return { ok: false };
      }
    default:
      return { ok: true, value };
  }
}

function prepareSheets(
  styles: CSSStyleSheet | CSSStyleSheet[] | string | CSSResult | undefined,
): CSSStyleSheet[] {
  if (!styles) return [];
  if (styles instanceof CSSResult) return [styles.styleSheet];
  if (typeof styles === "string") {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    return [sheet];
  }
  if (Array.isArray(styles)) {
    return styles.map((s) => (s instanceof CSSResult ? s.styleSheet : s));
  }
  return [styles];
}

function normalizeStylesToCssText(
  styles: CSSStyleSheet | CSSStyleSheet[] | string | CSSResult | undefined,
): string {
  if (!styles) return "";
  if (typeof styles === "string") return styles;
  if (styles instanceof CSSResult) return styles.cssText;
  if (Array.isArray(styles)) {
    return styles
      .map((s): string => {
        if (s instanceof CSSResult) return s.cssText;
        const rules = (s as any).cssRules;
        if (!rules) return "";
        return Array.from(rules).map((r: any) => r.cssText ?? "").join("\n");
      })
      .filter(Boolean)
      .join("\n");
  }
  const rules = (styles as any).cssRules;
  if (!rules) return "";
  return Array.from(rules).map((r: any) => r.cssText ?? "").join("\n");
}

export function defineElement<P extends Record<string, PropType>>(
  options: SparkleComponentOptions<P>,
  renderFn: SparkleRenderFn<InferProps<P>>,
): CustomElementConstructor {
  const propNames = Object.keys(options.props || {});
  const observedAttrs = propNames.map(camelToKebab);
  const propsSchema = options.props || ({} as P);

  // SSR (Node.js) 環境では HTMLElement が存在しない
  // Astro の SSR renderer は _renderFn / _tag / __sparkle のみ使うためスタブを返す
  if (typeof HTMLElement === "undefined") {
    return Object.assign(class SparkleSSRComponent {}, {
      __sparkle: true,
      _renderFn: renderFn,
      _tag: options.tag,
      _styles: normalizeStylesToCssText(options.styles),
      _shadow: options.shadow,
      _propsSchema: propsSchema,
    }) as unknown as CustomElementConstructor;
  }

  const sharedSheets = prepareSheets(options.styles);

  class SparkleElement extends HTMLElement {
    static __sparkle = true;
    static _renderFn = renderFn;
    static _tag = options.tag;
    static _styles = normalizeStylesToCssText(options.styles);
    static _shadow = options.shadow;
    static _propsSchema = propsSchema;
    static observedAttributes = observedAttrs;

    _hookCtx: HookContext | null = null;
    _scheduler: RenderScheduler | null = null;
    _props: Record<string, unknown> = {};

    constructor() {
      super();
      if (options.shadow !== false) {
        const hasDSD = !!this.shadowRoot;
        if (!hasDSD) {
          const init =
            typeof options.shadow === "object"
              ? options.shadow
              : ({ mode: "open" } as const);
          this.attachShadow(init);
        }
        if (sharedSheets.length > 0 && this.shadowRoot) {
          if (hasDSD) {
            // DSD already injected a <style> tag with the same CSS.
            // Remove it and use adoptedStyleSheets instead (more efficient,
            // shared across instances).
            const existingStyle = this.shadowRoot.querySelector("style");
            if (existingStyle) existingStyle.remove();
          }
          this.shadowRoot.adoptedStyleSheets = [
            ...this.shadowRoot.adoptedStyleSheets,
            ...sharedSheets,
          ];
        }
      }
      for (const [name, schema] of Object.entries(propsSchema)) {
        this._props[name] = schema.value ? schema.value() : undefined;
      }
    }

    connectedCallback() {
      this._scheduler = createScheduler(() => this._render());
      if (!this._hookCtx) {
        // First mount — create a fresh hook context
        this._hookCtx = {
          host: this,
          hooks: [],
          update: () => this._scheduler!.scheduleUpdate(),
          _scheduler: this._scheduler,
        };
      } else {
        // Reconnect (e.g. DOM move) — reuse the same _hookCtx object so that
        // closures captured by useState/useProp setters keep working.
        // The hooks array is preserved; effect entries still reference the old
        // scheduler, but _render() will re-register them with the new one via
        // useEffect/useLayoutEffect on the next render pass.
        this._hookCtx.update = () => this._scheduler!.scheduleUpdate();
        this._hookCtx._scheduler = this._scheduler;
      }
      this._scheduler.scheduleUpdate();
    }

    disconnectedCallback() {
      this._scheduler?.teardown();
    }

    attributeChangedCallback(
      name: string,
      _old: string | null,
      newVal: string | null,
    ) {
      const propName = kebabToCamel(name);
      const schema = (propsSchema as Record<string, PropType>)[propName];
      if (schema) {
        const result = coerceValue(newVal, schema.type);
        // Skip update if coercion failed (e.g. invalid JSON) — keep previous value
        if (!result.ok) return;
        this._props[propName] = result.value;
      }
      if (this._scheduler) {
        this._scheduler.scheduleUpdate();
      }
    }

    _render() {
      if (!this._hookCtx) return;
      try {
        const html = runInContext(this._hookCtx, () =>
          renderFn(this._props as InferProps<P>),
        );
        const root = this.shadowRoot || this;
        if (typeof html === "string") {
          morph(root, html);
        } else if (html instanceof Node) {
          root.replaceChildren(html);
        }
      } catch (err) {
        console.error(`[sparkle] Render error in <${options.tag || "unknown"}>:`, err);
        // Don't clear the DOM — keep the previous render result visible
        // so the user sees something rather than a blank component
      }
    }
  }

  // Property getters/setters on prototype
  for (const [name, schema] of Object.entries(propsSchema)) {
    Object.defineProperty(SparkleElement.prototype, name, {
      get(this: SparkleElement) {
        return this._props[name];
      },
      set(this: SparkleElement, value: unknown) {
        const oldValue = this._props[name];
        this._props[name] = value;
        if (schema.reflect) {
          if (value === false || value == null) {
            this.removeAttribute(camelToKebab(name));
          } else if (value === true) {
            this.setAttribute(camelToKebab(name), "");
          } else if (schema.type === Array || schema.type === Object) {
            this.setAttribute(camelToKebab(name), JSON.stringify(value));
          } else {
            this.setAttribute(camelToKebab(name), String(value));
          }
        }
        if (schema.event && !Object.is(oldValue, value)) {
          this.dispatchEvent(new CustomEvent(schema.event.type, {
            detail: value,
            bubbles: schema.event.bubbles ?? true,
            composed: schema.event.composed ?? false,
          }));
        }
        if (this._scheduler) {
          this._scheduler.scheduleUpdate();
        }
      },
      enumerable: true,
      configurable: true,
    });
  }

  if (options.tag && typeof customElements !== "undefined") {
    customElements.define(options.tag, SparkleElement);
  }

  return SparkleElement;
}
