import { defineElement, useState, useEffect } from "@sparkle/core"

export const LazyElement = defineElement({ tag: "lazy-element" }, () => {
  // SSR では isSSR=true のため useEffect は実行されない → status="ssr" で出力
  // client:visible で viewport に入ると JS がロードされ connectedCallback が発火
  // → useEffect が実行されて status="hydrated" に更新される
  const [status, setStatus] = useState("ssr")
  useEffect(() => {
    setStatus("hydrated")
  }, [])
  return `<span id="lazy-status">${status}</span>`
})
