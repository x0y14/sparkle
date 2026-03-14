import { describe, test, expect } from "vitest";

describe("CartContext", () => {
  test("defaultValue が空カート", async () => {
    const { CartContext } = await import("../../src/context/cart-context.js");
    expect(CartContext.defaultValue.items).toHaveLength(0);
    expect(CartContext.defaultValue.totalCount).toBe(0);
    expect(CartContext.defaultValue.totalPrice).toBe(0);
  });

  test("addItem, removeItem, updateQuantity, refresh が関数", async () => {
    const { CartContext } = await import("../../src/context/cart-context.js");
    expect(typeof CartContext.defaultValue.addItem).toBe("function");
    expect(typeof CartContext.defaultValue.removeItem).toBe("function");
    expect(typeof CartContext.defaultValue.updateQuantity).toBe("function");
    expect(typeof CartContext.defaultValue.refresh).toBe("function");
  });

  test("Provider が定義されている", async () => {
    const { CartContext } = await import("../../src/context/cart-context.js");
    expect(CartContext.Provider).toBeDefined();
    expect(typeof CartContext.Provider).toBe("function");
  });
});
