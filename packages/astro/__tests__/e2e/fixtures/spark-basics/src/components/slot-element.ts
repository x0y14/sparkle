import { defineElement, useSlot } from "@sparkle/core";

export const SlotElement = defineElement(
  { tag: "slot-element" },
  () => {
    // useSlot() の動作:
    // 1. 初回レンダー: useState([]) で items=[] → count=0 を表示
    // 2. useEffect 実行: <slot> を見つけ assignedElements() で slotted 要素を取得
    //    → setElements([A, B]) → 再レンダートリガー
    // 3. 再レンダー: items=[A, B] → count=2 を表示
    const items = useSlot();
    return `<slot></slot><span id="slot-count">${items.length}</span>`;
  },
);
