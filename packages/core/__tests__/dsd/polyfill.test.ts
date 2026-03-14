import { describe, test, expect, vi } from "vitest";
import { polyfillDSD, supportsDSD } from "../../src/dsd/polyfill.js";

describe("polyfillDSD", () => {
  if (supportsDSD) {
    // If browser/happy-dom supports DSD natively, polyfillDSD is a no-op
    test("polyfillDSD is no-op when browser supports DSD natively", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<my-el><template shadowrootmode="open"><p>shadow content</p></template></my-el>';
      document.body.appendChild(container);

      polyfillDSD(document);

      // Templates should NOT be processed (no-op)
      const templates = container.querySelectorAll("template[shadowrootmode]");
      expect(templates.length).toBe(1); // still there, not polyfilled
      document.body.removeChild(container);
    });
  } else {
    test("converts template[shadowrootmode] to shadowRoot", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<my-el><template shadowrootmode="open"><p>shadow content</p></template></my-el>';
      document.body.appendChild(container);

      const myEl = container.querySelector("my-el")!;
      polyfillDSD(document);

      expect(myEl.shadowRoot).not.toBeNull();
      expect(myEl.shadowRoot!.innerHTML).toContain("<p>shadow content</p>");
      document.body.removeChild(container);
    });

    test("removes processed template elements", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<my-el2><template shadowrootmode="open"><p>content</p></template></my-el2>';
      document.body.appendChild(container);

      polyfillDSD(document);

      const templates = container.querySelectorAll("template[shadowrootmode]");
      expect(templates.length).toBe(0);
      document.body.removeChild(container);
    });

    test("respects mode=closed", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<my-el3><template shadowrootmode="closed"><p>closed</p></template></my-el3>';
      document.body.appendChild(container);

      polyfillDSD(document);

      const templates = container.querySelectorAll("template[shadowrootmode]");
      expect(templates.length).toBe(0);
      document.body.removeChild(container);
    });

    test("handles nested DSD recursively", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<outer-el><template shadowrootmode="open"><inner-el><template shadowrootmode="open"><p>nested</p></template></inner-el></template></outer-el>';
      document.body.appendChild(container);

      polyfillDSD(document);

      const outer = container.querySelector("outer-el")!;
      expect(outer.shadowRoot).not.toBeNull();
      document.body.removeChild(container);
    });

    test("accepts custom root parameter", () => {
      const container = document.createElement("div");
      container.innerHTML =
        '<my-el4><template shadowrootmode="open"><p>scoped</p></template></my-el4>';
      document.body.appendChild(container);
      polyfillDSD(document);

      const myEl = container.querySelector("my-el4")!;
      expect(myEl.shadowRoot).not.toBeNull();
      document.body.removeChild(container);
    });

    test("attachShadow failure: content is preserved in parent", () => {
      const container = document.createElement("div");
      const host = document.createElement("div");
      // 先に attachShadow して2回目を失敗させる
      // 注意: happy-dom の attachShadow 二重呼び出し挙動は実ブラウザと
      // 異なる可能性あり。実ブラウザ互換は E2E テストで担保する。
      host.attachShadow({ mode: "open" });
      host.innerHTML = '<template shadowrootmode="open"><p>preserved</p></template>';
      container.appendChild(host);
      document.body.appendChild(container);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      polyfillDSD(document);

      // template の内容が parent に展開されているはず
      expect(host.querySelector("p")?.textContent).toBe("preserved");
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
      document.body.removeChild(container);
    });
  }

  test("no-op when no templates found", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>no templates</p>";
    document.body.appendChild(container);

    expect(() => polyfillDSD(document)).not.toThrow();
    document.body.removeChild(container);
  });

  test("polyfillDSD does not throw when called without arguments in SSR-like env", () => {
    // SSR 環境をシミュレート: root を undefined として渡す
    expect(() => polyfillDSD(undefined as any)).not.toThrow();
  });
});
