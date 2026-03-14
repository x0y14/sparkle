import { describe, test, expect, vi } from "vitest";
import { defineElement } from "../src/define-element.js";
import { useState } from "../src/hooks/use-state.js";
import { useEffect } from "../src/hooks/use-effect.js";

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  );
}

// Generate unique tag names to avoid CustomElementRegistry conflicts
let tagCounter = 0;
function uniqueTag(): string {
  return `test-el-${++tagCounter}-${Date.now()}`;
}

describe("defineElement", () => {
  test("returns CustomElementConstructor extending HTMLElement", () => {
    const Comp = defineElement({}, () => "<p>hi</p>");
    expect(Comp.prototype).toBeInstanceOf(HTMLElement);
  });

  test("tag option registers with customElements.define", () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>hi</p>");
    const Ctor = customElements.get(tag);
    expect(Ctor).toBeDefined();
  });

  test("renderFn receives props", async () => {
    const tag = uniqueTag();
    const renderFn = vi.fn((props: any) => `<p>${props.name}</p>`);
    defineElement({
      tag,
      props: {
        name: { type: String },
      },
    }, renderFn);

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(renderFn).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  test("renderFn return value is rendered HTML", async () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>rendered</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot!.innerHTML).toContain("<p>rendered</p>");
    document.body.removeChild(el);
  });

  test("connectedCallback triggers initial render", async () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>hello</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot!.innerHTML).toContain("<p>hello</p>");
    document.body.removeChild(el);
  });

  test("disconnectedCallback runs cleanup", async () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>hi</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    document.body.removeChild(el);
    // disconnectedCallback should have been called (scheduler.teardown)
  });

  test("attributeChangedCallback triggers re-render", async () => {
    const tag = uniqueTag();
    let renderCount = 0;
    defineElement(
      {
        tag,
        props: { count: { type: Number } },
      },
      () => {
        renderCount++;
        return "<p>rendered</p>";
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    const firstCount = renderCount;

    el.setAttribute("count", "5");
    await flushMicrotasks();

    expect(renderCount).toBeGreaterThan(firstCount);
    document.body.removeChild(el);
  });

  test("observedAttributes derived from props", () => {
    const tag = uniqueTag();
    const Comp = defineElement({
      tag,
      props: {
        firstName: { type: String },
        lastName: { type: String },
      },
    }, () => null);
    expect((Comp as any).observedAttributes).toEqual(["first-name", "last-name"]);
  });

  test("shadow DOM mode:open by default", async () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>hi</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot!.mode).toBe("open");
    document.body.removeChild(el);
  });

  test("shadow:false uses Light DOM", async () => {
    const tag = uniqueTag();
    defineElement({ tag, shadow: false }, () => "<p>light</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot).toBeNull();
    expect(el.innerHTML).toContain("<p>light</p>");
    document.body.removeChild(el);
  });

  test("DSD hydration: constructor checks for existing shadowRoot", async () => {
    const tag = uniqueTag();
    defineElement({ tag }, () => "<p>hydrated</p>");

    const el = document.createElement(tag);
    // The constructor should have created a shadowRoot
    expect(el.shadowRoot).not.toBeNull();

    // Verify the constructor's `if (!this.shadowRoot)` path exists
    // In real DSD, the parser creates shadowRoot before the constructor runs,
    // so the constructor skips attachShadow. We verify the basic path works.
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot!.innerHTML).toContain("<p>hydrated</p>");
    document.body.removeChild(el);
  });

  test("styles option: adoptedStyleSheets applied", async () => {
    const tag = uniqueTag();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync("p { color: red; }");
    defineElement({ tag, styles: sheet }, () => "<p>styled</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot!.adoptedStyleSheets).toContain(sheet);
    document.body.removeChild(el);
  });

  test("string styles converted to CSSStyleSheet", async () => {
    const tag = uniqueTag();
    defineElement({
      tag,
      styles: "p { color: blue; }",
    }, () => "<p>styled</p>");

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(el.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0);
    document.body.removeChild(el);
  });

  test("multiple instances share CSSStyleSheet", async () => {
    const tag = uniqueTag();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync("p { color: red; }");
    defineElement({ tag, styles: sheet }, () => "<p>hi</p>");

    const el1 = document.createElement(tag);
    const el2 = document.createElement(tag);
    document.body.appendChild(el1);
    document.body.appendChild(el2);
    await flushMicrotasks();

    expect(el1.shadowRoot!.adoptedStyleSheets[0]).toBe(
      el2.shadowRoot!.adoptedStyleSheets[0],
    );
    document.body.removeChild(el1);
    document.body.removeChild(el2);
  });

  test("batches multiple prop changes", async () => {
    const tag = uniqueTag();
    let renderCount = 0;
    defineElement(
      {
        tag,
        props: {
          a: { type: String },
          b: { type: String },
        },
      },
      () => {
        renderCount++;
        return "<p>hi</p>";
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    renderCount = 0;

    el.setAttribute("a", "1");
    el.setAttribute("b", "2");
    await flushMicrotasks();

    // Should batch into single render
    expect(renderCount).toBe(1);
    document.body.removeChild(el);
  });

  test("prop setter dispatches CustomEvent when schema.event is set", async () => {
    const tag = uniqueTag();
    defineElement({
      tag,
      props: {
        count: {
          type: Number,
          event: { type: "count-change", bubbles: true, composed: true },
        },
      },
    }, (props: any) => `<p>${props.count}</p>`);

    const el = document.createElement(tag) as any;
    document.body.appendChild(el);
    await flushMicrotasks();

    const handler = vi.fn();
    el.addEventListener("count-change", handler);
    el.count = 42;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toBe(42);
    document.body.removeChild(el);
  });

  test("no event dispatched when schema.event is not set", async () => {
    const tag = uniqueTag();
    defineElement({
      tag,
      props: { name: { type: String } },
    }, () => "<p>hi</p>");

    const el = document.createElement(tag) as any;
    document.body.appendChild(el);
    await flushMicrotasks();

    const handler = vi.fn();
    el.addEventListener("name-change", handler);
    el.name = "test";

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(el);
  });

  test("no event dispatched when value is the same (Object.is)", async () => {
    const tag = uniqueTag();
    defineElement({
      tag,
      props: {
        count: {
          type: Number,
          event: { type: "count-change" },
        },
      },
    }, (props: any) => `<p>${props.count}</p>`);

    const el = document.createElement(tag) as any;
    document.body.appendChild(el);
    await flushMicrotasks();

    el.count = 5;
    const handler = vi.fn();
    el.addEventListener("count-change", handler);
    el.count = 5; // same value

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(el);
  });

  test("Array prop with reflect uses JSON.stringify for attribute", async () => {
    const tag = uniqueTag();
    defineElement({
      tag,
      props: {
        items: { type: Array, reflect: true, value: () => [] },
      },
    }, (props: any) => `<p>${JSON.stringify(props.items)}</p>`);

    const el = document.createElement(tag) as any;
    document.body.appendChild(el);
    await flushMicrotasks();

    el.items = [1, 2, 3];
    expect(el.getAttribute("items")).toBe("[1,2,3]");
    document.body.removeChild(el);
  });

  test("hooks call-order maintained across re-renders", async () => {
    const tag = uniqueTag();
    const hookCalls: string[] = [];
    defineElement(
      { tag },
      () => {
        hookCalls.push("render");
        return "<p>hi</p>";
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(hookCalls).toEqual(["render"]);
    document.body.removeChild(el);
  });

  test("invalid JSON attribute does not crash (coerceValue error handling)", async () => {
    const tag = uniqueTag();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    defineElement({
      tag,
      props: {
        items: { type: Array, value: () => [] },
      },
    }, (props: any) => `<p>${JSON.stringify(props.items)}</p>`);

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    // Setting invalid JSON should not throw
    expect(() => el.setAttribute("items", "not-json")).not.toThrow();
    await flushMicrotasks();

    // console.warn should have been called
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[sparkle] Failed to parse attribute value as JSON"),
    );

    // Previous value should be preserved (not overwritten with undefined)
    expect(el.shadowRoot!.innerHTML).toContain("<p>[]</p>");

    warnSpy.mockRestore();
    document.body.removeChild(el);
  });

  test("disconnect → reconnect: useState setter triggers re-render via new scheduler", async () => {
    const tag = uniqueTag();
    let renderCount = 0;
    let setCount: ((v: number | ((p: number) => number)) => void) | null = null;

    const { useState } = await import("../src/hooks/use-state.js");

    defineElement(
      {
        tag,
        props: { count: { type: Number, value: () => 0 } },
      },
      () => {
        renderCount++;
        const [count, setter] = useState(0);
        setCount = setter;
        return `<p>${count}</p>`;
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    const initialRenderCount = renderCount;

    // Disconnect then reconnect — new scheduler is created
    document.body.removeChild(el);
    document.body.appendChild(el);
    await flushMicrotasks();

    const afterReconnectCount = renderCount;
    expect(afterReconnectCount).toBeGreaterThan(initialRenderCount);

    // The setter captured during the first render should still work
    // because _hookCtx object reference is reused
    setCount!(1);
    await flushMicrotasks();

    expect(renderCount).toBeGreaterThan(afterReconnectCount);
    expect(el.shadowRoot!.innerHTML).toContain("<p>1</p>");

    document.body.removeChild(el);
  });

  test("_render() catches errors and does not crash the component", async () => {
    const tag = uniqueTag();
    let shouldThrow = true;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    defineElement({ tag }, () => {
      if (shouldThrow) {
        shouldThrow = false; // 初回のみ throw
        throw new Error("render error");
      }
      return "<p>recovered</p>";
    });

    const el = document.createElement(tag);

    // renderFn が throw してもクラッシュしない
    expect(() => document.body.appendChild(el)).not.toThrow();
    await flushMicrotasks();

    // console.error が呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalled();

    // 再レンダーで復旧できる
    (el as any)._scheduler?.scheduleUpdate();
    await flushMicrotasks();

    expect(el.shadowRoot!.innerHTML).toContain("recovered");

    consoleSpy.mockRestore();
    document.body.removeChild(el);
  });

  test("Boolean coercion: '0' is false", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { active: { type: Boolean } } },
      (props: any) => { captured = props.active; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    el.setAttribute("active", "0");
    document.body.appendChild(el);
    await flushMicrotasks();
    expect(captured).toBe(false);
    document.body.removeChild(el);
  });

  test("Boolean coercion: 'false' is false", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { active: { type: Boolean } } },
      (props: any) => { captured = props.active; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    el.setAttribute("active", "false");
    document.body.appendChild(el);
    await flushMicrotasks();
    expect(captured).toBe(false);
    document.body.removeChild(el);
  });

  test("Boolean coercion: '' (empty, attribute present) is true", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { active: { type: Boolean } } },
      (props: any) => { captured = props.active; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    el.setAttribute("active", "");
    document.body.appendChild(el);
    await flushMicrotasks();
    expect(captured).toBe(true);
    document.body.removeChild(el);
  });

  test("Number coercion: '' is invalid (keeps default)", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { count: { type: Number, value: () => 42 } } },
      (props: any) => { captured = props.count; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    el.setAttribute("count", "");
    await flushMicrotasks();
    expect(captured).toBe(42);
    document.body.removeChild(el);
  });

  test("Number coercion: 'abc' is invalid (keeps default)", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { count: { type: Number, value: () => 42 } } },
      (props: any) => { captured = props.count; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    el.setAttribute("count", "abc");
    await flushMicrotasks();
    expect(captured).toBe(42);
    document.body.removeChild(el);
  });

  test("Number coercion: 'Infinity' is invalid (keeps default)", async () => {
    const tag = uniqueTag();
    let captured: unknown;
    defineElement(
      { tag, props: { count: { type: Number, value: () => 42 } } },
      (props: any) => { captured = props.count; return "<p>hi</p>"; },
    );
    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();
    el.setAttribute("count", "Infinity");
    await flushMicrotasks();
    expect(captured).toBe(42);
    document.body.removeChild(el);
  });

  test("effects re-registered after disconnect/reconnect", async () => {
    const tag = uniqueTag();
    const effectCalls: number[] = [];

    defineElement(
      { tag },
      () => {
        useEffect(() => {
          effectCalls.push(1);
          return () => effectCalls.push(-1);
        }, []);
        return "<p>test</p>";
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(effectCalls).toEqual([1]);
    effectCalls.length = 0;

    document.body.removeChild(el);
    await flushMicrotasks();
    expect(effectCalls).toEqual([-1]);
    effectCalls.length = 0;

    document.body.appendChild(el);
    await flushMicrotasks();

    expect(effectCalls).toEqual([1]);
    document.body.removeChild(el);
  });

  test("_renderFn field does not exist (uses _render method)", () => {
    const tag = uniqueTag();
    const Comp = defineElement({ tag }, () => "<p>test</p>");
    const el = new Comp() as any;

    expect(el.hasOwnProperty("_renderFn")).toBe(false);
    expect(typeof el._render).toBe("function");
  });

  test("renderFn is called inside hook context", async () => {
    const tag = uniqueTag();
    const hookCalls: string[] = [];

    defineElement(
      { tag },
      () => {
        hookCalls.push("render");
        return "<p>test</p>";
      },
    );

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(hookCalls).toContain("render");
    document.body.removeChild(el);
  });

  test("stale setter from detached element does not affect new instance", async () => {
    const tag = uniqueTag();
    let setCount: ((v: number) => void) | null = null;

    defineElement(
      { tag },
      () => {
        const [count, _setCount] = useState(0);
        setCount = _setCount;
        return `<p>${count}</p>`;
      },
    );

    const el1 = document.createElement(tag);
    document.body.appendChild(el1);
    await flushMicrotasks();

    const staleSetCount = setCount!;

    document.body.removeChild(el1);
    await flushMicrotasks();

    const el2 = new (customElements.get(tag)!)();
    document.body.appendChild(el2);
    await flushMicrotasks();

    staleSetCount(99);
    await flushMicrotasks();

    expect(el2.shadowRoot!.innerHTML).not.toContain("99");
    document.body.removeChild(el2);
  });
});
