import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("cart.astro のコンポーネント登録", () => {
  const src = readFileSync(
    resolve(__dirname, "../../src/pages/cart.astro"),
    "utf-8",
  );

  test("ec-cart-item が <script> タグ内で import されている", () => {
    const scriptMatch = src.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptContent = scriptMatch![1];
    expect(scriptContent).toMatch(
      /import\s+["']\.\.\/components\/ec-cart-item/,
    );
  });

  test("ec-quantity-selector が <script> タグ内で import されている", () => {
    const scriptMatch = src.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);
    const scriptContent = scriptMatch![1];
    expect(scriptContent).toMatch(
      /import\s+["']\.\.\/components\/ec-quantity-selector/,
    );
  });

  test("cart.astro が cart-changed イベントをリッスンしている", () => {
    expect(src).toContain("cart-changed");
  });

  test("フロントマターにコンポーネント import が残っていない", () => {
    const frontmatter = src.split("---")[1] ?? "";
    expect(frontmatter).not.toMatch(/ec-cart-item/);
    expect(frontmatter).not.toMatch(/ec-quantity-selector/);
  });
});
