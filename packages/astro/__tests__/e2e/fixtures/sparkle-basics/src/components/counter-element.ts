import { defineElement, useState, useHost, useEffect } from "@sparkle/core"

const CounterElement = defineElement(
  {
    tag: "counter-element",
  },
  () => {
    const [count, setCount] = useState(0)
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const btn = root.querySelector("#btn") as HTMLButtonElement | null
      if (!btn) return
      const handler = () => setCount((prev) => prev + 1)
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    }, [count])

    return `<span id="count">${count}</span><button id="btn">+</button>`
  },
)

export default CounterElement
