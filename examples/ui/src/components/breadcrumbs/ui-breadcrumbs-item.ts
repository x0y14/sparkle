import { defineElement, css } from "@sparkio/core"

const UiBreadcrumbsItem = defineElement(
  {
    tag: "ui-breadcrumbs-item",
    props: {
      href: { type: String, value: () => "" },
      isCurrent: { type: Boolean, value: () => false },
    },
    styles: css`@unocss-placeholder
:host { @apply inline-flex; }`,
  },
  (props) => {
    const content = props.href && !props.isCurrent
      ? `<a href="${props.href}" class="text-default-400 hover:text-foreground"><slot></slot></a>`
      : `<span class="text-foreground font-medium" ${props.isCurrent ? 'aria-current="page"' : ""}><slot></slot></span>`

    const separator = !props.isCurrent
      ? `<span class="text-default-300 mx-1" aria-hidden="true">/</span>`
      : ""

    return `<li class="flex items-center gap-1 text-sm">${content}${separator}</li>`
  },
)

export default UiBreadcrumbsItem
