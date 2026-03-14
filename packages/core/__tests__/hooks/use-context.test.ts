import { describe, test, expect } from "vitest";
import { defineElement } from "../../src/define-element.js";
import { createContext } from "../../src/hooks/create-context.js";
import { useContext } from "../../src/hooks/use-context.js";

function flushMicrotasks(rounds = 5): Promise<void> {
  return new Promise((resolve) => {
    let remaining = rounds;
    function step() {
      if (--remaining <= 0) resolve();
      else queueMicrotask(step);
    }
    queueMicrotask(step);
  });
}

let tagCounter = 0;
function uniqueTag(): string {
  return `ctx-test-${++tagCounter}-${Date.now()}`;
}

describe("useContext / createContext", () => {
  test("useContext returns defaultValue when no Provider", async () => {
    const ThemeCtx = createContext("light");
    const tag = uniqueTag();
    let captured: string = "";
    defineElement({ tag }, () => {
      captured = useContext(ThemeCtx);
      return `<p>${captured}</p>`;
    });

    const el = document.createElement(tag);
    document.body.appendChild(el);
    await flushMicrotasks();

    expect(captured).toBe("light");
    document.body.removeChild(el);
  });

  test("useContext returns Provider value", async () => {
    const providerTag = uniqueTag();
    const ThemeCtx = createContext("light", providerTag);
    const childTag = uniqueTag();
    let captured: string = "";
    defineElement({ tag: childTag }, () => {
      captured = useContext(ThemeCtx);
      return `<p>${captured}</p>`;
    });

    // 1. Create and connect Provider first, let it render and set up event listener
    const provider = document.createElement(providerTag) as any;
    document.body.appendChild(provider);
    await flushMicrotasks();

    // 2. Set value on provider
    provider.value = "dark";
    await flushMicrotasks();

    // 3. Now add child — it will dispatch context request event which Provider handles
    const child = document.createElement(childTag);
    provider.appendChild(child);
    await flushMicrotasks();

    expect(captured).toBe("dark");
    document.body.removeChild(provider);
  });

  test("SSR: useContext consumes 2 hook slots (matches CSR)", async () => {
    const ThemeCtx = createContext("light");
    const { setCurrent, clear, nextIndex: ni } = await import("../../src/hooks/context.js");

    const ctx: any = {
      host: {} as HTMLElement,
      hooks: [],
      update: () => {},
      isSSR: true,
      _scheduler: { addEffect: () => {}, addLayoutEffect: () => {}, scheduleUpdate: () => {}, teardown: () => {} },
    };

    setCurrent(ctx);
    ni(); // slot 0: useState 相当

    const val = useContext(ThemeCtx); // should consume slots 1 and 2

    const nextSlot = ni(); // should be slot 3
    clear();

    expect(val).toBe("light");
    expect(nextSlot).toBe(3);
  });

  test("useContext preserves explicit undefined from Provider", async () => {
    const providerTag = uniqueTag();
    const Ctx = createContext<string | undefined>("fallback", providerTag);
    const childTag = uniqueTag();
    let captured: string | undefined = "initial";

    defineElement({ tag: childTag }, () => {
      captured = useContext(Ctx);
      return `<p>${String(captured)}</p>`;
    });

    const provider = document.createElement(providerTag) as any;
    document.body.appendChild(provider);
    await flushMicrotasks();

    provider.value = undefined;
    await flushMicrotasks();

    const child = document.createElement(childTag);
    provider.appendChild(child);
    await flushMicrotasks();

    // Provider が undefined を明示設定 → "fallback" ではなく undefined であるべき
    expect(captured).toBeUndefined();
    document.body.removeChild(provider);
  });

  test("useContext resets to defaultValue after disconnect from Provider tree", async () => {
    const providerTag = uniqueTag();
    const Ctx = createContext("default", providerTag);
    const childTag = uniqueTag();
    let captured = "";

    defineElement({ tag: childTag }, () => {
      captured = useContext(Ctx);
      return `<p>${captured}</p>`;
    });

    // Provider ツリーに接続
    const provider = document.createElement(providerTag) as any;
    document.body.appendChild(provider);
    await flushMicrotasks();
    provider.value = "provided";
    await flushMicrotasks();

    const child = document.createElement(childTag);
    provider.appendChild(child);
    await flushMicrotasks();
    expect(captured).toBe("provided");

    // Provider ツリーから切断
    provider.removeChild(child);
    await flushMicrotasks();

    // Provider なしの場所に再接続 → defaultValue に戻るべき
    document.body.appendChild(child);
    await flushMicrotasks();
    expect(captured).toBe("default");

    document.body.removeChild(child);
    document.body.removeChild(provider);
  });

  test("useContext re-subscribes to new Provider after disconnect/reconnect", async () => {
    const providerTag = uniqueTag();
    const Ctx = createContext("default", providerTag);
    const childTag = uniqueTag();
    let captured = "";

    defineElement({ tag: childTag }, () => {
      captured = useContext(Ctx);
      return `<p>${captured}</p>`;
    });

    // Provider1 に接続
    const provider1 = document.createElement(providerTag) as any;
    document.body.appendChild(provider1);
    await flushMicrotasks();
    provider1.value = "from-provider1";
    await flushMicrotasks();

    const child = document.createElement(childTag);
    provider1.appendChild(child);
    await flushMicrotasks();
    expect(captured).toBe("from-provider1");

    // Provider1 から切断
    provider1.removeChild(child);
    await flushMicrotasks();

    // 別の Provider インスタンスに接続 → 新しい値を取得すべき
    const provider2 = document.createElement(providerTag) as any;
    document.body.appendChild(provider2);
    await flushMicrotasks();
    provider2.value = "from-provider2";
    await flushMicrotasks();

    provider2.appendChild(child);
    await flushMicrotasks();
    expect(captured).toBe("from-provider2");

    document.body.removeChild(provider2);
    document.body.removeChild(provider1);
  });
});
