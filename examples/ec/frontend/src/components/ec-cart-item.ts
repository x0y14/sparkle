import { defineElement, useContext, useHost, useEffect, css } from "@blask/core"
import { CartContext } from "../context/cart-context.js"

const CartItemEl = defineElement(
  {
    tag: "ec-cart-item",
    props: {
      productId: { type: String },
      name: { type: String },
      price: { type: Number, value: () => 0 },
      quantity: { type: Number, value: () => 1 },
      image: { type: String },
      stock: { type: Number, value: () => 99 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const host = useHost()
    const cart = useContext(CartContext)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const clickHandler = (e: Event) => {
        const t = (e.target as HTMLElement).closest("[data-action]")
        if (t?.getAttribute("data-action") === "remove") cart.removeItem(props.productId)
      }
      const qtyHandler = (e: Event) =>
        cart.updateQuantity(props.productId, (e as CustomEvent<number>).detail)
      root.addEventListener("click", clickHandler)
      root.addEventListener("quantity-change", qtyHandler)
      return () => {
        root.removeEventListener("click", clickHandler)
        root.removeEventListener("quantity-change", qtyHandler)
      }
    }, [props.productId])

    const subtotal = (props.price * props.quantity).toLocaleString("ja-JP")
    return `
      <div class="flex items-center gap-6 py-6 border-b border-border">
        <div class="w-24 h-30 overflow-hidden bg-surface-warm flex-shrink-0">
          <img src="${props.image}" alt="${props.name}" width="96" height="120" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-sans text-xs tracking-wide uppercase text-ink-muted">${props.name}</h3>
          <p class="mt-1 font-display text-base text-ink">¥${(props.price ?? 0).toLocaleString("ja-JP")}</p>
        </div>
        <ec-quantity-selector value="${props.quantity}" min="1" max="${props.stock}"></ec-quantity-selector>
        <p class="font-display text-base text-ink w-28 text-right tabular-nums">¥${subtotal}</p>
        <button data-action="remove" class="font-sans text-[10px] tracking-widest uppercase text-ink-faint hover:text-accent-error transition-colors cursor-pointer border-none bg-transparent">削除</button>
      </div>`
  },
)
export default CartItemEl
