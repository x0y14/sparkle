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

    // Set props that may not be reflected as attributes (e.g., Object/Array)
    for (const [key, value] of Object.entries(props)) {
      if (key in component) {
        ;(component as any)[key] = value
      }
    }
  }
}
