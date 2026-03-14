import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("products/[id].astro のコンポーネント登録", () => {
  const src = readFileSync(
    resolve(__dirname, "../../src/pages/products/[id].astro"),
    "utf-8",
  );

  test("ec-quantity-selector が <script> タグ内で import されている", () => {
    const scriptMatch = src.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptContent = scriptMatch![1];
    expect(scriptContent).toMatch(
      /import\s+["']\.\.\/\.\.\/components\/ec-quantity-selector/,
    );
  });

  test("フロントマターに ec-quantity-selector の import が残っていない", () => {
    const frontmatter = src.split("---")[1] ?? "";
    expect(frontmatter).not.toMatch(/ec-quantity-selector/);
  });

  test("img に width/height 属性がある", () => {
    expect(src).toMatch(/width=["'{]800["'}]/);
    expect(src).toMatch(/height=["'{]1000["'}]/);
  });
});
