import { defineElement } from "@sparkle/core";

export const StyledElement = defineElement(
  {
    tag: "styled-element",
    // styles に文字列を渡すと defineElement 内部で CSSStyleSheet を作成し
    // shadowRoot.adoptedStyleSheets に追加する
    styles: ":host { display: block; }",
  },
  () =>
    // CSS カスタムプロパティは shadow boundary を越えて継承される（CSS 仕様）
    // ホスト要素の style="--primary: rgb(255,0,0)" から var(--primary) が解決される
    `<p id="styled-text" style="color: var(--primary, black)">Themed</p>`,
);
