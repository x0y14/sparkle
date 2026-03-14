import { describe, test, expect, vi } from "vitest";
import clientDirective from "../src/client.js";

describe("client directive", () => {
  test("passes props to firstElementChild (actual Sparkle component)", async () => {
    // <astro-island> ラッパーをシミュレート
    const island = document.createElement("div");
    const sparkleEl = document.createElement("div") as any;
    Object.defineProperty(sparkleEl, "count", {
      value: 0,
      writable: true,
      configurable: true,
    });
    island.appendChild(sparkleEl);

    const hydrate = clientDirective(island);
    await hydrate(null, { count: 42 }, {});

    // firstElementChild (実際の Sparkle コンポーネント) に設定される
    expect(sparkleEl.count).toBe(42);
  });

  test("ignores props not defined on component", async () => {
    const island = document.createElement("div");
    const sparkleEl = document.createElement("div");
    island.appendChild(sparkleEl);

    const hydrate = clientDirective(island);
    await expect(hydrate(null, { unknown: "value" }, {})).resolves.not.toThrow();
  });

  test("falls back to element itself when no child exists", async () => {
    const island = document.createElement("div") as any;
    Object.defineProperty(island, "count", {
      value: 0,
      writable: true,
      configurable: true,
    });

    const hydrate = clientDirective(island);
    await hydrate(null, { count: 99 }, {});

    expect(island.count).toBe(99);
  });

  test("Object/Array props are passed through", async () => {
    const island = document.createElement("div");
    const sparkleEl = document.createElement("div") as any;
    Object.defineProperty(sparkleEl, "items", {
      value: [],
      writable: true,
      configurable: true,
    });
    Object.defineProperty(sparkleEl, "config", {
      value: {},
      writable: true,
      configurable: true,
    });
    island.appendChild(sparkleEl);

    const hydrate = clientDirective(island);
    await hydrate(null, { items: [1, 2, 3], config: { theme: "dark" } }, {});

    // firstElementChild (実際の Sparkle コンポーネント) に設定される
    expect(sparkleEl.items).toEqual([1, 2, 3]);
    expect(sparkleEl.config).toEqual({ theme: "dark" });
  });
});
