import { useHost } from "./use-host.js";
import { useState } from "./use-state.js";
import { useEffect } from "./use-effect.js";

export function useSlot(name?: string): Element[] {
  const { current: host } = useHost();
  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    const shadowRoot = host.shadowRoot;
    if (!shadowRoot) return;

    const selector = name ? `slot[name="${name}"]` : "slot:not([name])";
    const slot = shadowRoot.querySelector(selector) as HTMLSlotElement | null;
    if (!slot) return;

    setElements(slot.assignedElements({ flatten: true }));

    const handler = () => {
      setElements(slot.assignedElements({ flatten: true }));
    };
    slot.addEventListener("slotchange", handler);

    return () => slot.removeEventListener("slotchange", handler);
  }, [name]);

  return elements;
}
