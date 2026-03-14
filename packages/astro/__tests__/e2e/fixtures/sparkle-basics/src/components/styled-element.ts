import { defineElement, css } from "@sparkle/core"

const StyledElement = defineElement(
  {
    tag: "styled-element",
    styles: css`
      #styled-text {
        color: var(--primary);
      }
    `,
  },
  () => {
    return `<span id="styled-text">styled</span>`
  },
)

export default StyledElement
