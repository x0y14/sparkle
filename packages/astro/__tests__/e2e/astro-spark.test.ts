import { test, expect } from "@playwright/test";

/**
 * Shadow DOM 内の要素のテキストコンテンツを取得するヘルパー
 *
 * Playwright の CSS セレクタは open shadow DOM を自動ピアスするが、
 * page.evaluate() の方が実行タイミング制御と信頼性が高い。
 * 参照: refs/astro/packages/astro/e2e/ での page.evaluate パターン
 */
async function shadowText(
  page: import("@playwright/test").Page,
  hostSelector: string,
  innerSelector: string,
): Promise<string | null> {
  return page.evaluate(
    ([host, inner]) => {
      const el = document
        .querySelector(host)
        ?.shadowRoot?.querySelector(inner);
      return el?.textContent ?? null;
    },
    [hostSelector, innerSelector] as const,
  );
}

test.describe("Astro + sparkle E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ---------------------------------------------------------------------------
  // E1: SSR — DSD テンプレートが HTML に出力されている
  // ---------------------------------------------------------------------------
  test("SSR output contains DSD template", async ({ page }) => {
    // page.content() は JS 実行後の DOM を返すため DSD template は処理済みで存在しない
    // response.text() でサーバーからの生 HTML を取得する
    const response = await page.goto("/");
    const html = await response!.text();
    expect(html).toContain('shadowrootmode="open"');
    expect(html).toContain("counter-element");
  });

  // ---------------------------------------------------------------------------
  // E2: client:load — ページロード後に即 hydration、ボタンが動作する
  // ---------------------------------------------------------------------------
  test("client:load hydrates component", async ({ page }) => {
    // connectedCallback → scheduleUpdate → useEffect までの非同期処理を待つ
    await page.waitForFunction(
      () =>
        document
          .querySelector("counter-element")
          ?.shadowRoot?.querySelector("#btn") != null,
      { timeout: 5_000 },
    );

    // ボタンクリックで count 0 → 1
    await page.evaluate(() => {
      (
        document
          .querySelector("counter-element")
          ?.shadowRoot?.querySelector("#btn") as HTMLButtonElement
      )?.click();
    });

    const count = await shadowText(page, "counter-element", "#count");
    expect(count).toBe("1");
  });

  // ---------------------------------------------------------------------------
  // E3: client:visible — viewport 内に入ったときに hydration
  // ---------------------------------------------------------------------------
  test("client:visible hydrates when entering viewport", async ({ page }) => {
    // スクロールで lazy-element を viewport 内に入れる
    await page.evaluate(() => {
      document
        .querySelector("lazy-element")
        ?.scrollIntoView({ behavior: "instant" });
    });

    // useEffect が実行されて "hydrated" になるまで待つ
    // Astro の client:visible は IntersectionObserver で JS を遅延ロードするため
    // hydration 完了には少し時間がかかる場合がある
    await page.waitForFunction(
      () =>
        document
          .querySelector("lazy-element")
          ?.shadowRoot?.querySelector("#lazy-status")?.textContent ===
        "hydrated",
      { timeout: 10_000 },
    );

    const text = await shadowText(page, "lazy-element", "#lazy-status");
    expect(text).toBe("hydrated");
  });

  // ---------------------------------------------------------------------------
  // E4: class:list — ホスト要素に class が正しく適用されている
  // ---------------------------------------------------------------------------
  test("class:list applies to host element", async ({ page }) => {
    // class:list は Astro コンパイル時に class="host-class active" に変換される
    // renderToStaticMarkup が class 属性を host 要素 <counter-element> に付与する
    const el = page.locator("counter-element");
    await expect(el).toHaveClass(/host-class/);
    await expect(el).toHaveClass(/active/);
  });

  // ---------------------------------------------------------------------------
  // E5: CSS custom properties — shadow DOM 内で var() が解決される
  // ---------------------------------------------------------------------------
  test("CSS custom properties cascade into shadow DOM", async ({ page }) => {
    // ホスト要素の style="--primary: rgb(255, 0, 0)" が
    // shadow DOM 内の var(--primary) として解決されることを検証
    // CSS custom properties は shadow boundary を越えて継承される（CSS 仕様）
    const color = await page.evaluate(() => {
      const host = document.querySelector("styled-element");
      const inner = host?.shadowRoot?.querySelector(
        "#styled-text",
      ) as HTMLElement | null;
      return inner ? getComputedStyle(inner).color : null;
    });
    expect(color).toBe("rgb(255, 0, 0)");
  });

  // ---------------------------------------------------------------------------
  // E6: useEvent — CustomEvent が bubbles/composed で document まで届く
  // ---------------------------------------------------------------------------
  test("useEvent dispatches CustomEvent with bubbles and composed", async ({
    page,
  }) => {
    // document レベルでイベントを listen し、ボタンクリックで発火を確認
    // composed: true で shadow boundary を越え、bubbles: true で document まで伝播する
    const eventPromise = page.evaluate(
      () =>
        new Promise<{ bubbles: boolean; composed: boolean }>((resolve) => {
          document.addEventListener(
            "sparkle:ping",
            (e) => {
              const ce = e as CustomEvent;
              resolve({ bubbles: ce.bubbles, composed: ce.composed });
            },
            { once: true },
          );
        }),
    );

    // shadow DOM 内のボタンを直接クリック
    await page.evaluate(() => {
      (
        document
          .querySelector("event-element")
          ?.shadowRoot?.querySelector("#event-btn") as HTMLButtonElement
      )?.click();
    });

    const info = await eventPromise;
    expect(info.bubbles).toBe(true);
    expect(info.composed).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // E7: useSlot — assignedElements の数が shadow DOM 内に反映される
  // ---------------------------------------------------------------------------
  test("useSlot reflects slot content count", async ({ page }) => {
    // useSlot() 動作:
    // 初回レンダー: count=0 (useState の初期値)
    // useEffect 実行: slot.assignedElements() で 2 要素取得 → setElements → 再レンダー
    // 再レンダー: count=2
    await page.waitForFunction(
      () =>
        document
          .querySelector("slot-element")
          ?.shadowRoot?.querySelector("#slot-count")?.textContent === "2",
      { timeout: 5_000 },
    );

    const count = await shadowText(page, "slot-element", "#slot-count");
    expect(count).toBe("2");
  });

  // ---------------------------------------------------------------------------
  // E8: adoptedStyleSheets — shadow DOM に CSS シートが適用されている
  // ---------------------------------------------------------------------------
  test("adoptedStyleSheets apply inside shadow DOM", async ({ page }) => {
    // defineElement の styles オプションで CSSStyleSheet が作成・適用される
    const hasSheet = await page.evaluate(() => {
      const host = document.querySelector("styled-element");
      return (host?.shadowRoot?.adoptedStyleSheets?.length ?? 0) > 0;
    });
    expect(hasSheet).toBe(true);
  });
});
