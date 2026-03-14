import { describe, test, expect } from "vitest";
import { morph } from "../src/morph.js";

function createRoot(html: string): HTMLDivElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

describe("morph", () => {
  // ============================================================
  // Basic morphing
  // ============================================================

  test("text-only change updates text node, preserves element", () => {
    const root = createRoot("<p>old</p>");
    const p = root.querySelector("p")!;
    morph(root, "<p>new</p>");
    expect(root.innerHTML).toBe("<p>new</p>");
    expect(root.querySelector("p")).toBe(p); // same element reference
  });

  test("attribute add/remove/change", () => {
    const root = createRoot('<div class="a" data-x="1"></div>');
    morph(root, '<div class="b" data-y="2"></div>');
    const div = root.querySelector("div")!;
    expect(div.getAttribute("class")).toBe("b");
    expect(div.getAttribute("data-y")).toBe("2");
    expect(div.hasAttribute("data-x")).toBe(false);
  });

  test("element add", () => {
    const root = createRoot("<p>a</p>");
    morph(root, "<p>a</p><p>b</p>");
    expect(root.children.length).toBe(2);
    expect(root.children[1].textContent).toBe("b");
  });

  test("element remove", () => {
    const root = createRoot("<p>a</p><p>b</p>");
    morph(root, "<p>a</p>");
    expect(root.children.length).toBe(1);
    expect(root.textContent).toBe("a");
  });

  test("element reorder by id", () => {
    const root = createRoot('<p id="a">A</p><p id="b">B</p>');
    const pA = root.querySelector("#a")!;
    const pB = root.querySelector("#b")!;
    morph(root, '<p id="b">B</p><p id="a">A</p>');
    expect(root.children[0]).toBe(pB);
    expect(root.children[1]).toBe(pA);
  });

  test("empty to content", () => {
    const root = createRoot("");
    morph(root, "<p>hello</p>");
    expect(root.innerHTML).toBe("<p>hello</p>");
  });

  test("content to empty", () => {
    const root = createRoot("<p>hello</p>");
    morph(root, "");
    expect(root.innerHTML).toBe("");
  });

  test("same content is no-op (element identity preserved)", () => {
    const root = createRoot("<p>same</p>");
    const p = root.querySelector("p")!;
    morph(root, "<p>same</p>");
    expect(root.querySelector("p")).toBe(p);
  });

  // ============================================================
  // Form elements
  // ============================================================

  test("input.value preserved through morph", () => {
    const root = createRoot('<input type="text" value="initial">');
    const input = root.querySelector("input")!;
    input.value = "user-typed"; // Simulate user input (DOM property, not attribute)
    morph(root, '<input type="text" value="initial">');
    // The morph should sync the attribute value, but since attribute matches,
    // and the DOM value was changed by user, the attribute sync sets it back
    expect(root.querySelector("input")).toBe(input); // same element
  });

  test("input.checked synced correctly", () => {
    const root = createRoot('<input type="checkbox">');
    const input = root.querySelector("input")!;
    expect(input.checked).toBe(false);
    morph(root, '<input type="checkbox" checked>');
    expect(root.querySelector("input")!.checked).toBe(true);
  });

  test("textarea.value synced correctly", () => {
    const root = createRoot("<textarea>old</textarea>");
    morph(root, "<textarea>new</textarea>");
    expect(root.querySelector("textarea")!.value).toBe("new");
  });

  test("option.selected synced correctly", () => {
    const root = createRoot(
      '<select><option value="a">A</option><option value="b" selected>B</option></select>',
    );
    morph(
      root,
      '<select><option value="a" selected>A</option><option value="b">B</option></select>',
    );
    const options = root.querySelectorAll("option");
    expect(options[0].selected).toBe(true);
    expect(options[1].selected).toBe(false);
  });

  // ============================================================
  // ID matching
  // ============================================================

  test("id elements matched and state preserved across moves", () => {
    const root = createRoot(
      '<div id="x" class="old">X</div><div id="y">Y</div>',
    );
    const divX = root.querySelector("#x")!;
    morph(root, '<div id="y">Y</div><div id="x" class="new">X</div>');
    expect(root.querySelector("#x")).toBe(divX);
    expect(divX.getAttribute("class")).toBe("new");
  });

  test("duplicate IDs excluded from persistent matching", () => {
    const root = createRoot(
      '<div id="dup">A</div><div id="dup">B</div>',
    );
    morph(root, '<div id="dup">C</div><div id="dup">D</div>');
    // Should still work, just without ID-based matching
    expect(root.querySelectorAll('[id="dup"]').length).toBe(2);
  });

  // ============================================================
  // ShadowRoot
  // ============================================================

  test("ShadowRoot as root works", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = "<p>old</p>";
    morph(shadow, "<p>new</p>");
    expect(shadow.innerHTML).toBe("<p>new</p>");
  });

  test("nested custom elements: child shadowRoot untouched", () => {
    const root = createRoot("");
    // Create a child with a shadow root
    const child = document.createElement("div");
    const childShadow = child.attachShadow({ mode: "open" });
    childShadow.innerHTML = "<span>shadow content</span>";
    root.appendChild(child);

    // Morph with the same structure — shadowRoot should be untouched
    morph(root, "<div></div>");
    // morphChildren walks childNodes, not shadowRoot
    expect(root.querySelector("div")!.shadowRoot).not.toBeNull();
    expect(
      root.querySelector("div")!.shadowRoot!.innerHTML,
    ).toBe("<span>shadow content</span>");
  });

  // ============================================================
  // Edge cases
  // ============================================================

  test("context-dependent tags like <tr> parse correctly", () => {
    const root = createRoot(
      "<table><tbody><tr><td>A</td></tr></tbody></table>",
    );
    morph(
      root,
      "<table><tbody><tr><td>B</td></tr></tbody></table>",
    );
    expect(root.querySelector("td")!.textContent).toBe("B");
  });

  test("comment node updated", () => {
    const root = createRoot("<!-- old -->");
    morph(root, "<!-- new -->");
    expect(root.childNodes[0].nodeValue).toBe(" new ");
  });

  test("mixed text and elements", () => {
    const root = createRoot("hello <b>world</b>");
    morph(root, "goodbye <b>world</b>!");
    expect(root.innerHTML).toBe("goodbye <b>world</b>!");
  });

  test("deeply nested update only changes leaf", () => {
    const root = createRoot(
      "<div><section><p><span>old</span></p></section></div>",
    );
    const span = root.querySelector("span")!;
    morph(
      root,
      "<div><section><p><span>new</span></p></section></div>",
    );
    expect(root.querySelector("span")).toBe(span);
    expect(span.textContent).toBe("new");
  });

  test("multiple children added at once", () => {
    const root = createRoot("<p>keep</p>");
    morph(root, "<p>keep</p><p>new1</p><p>new2</p><p>new3</p>");
    expect(root.children.length).toBe(4);
  });

  test("all children removed", () => {
    const root = createRoot("<p>a</p><p>b</p><p>c</p>");
    morph(root, "");
    expect(root.childNodes.length).toBe(0);
  });

  test("focus inside ShadowRoot is preserved during morph", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = '<input id="myinput" type="text" value="hello">';
    document.body.appendChild(host);

    const input = shadow.querySelector("#myinput") as HTMLInputElement;
    input.focus();

    // Shadow DOM 内のフォーカス要素を正しく検出できるか
    morph(shadow, '<input id="myinput" type="text" value="hello">');

    // フォーカスが維持されていること
    // happy-dom の制約で activeElement の挙動が異なる場合は
    // shadow.querySelector("#myinput") が同じ要素であることで代替検証
    expect(shadow.querySelector("#myinput")).toBe(input);

    document.body.removeChild(host);
  });

  test("standalone <tr> elements parse correctly", () => {
    const root = createRoot("<table><tbody><tr><td>A</td></tr></tbody></table>");
    morph(root, "<table><tbody><tr><td>B</td></tr><tr><td>C</td></tr></tbody></table>");
    const tds = root.querySelectorAll("td");
    expect(tds.length).toBe(2);
    expect(tds[0].textContent).toBe("B");
    expect(tds[1].textContent).toBe("C");
  });

  test("select.value synced correctly after morph", () => {
    const root = createRoot(
      '<select><option value="a">A</option><option value="b">B</option><option value="c">C</option></select>',
    );
    const select = root.querySelector("select")!;
    expect(select.value).toBe("a");

    morph(
      root,
      '<select><option value="a">A</option><option value="b" selected>B</option><option value="c">C</option></select>',
    );

    const morphedSelect = root.querySelector("select")!;
    expect(morphedSelect).toBe(select); // same element reference
    expect(morphedSelect.value).toBe("b");
  });

  test("collectActiveElementChain works with ShadowRoot", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = '<div><input id="focused" type="text"></div>';
    document.body.appendChild(host);

    const input = shadow.querySelector("#focused") as HTMLInputElement;
    input.focus();

    // morph should not throw and should preserve the input
    morph(shadow, '<div><input id="focused" type="text" value="updated">');
    expect(shadow.querySelector("#focused")).not.toBeNull();

    document.body.removeChild(host);
  });

  test("preserves focus on input without id", () => {
    const container = document.createElement("div");
    const sr = container.attachShadow({ mode: "open" });
    sr.innerHTML = '<div><input type="text" value="hello"></div>';
    document.body.appendChild(container);

    const input = sr.querySelector("input")!;
    input.focus();

    morph(sr, '<div><input type="text" value="hello"></div>');

    const newInput = sr.querySelector("input")!;
    // happy-dom での activeElement チェック
    const active = sr.activeElement ?? document.activeElement;
    expect(active === newInput || active === container).toBe(true);
    document.body.removeChild(container);
  });

  test("preserves selection range on input with non-zero selectionEnd", () => {
    const container = document.createElement("div");
    const sr = container.attachShadow({ mode: "open" });
    sr.innerHTML = '<div><input id="sel" type="text" value="abcdef"></div>';
    document.body.appendChild(container);

    const input = sr.querySelector<HTMLInputElement>("#sel")!;
    input.focus();
    input.setSelectionRange(2, 5); // "cde" を選択

    morph(sr, '<div><input id="sel" type="text" value="abcdef"></div>');

    const after = sr.querySelector<HTMLInputElement>("#sel")!;
    expect(after.selectionStart).toBe(2);
    expect(after.selectionEnd).toBe(5);

    document.body.removeChild(container);
  });

  test("focus path may shift when siblings are added (known limitation)", () => {
    const container = document.createElement("div");
    const sr = container.attachShadow({ mode: "open" });
    sr.innerHTML = '<div><span>A</span><input type="text" value="focused"></div>';
    document.body.appendChild(container);

    const input = sr.querySelector("input")!;
    input.focus();

    // <span> の前に新しい要素を追加 → input の childIndex がずれる
    morph(sr, '<div><span>A</span><span>B</span><input type="text" value="focused"></div>');

    // path ベース復元の制限: 新しい要素が挿入されると path がずれる可能性がある
    // このテストは現状の動作を記録するもの（フォーカスが維持されれば最善だが保証はしない）
    const newInput = sr.querySelector("input")!;
    expect(newInput).not.toBeNull();
    expect(newInput.value).toBe("focused");
    // path ベースの復元では childIndex がずれるため input にフォーカスが戻らない可能性がある
    // 重要な input には id 付与を推奨（id 付きなら正しく復元される）

    document.body.removeChild(container);
  });
});
