import { getCurrent } from "./context.js";
import { useRef } from "./use-ref.js";

export function useHost(): { current: HTMLElement } {
  const ctx = getCurrent();
  return useRef(ctx.host);
}
