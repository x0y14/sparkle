export default (element: HTMLElement) => {
  return async (_Component: any, props: Record<string, unknown>, _slotted: Record<string, any>) => {
    const component = (element.firstElementChild as HTMLElement) ?? element
    const schema = (component.constructor as any)?._propsSchema
    const hasSchema =
      schema &&
      typeof schema === "object" &&
      !Array.isArray(schema) &&
      Object.keys(schema).length > 0

    if (!hasSchema) return

    for (const [key, value] of Object.entries(props)) {
      if (Object.prototype.hasOwnProperty.call(schema, key) && key in component) {
        ;(component as any)[key] = value
      }
    }
  }
}
