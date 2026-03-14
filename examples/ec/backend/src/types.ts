export type Product = {
  id: string; name: string; price: number; description: string;
  image: string; category: "sandals" | "leather" | "sneakers" | "sport"; stock: number;
};
export type CartItem = { productId: string; quantity: number };
export type Cart = { sessionId: string; items: CartItem[] };
export type OrderItem = CartItem & { product: Product };
export type Order = {
  id: string; items: OrderItem[]; total: number;
  customer: { name: string; email: string; address: string }; createdAt: string;
};
