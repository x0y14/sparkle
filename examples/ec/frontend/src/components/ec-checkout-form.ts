import { defineElement, useState, useContext, useHost, useEffect, css } from "@blask/core"
import { CartContext } from "../context/cart-context.js"

const CheckoutForm = defineElement(
  {
    tag: "ec-checkout-form",
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const host = useHost()
    const cart = useContext(CartContext)

    useEffect(() => {
      const root = host.current.shadowRoot!
      const fieldHandler = (e: Event) => {
        const { name: f, value: v } = (e as CustomEvent<{ name: string; value: string }>).detail
        if (f === "name") setName(v)
        if (f === "email") setEmail(v)
        if (f === "address") setAddress(v)
      }
      const clickHandler = async (e: Event) => {
        const t = (e.target as HTMLElement).closest("[data-action]")
        if (!t || t.getAttribute("data-action") !== "submit") return
        const errs: string[] = []
        if (!name.trim()) errs.push("お名前を入力してください")
        if (!email.trim()) errs.push("メールアドレスを入力してください")
        if (!address.trim()) errs.push("住所を入力してください")
        if (errs.length > 0) {
          setErrors(errs)
          return
        }
        setSubmitting(true)
        setErrors([])
        try {
          const { createOrder } = await import("../lib/api.js")
          const order = await createOrder({ name, email, address })
          cart.refresh()
          window.location.href = `/orders/${order.id}`
        } catch {
          setErrors(["注文の処理中にエラーが発生しました"])
          setSubmitting(false)
        }
      }
      root.addEventListener("field-change", fieldHandler)
      root.addEventListener("click", clickHandler)
      return () => {
        root.removeEventListener("field-change", fieldHandler)
        root.removeEventListener("click", clickHandler)
      }
    }, [name, email, address, submitting])

    const errHtml =
      errors.length > 0
        ? `<div class="border border-red-300 bg-red-50/60 p-5 mb-8" data-testid="errors">${errors.map((e) => `<p class="text-accent-error text-xs tracking-wide">${e}</p>`).join("")}</div>`
        : ""

    return `
      <div>${errHtml}
        <div class="mb-12">
          <ec-order-summary></ec-order-summary>
        </div>
        <div class="border-t border-border pt-8 mb-12">
          <h3 class="font-sans text-[10px] tracking-widest uppercase text-ink-faint mb-6">配送情報</h3>
          <div class="space-y-6">
            <ec-form-field label="お名前" name="name" type="text" value="${name}"></ec-form-field>
            <ec-form-field label="メールアドレス" name="email" type="email" value="${email}"></ec-form-field>
            <ec-form-field label="住所" name="address" rows="3" value="${address}"></ec-form-field>
          </div>
        </div>
        <div class="border-t border-border pt-8">
          <button data-action="submit" class="w-full bg-accent text-white py-4 font-sans text-xs tracking-widest uppercase cursor-pointer border-none hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-wait" ${submitting ? "disabled" : ""}>${submitting ? "処理中..." : "注文を確定する"}</button>
        </div>
      </div>`
  },
)
export default CheckoutForm
