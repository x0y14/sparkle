import { defineElement, useContext, css } from "@blask/core"
import { CartContext } from "../context/cart-context.js"

const OrderSummary = defineElement(
  {
    tag: "ec-order-summary",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    const cart = useContext(CartContext)
    const totalStr = cart.totalPrice.toLocaleString("ja-JP")
    const itemsHtml =
      cart.items.length > 0
        ? cart.items
            .map((i) => {
              const p = i.product
              if (!p) return ""
              return `<div class="flex justify-between py-3 border-b border-border">
            <span class="font-sans text-xs tracking-wide uppercase text-ink-muted">${p.name} × ${i.quantity}</span>
            <span class="font-display text-base text-ink tabular-nums">¥${(p.price * i.quantity).toLocaleString("ja-JP")}</span>
          </div>`
            })
            .join("")
        : '<p class="font-sans text-sm text-ink-faint py-4">カートは空です</p>'

    return `
      <div>
        <h3 class="font-sans text-[10px] tracking-widest uppercase text-ink-faint mb-6">注文内容</h3>
        ${itemsHtml}
        <div class="border-t border-border pt-8 mt-8">
          <div class="flex justify-between items-baseline">
            <span class="font-sans text-xs tracking-widest uppercase text-ink-muted">合計</span>
            <span class="font-display text-3xl font-300 text-ink">¥${totalStr}</span>
          </div>
        </div>
      </div>`
  },
)
export default OrderSummary
