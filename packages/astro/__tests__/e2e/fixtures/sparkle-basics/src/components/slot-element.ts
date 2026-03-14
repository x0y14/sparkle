import { defineElement, useSlot } from "@sparkle/core"

const SlotElement = defineElement(
  {
    tag: "slot-element",
  },
  () => {
    const elements = useSlot()
    return `<span id="slot-count">${elements.length}</span><slot></slot>`
  },
)

export default SlotElement
