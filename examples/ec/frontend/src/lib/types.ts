export type Product = {
  id: string; name: string; price: number; description: string;
  image: string; category: "sandals" | "leather" | "sneakers" | "sport"; stock: number;
};
export type CartItem = { productId: string; quantity: number; product: Product | null };
export type Order = {
  id: string; items: Array<{ productId: string; quantity: number; product: Product }>;
  total: number; customer: { name: string; email: string; address: string }; createdAt: string;
};
