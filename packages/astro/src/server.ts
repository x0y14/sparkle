import { renderToString } from "@sparkle/core";

function getTagName(Component: any, props: Record<string, any>): string {
  if (props._tag) return props._tag;
  if (Component._tag) return Component._tag;
  if (typeof console !== "undefined") {
    console.warn("[sparkle] Component has no tag name, using fallback 'sparkle-component'. Set the 'tag' option in defineElement().");
  }
  return "sparkle-component";
}

export default {
  check(Component: any): boolean {
    return Component?.__sparkle === true;
  },

  async renderToStaticMarkup(
    Component: any,
    props: Record<string, any>,
    slotted: Record<string, any>,
  ): Promise<{ html: string }> {
    const tag = getTagName(Component, props);
    const { _tag, ...cleanProps } = props;
    const html = renderToString(Component, tag, cleanProps, {
      slots: slotted ?? {},
    });
    return { html };
  },

  supportsAstroStaticSlot: true,
};
