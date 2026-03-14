import { defineElement, useState, useEffect, useHost } from "@sparkle/core";

export const CounterElement = defineElement(
  { tag: "counter-element" },
  () => {
    const [count, setCount] = useState(0);
    const hostRef = useHost();

    // useEffect で shadowRoot のボタンにリスナーを設定する
    // - レンダー後（microtask 2）に実行されるため DOM 要素は確実に存在する
    // - deps=[] なので初回マウント時のみ実行
    // - morph は既存 DOM 要素を保持するため、リスナーは再レンダー後も生き続ける
    useEffect(() => {
      const btn = hostRef.current.shadowRoot?.querySelector(
        "#btn",
      ) as HTMLButtonElement | null;
      if (!btn) return;
      const handler = () => setCount((c) => c + 1);
      btn.addEventListener("click", handler);
      return () => btn.removeEventListener("click", handler);
    }, []);

    return `<button id="btn">+</button><span id="count">${count}</span>`;
  },
);
