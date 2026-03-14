import { defineElement, useState, useEffect } from "@sparkio/core"

const LazyElement = defineElement(
  {
    tag: "lazy-element",
  },
  () => {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
      setHydrated(true)
    }, [])

    return `<span id="lazy-status">${hydrated ? "hydrated" : "pending"}</span>`
  },
)

export default LazyElement
