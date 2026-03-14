import { defineElement, useState, useEffect, useCallback, useHost } from "@sparkio/core"
import { CartContext, type CartContextValue } from "../context/cart-context.js"
import type { CartItem } from "../lib/types.js"

const CartProviderApp = defineElement({ tag: "ec-cart-provider-app" }, () => {
  const [items, setItems] = useState<CartItem[]>([])
  const host = useHost()

  const refresh = useCallback(async () => {
    try {
      const { fetchCart } = await import("../lib/api.js")
      const cart = await fetchCart()
      setItems(cart.items)
    } catch {
      /* server not running */
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    const el = host.current
    const handler = () => refresh()
    el.addEventListener("cart-add", handler)
    return () => el.removeEventListener("cart-add", handler)
  }, [])

  const addItem = useCallback(async (productId: string, quantity: number) => {
    const { addToCart } = await import("../lib/api.js")
    await addToCart(productId, quantity)
    await refresh()
  }, [])

  const removeItem = useCallback(async (productId: string) => {
    const { removeCartItem } = await import("../lib/api.js")
    await removeCartItem(productId)
    await refresh()
  }, [])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const { updateCartItem } = await import("../lib/api.js")
    await updateCartItem(productId, quantity)
    await refresh()
  }, [])

  const totalCount = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0)
  const ctx: CartContextValue = {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    refresh,
  }

  useEffect(() => {
    const provider = host.current.shadowRoot?.querySelector("ec-cart-provider") as any
    if (provider) provider.value = ctx
    host.current.dispatchEvent(new CustomEvent("cart-changed", { bubbles: true, composed: true }))
  }, [items])

  return `<ec-cart-provider><slot></slot></ec-cart-provider>`
})
export default CartProviderApp
