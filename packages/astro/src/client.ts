const UNSAFE_PROPS = new Set([
  "innerHTML",
  "outerHTML",
  "textContent",
  "innerText",
  "__proto__",
  "constructor",
  "prototype",
])

function isUnsafeProp(key: string): boolean {
  return UNSAFE_PROPS.has(key) || key.startsWith("on")
}

export default (element: HTMLElement) => {
  return async (
    _Component: any,
    props: Record<string, unknown>,
    // Slots are handled by Web Components via Declarative Shadow DOM (DSD).
    // The browser natively distributes slotted content, so no action is needed here.
    _slotted: Record<string, any>,
  ) => {
    // Astro passes the <astro-island> wrapper as `element`.
    // The actual Sparkle component is its first child element.
    const component = (element.firstElementChild as HTMLElement) ?? element
    const schema = (component.constructor as any)?._propsSchema
    const hasSchema =
      schema &&
      typeof schema === "object" &&
      !Array.isArray(schema) &&
      Object.keys(schema).length > 0

    // Set props that may not be reflected as attributes (e.g., Object/Array)
    for (const [key, value] of Object.entries(props)) {
      if (hasSchema) {
        // Schema exists: only allow keys defined as own properties in schema
        if (Object.prototype.hasOwnProperty.call(schema, key) && key in component) {
          ;(component as any)[key] = value
        }
      } else {
        // No schema (or empty schema): block dangerous properties
        if (key in component && !isUnsafeProp(key)) {
          ;(component as any)[key] = value
        }
      }
    }
  }
}
