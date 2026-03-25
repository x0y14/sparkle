import { defineElement, css } from "@sparkio/core"
import * as V from "./variants"

const UiAvatar = defineElement(
  {
    tag: "ui-avatar",
    props: {
      src: { type: String, value: () => "" },
      name: { type: String, value: () => "" },
      size: { type: String, value: () => "md" },
      color: { type: String, value: () => "default" },
      radius: { type: String, value: () => "full" },
      isBordered: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply flex items-center justify-center; width: 100%; height: 100%; }`,
  },
  (props) => {
    const sizeClass = V.avatarSize[props.size as V.Size] || V.avatarSize.md
    const radiusClass = V.radius[props.radius as V.Radius] || V.radius.full
    const colorClass = V.solid[props.color as V.Color] || V.solid.default
    const borderedClass = props.isBordered ? "ring-2 ring-offset-2" : ""
    const initials = props.name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const content = props.src
      ? `<img src="${props.src}" alt="${props.name}" class="w-full h-full object-cover">`
      : `<span class="font-medium uppercase">${initials}</span>`

    return `<div class="relative inline-flex items-center justify-center overflow-hidden ${sizeClass} ${radiusClass} ${borderedClass} ${colorClass}">${content}</div>`
  },
)

export default UiAvatar
