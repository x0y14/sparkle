import { defineElement, type PropType } from "../define-element.js";
import { useHost } from "./use-host.js";
import { useRef } from "./use-ref.js";
import { useLayoutEffect } from "./use-layout-effect.js";
import { CONTEXT_EVENT, type ContextRequestDetail } from "./context-symbols.js";

export type SparkleContext<T> = {
  Provider: CustomElementConstructor;
  defaultValue: T;
};

export function createContext<T>(
  defaultValue: T,
  tag?: string,
): SparkleContext<T> {
  let Context!: SparkleContext<T>;

  const Provider = defineElement(
    {
      tag,
      props: {
        value: { type: Object, value: () => defaultValue } as PropType,
      },
    },
    (props: any) => {
      const host = useHost();
      const listeners = useRef(new Set<(v: T) => void>());
      const valueRef = useRef<T>(props.value);
      valueRef.current = props.value;

      // Provider の value prop 変更を全サブスクライバーに通知
      useLayoutEffect(() => {
        for (const cb of listeners.current) cb(valueRef.current);
      }, [props.value]);

      // context request イベントをリッスン
      useLayoutEffect(() => {
        const el = host.current;
        const handler = (event: Event) => {
          const e = event as CustomEvent<ContextRequestDetail<T, SparkleContext<T>>>;
          if (e.detail.context !== Context) return;
          e.stopPropagation();
          const cb = e.detail.callback;
          listeners.current.add(cb);
          e.detail.value = valueRef.current;
          e.detail.unsubscribe = () => listeners.current.delete(cb);
        };
        el.addEventListener(CONTEXT_EVENT, handler as EventListener);
        return () => {
          el.removeEventListener(CONTEXT_EVENT, handler as EventListener);
          listeners.current.clear();
        };
      }, []);

      return "<slot></slot>";
    },
  );

  Context = { Provider, defaultValue };
  return Context;
}
