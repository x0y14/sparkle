import { createContext } from "@blask/core"
import type { CartItem } from "../lib/types.js"

export type CartContextValue = {
  items: CartItem[]
  totalCount: number
  totalPrice: number
  addItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  refresh: () => void
}

export const CartContext = createContext<CartContextValue>(
  {
    items: [],
    totalCount: 0,
    totalPrice: 0,
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    refresh: () => {},
  },
  "ec-cart-provider",
)
