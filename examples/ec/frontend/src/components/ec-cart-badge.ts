import { defineElement, useContext, css } from "@sparkio/core"
import { CartContext } from "../context/cart-context.js"

const cartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1" fill="currentColor"/><circle cx="19" cy="21" r="1" fill="currentColor"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>`

const CartBadge = defineElement(
  {
    tag: "ec-cart-badge",
    styles: css`@unocss-placeholder
:host { @apply inline-flex items-center; }`,
  },
  () => {
    const cart = useContext(CartContext)
    if (cart.totalCount === 0) {
      return `<a href="/cart" class="no-underline text-ink-muted hover:text-ink transition-colors">${cartIcon}</a>`
    }
    return `
      <a href="/cart" class="no-underline relative text-ink-muted hover:text-ink transition-colors">
        ${cartIcon}
        <span class="absolute -top-2 -right-3 bg-accent text-white text-[10px] font-500 rounded-full min-w-4 h-4 flex items-center justify-center px-1 leading-none" data-testid="badge-count">${cart.totalCount}</span>
      </a>`
  },
)
export default CartBadge
