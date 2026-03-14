import { defineElement, useState, useHost, useEffect, useEvent, css } from "@sparkio/core"

const AddToCart = defineElement(
  {
    tag: "ec-add-to-cart",
    props: {
      productId: { type: String },
      stock: { type: Number, value: () => 0 },
      price: { type: Number, value: () => 0 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [added, setAdded] = useState(false)
    const dispatch = useEvent<{ productId: string; quantity: number }>("cart-add", {
      bubbles: true,
      composed: true,
    })
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handler = async (e: Event) => {
        const target = (e.target as HTMLElement).closest("[data-action]")
        if (!target || target.getAttribute("data-action") !== "add-to-cart" || adding) return
        setAdding(true)
        try {
          const { addToCart } = await import("../lib/api.js")
          await addToCart(props.productId, quantity)
          dispatch({ productId: props.productId, quantity })
          setAdded(true)
          setTimeout(() => setAdded(false), 2000)
        } finally {
          setAdding(false)
        }
      }
      root.addEventListener("click", handler)
      return () => root.removeEventListener("click", handler)
    }, [quantity, props.productId, adding])

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handler = (e: Event) => setQuantity((e as CustomEvent<number>).detail)
      root.addEventListener("quantity-change", handler)
      return () => root.removeEventListener("quantity-change", handler)
    }, [])

    const btnText = added ? "追加しました ✓" : adding ? "追加中..." : "カートに追加"
    const btnBg = added
      ? "bg-accent-success text-white"
      : "bg-accent text-white hover:bg-accent-hover"
    return `
      <div class="flex items-center gap-6">
        <ec-quantity-selector value="${quantity}" min="1" max="${props.stock}"></ec-quantity-selector>
        <button data-action="add-to-cart" class="h-10 px-10 font-sans text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer border-none disabled:cursor-wait ${btnBg}" ${adding ? "disabled" : ""}>${btnText}</button>
      </div>`
  },
)
export default AddToCart
