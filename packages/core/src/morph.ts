// Scratch morph implementation for sparkle
// Inspired by idiomorph (0BSD) — only the subset needed for Shadow DOM innerHTML morphing

type IdMap = Map<Node, Set<string>>;

// ============================================================
// Entry point
// ============================================================

export function morph(root: Element | ShadowRoot, newHTML: string): void {
  const newContent = parseHTML(newHTML);

  const { persistentIds, idMap } = createIdMaps(root, newContent);

  const activeElements = collectActiveElementChain(root);

  const savedFocus = saveFocusState(root);

  morphChildren(root, newContent, idMap, persistentIds, activeElements);

  restoreFocusState(root, savedFocus);
}

// ============================================================
// HTML parsing
// ============================================================

function parseHTML(html: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

// ============================================================
// ID Maps
// ============================================================

function createIdMaps(
  oldRoot: Element | ShadowRoot,
  newRoot: DocumentFragment,
): { persistentIds: Set<string>; idMap: IdMap } {
  const oldIdElements = Array.from(oldRoot.querySelectorAll("[id]"));
  const newIdElements = Array.from(newRoot.querySelectorAll("[id]"));

  const duplicateIds = new Set<string>();
  const oldIdTagNameMap = new Map<string, string>();
  for (const el of oldIdElements) {
    const id = el.getAttribute("id")!;
    if (oldIdTagNameMap.has(id)) {
      duplicateIds.add(id);
    } else {
      oldIdTagNameMap.set(id, el.tagName);
    }
  }

  const persistentIds = new Set<string>();
  for (const el of newIdElements) {
    const id = el.getAttribute("id")!;
    if (persistentIds.has(id)) {
      duplicateIds.add(id);
    } else if (oldIdTagNameMap.get(id) === el.tagName) {
      persistentIds.add(id);
    }
  }
  for (const id of duplicateIds) {
    persistentIds.delete(id);
  }

  const idMap: IdMap = new Map();
  populateIdMap(idMap, persistentIds, oldRoot, oldIdElements);
  populateIdMap(idMap, persistentIds, newRoot, newIdElements);

  return { persistentIds, idMap };
}

function populateIdMap(
  idMap: IdMap,
  persistentIds: Set<string>,
  root: Node,
  elements: Element[],
): void {
  for (const el of elements) {
    const id = el.getAttribute("id")!;
    if (!persistentIds.has(id)) continue;

    let current: Node | null = el;
    while (current) {
      let idSet = idMap.get(current);
      if (!idSet) {
        idSet = new Set();
        idMap.set(current, idSet);
      }
      idSet.add(id);
      if (current === root) break;
      current =
        (current as Element).parentElement ??
        (current as any).parentNode;
    }
  }
}

// ============================================================
// morphChildren
// ============================================================

function morphChildren(
  oldParent: Node,
  newParent: Node,
  idMap: IdMap,
  persistentIds: Set<string>,
  activeElements: Element[],
): void {
  let actualOld: Node = oldParent;
  let actualNew: Node = newParent;
  if (
    actualOld instanceof HTMLTemplateElement &&
    actualNew instanceof HTMLTemplateElement
  ) {
    actualOld = actualOld.content;
    actualNew = actualNew.content;
  }

  let insertionPoint: Node | null = actualOld.firstChild;

  for (const newChild of Array.from(actualNew.childNodes)) {
    if (insertionPoint) {
      const bestMatch = findBestMatch(
        newChild,
        insertionPoint,
        null,
        idMap,
        activeElements,
      );

      if (bestMatch) {
        if (bestMatch !== insertionPoint) {
          // Move the matched node to the insertion point position
          actualOld.insertBefore(bestMatch, insertionPoint);
        }
        morphNode(bestMatch, newChild, idMap, persistentIds, activeElements);
        insertionPoint = bestMatch.nextSibling;
        continue;
      }
    }

    // Persistent ID long-range match
    if (newChild instanceof Element) {
      const newChildId = newChild.getAttribute("id");
      if (newChildId && persistentIds.has(newChildId)) {
        const found = (actualOld as Element).querySelector?.(
          `[id="${CSS.escape(newChildId)}"]`,
        );
        if (found) {
          actualOld.insertBefore(found, insertionPoint);
          morphNode(found, newChild, idMap, persistentIds, activeElements);
          insertionPoint = found.nextSibling;
          continue;
        }
      }
    }

    // New node insertion
    let insertedNode: Node;
    if (newChild instanceof Element && idMap.has(newChild)) {
      const emptyChild = document.createElement(newChild.tagName);
      actualOld.insertBefore(emptyChild, insertionPoint);
      morphNode(emptyChild, newChild, idMap, persistentIds, activeElements);
      insertedNode = emptyChild;
    } else {
      const cloned = document.importNode(newChild, true);
      actualOld.insertBefore(cloned, insertionPoint);
      insertedNode = cloned;
    }
    insertionPoint = insertedNode.nextSibling;
  }

  // Remove remaining old nodes
  while (insertionPoint) {
    const next = insertionPoint.nextSibling;
    insertionPoint.parentNode?.removeChild(insertionPoint);
    insertionPoint = next;
  }
}

// ============================================================
// findBestMatch
// ============================================================

function findBestMatch(
  newNode: Node,
  startPoint: Node,
  endPoint: Node | null,
  idMap: IdMap,
  activeElements: Element[],
): Node | null {
  let softMatch: Node | null = null;
  let nextSibling = newNode.nextSibling;
  let siblingSoftMatchCount = 0;

  let cursor: Node | null = startPoint;
  while (cursor && cursor !== endPoint) {
    if (isSoftMatch(cursor, newNode)) {
      if (isIdSetMatch(idMap, cursor, newNode)) {
        return cursor; // ID set match — best possible
      }
      if (softMatch === null && !idMap.has(cursor)) {
        softMatch = cursor;
      }
    }

    // Sibling soft match lookahead (detects list prepend)
    if (softMatch === null && nextSibling && isSoftMatch(cursor, nextSibling)) {
      siblingSoftMatchCount++;
      nextSibling = nextSibling.nextSibling;
      if (siblingSoftMatchCount >= 2) {
        // Multiple future siblings match — this is a prepend, don't reuse
        softMatch = undefined as unknown as null;
      }
    }

    // Protect focused element ancestors
    if (activeElements.includes(cursor as Element)) break;

    cursor = cursor.nextSibling;
  }

  return softMatch || null;
}

function isSoftMatch(oldNode: Node, newNode: Node): boolean {
  if (oldNode.nodeType !== newNode.nodeType) return false;
  if (oldNode.nodeType !== 1) {
    // Text/comment nodes match by type alone
    return true;
  }
  const oldElt = oldNode as Element;
  const newElt = newNode as Element;
  if (oldElt.tagName !== newElt.tagName) return false;
  const oldId = oldElt.getAttribute("id");
  if (oldId && oldId !== newElt.getAttribute("id")) return false;
  return true;
}

function isIdSetMatch(idMap: IdMap, oldNode: Node, newNode: Node): boolean {
  const oldSet = idMap.get(oldNode);
  const newSet = idMap.get(newNode);
  if (!oldSet || !newSet) return false;
  for (const id of oldSet) {
    if (newSet.has(id)) return true;
  }
  return false;
}

// ============================================================
// morphNode
// ============================================================

function morphNode(
  oldNode: Node,
  newNode: Node,
  idMap: IdMap,
  persistentIds: Set<string>,
  activeElements: Element[],
): void {
  morphAttributes(oldNode, newNode);

  if (oldNode.nodeType === 1 /* ELEMENT_NODE */) {
    morphChildren(oldNode, newNode, idMap, persistentIds, activeElements);
  }
}

// ============================================================
// morphAttributes
// ============================================================

function morphAttributes(oldNode: Node, newNode: Node): void {
  const type = newNode.nodeType;

  if (type === 1 /* ELEMENT_NODE */) {
    const oldElt = oldNode as Element;
    const newElt = newNode as Element;

    // Set/update attributes
    for (const attr of newElt.attributes) {
      if (oldElt.getAttribute(attr.name) !== attr.value) {
        oldElt.setAttribute(attr.name, attr.value);
      }
    }

    // Remove old attributes not in new
    const oldAttrs = oldElt.attributes;
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const attr = oldAttrs[i];
      if (!attr) continue;
      if (!newElt.hasAttribute(attr.name)) {
        oldElt.removeAttribute(attr.name);
      }
    }

    syncInputValue(oldElt, newElt);
  }

  if (type === 3 /* TEXT_NODE */ || type === 8 /* COMMENT_NODE */) {
    if (oldNode.nodeValue !== newNode.nodeValue) {
      oldNode.nodeValue = newNode.nodeValue;
    }
  }
}

// ============================================================
// syncInputValue
// ============================================================

function syncInputValue(oldElt: Element, newElt: Element): void {
  if (
    oldElt instanceof HTMLInputElement &&
    newElt instanceof HTMLInputElement &&
    newElt.type !== "file"
  ) {
    const newValue = newElt.value;
    const oldValue = oldElt.value;

    if (oldElt.checked !== newElt.checked) {
      oldElt.checked = newElt.checked;
    }
    if (oldElt.disabled !== newElt.disabled) {
      oldElt.disabled = newElt.disabled;
    }

    if (!newElt.hasAttribute("value")) {
      oldElt.value = "";
      oldElt.removeAttribute("value");
    } else if (oldValue !== newValue) {
      oldElt.setAttribute("value", newValue);
      oldElt.value = newValue;
    }
  }

  if (
    oldElt instanceof HTMLOptionElement &&
    newElt instanceof HTMLOptionElement
  ) {
    if (oldElt.selected !== newElt.selected) {
      oldElt.selected = newElt.selected;
    }
  }

  if (
    oldElt instanceof HTMLTextAreaElement &&
    newElt instanceof HTMLTextAreaElement
  ) {
    const newValue = newElt.value;
    if (oldElt.value !== newValue) {
      oldElt.value = newValue;
    }
    if (oldElt.firstChild && oldElt.firstChild.nodeValue !== newValue) {
      oldElt.firstChild.nodeValue = newValue;
    }
  }

  if (
    oldElt instanceof HTMLSelectElement &&
    newElt instanceof HTMLSelectElement
  ) {
    if (oldElt.value !== newElt.value) {
      oldElt.value = newElt.value;
    }
    if (oldElt.selectedIndex !== newElt.selectedIndex) {
      oldElt.selectedIndex = newElt.selectedIndex;
    }
  }
}

// ============================================================
// Focus save/restore
// ============================================================

type SavedFocus = {
  id?: string;
  path?: number[];
  selectionStart: number | null;
  selectionEnd: number | null;
} | null;

function getActiveElement(root: Element | ShadowRoot): Element | null {
  return root instanceof ShadowRoot
    ? root.activeElement
    : document.activeElement;
}

function saveFocusState(root: Element | ShadowRoot): SavedFocus {
  const active = getActiveElement(root);
  if (
    !(
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement
    )
  ) {
    return null;
  }
  const base = {
    selectionStart: active.selectionStart,
    selectionEnd: active.selectionEnd,
  };
  if (active.id) {
    return { id: active.id, ...base };
  }
  // id なし要素は DOM パス（各階層での childIndex）で保存
  // 注意: morph でノードの追加/削除が起きると path がずれて
  // 誤った要素にフォーカスする可能性がある（既知の制限）
  const path: number[] = [];
  let node: Node = active;
  const rootNode = root as unknown as Node;
  while (node && node !== rootNode) {
    const parent = node.parentNode;
    if (!parent) break;
    path.unshift(Array.from(parent.childNodes).indexOf(node as ChildNode));
    node = parent;
  }
  return { path, ...base };
}

function restoreFocusState(
  root: Element | ShadowRoot,
  saved: SavedFocus,
): void {
  if (!saved) return;

  let target: Element | null = null;

  if (saved.id) {
    const currentActive = getActiveElement(root);
    if (saved.id === currentActive?.getAttribute("id")) {
      target = currentActive;
    } else {
      target = root.querySelector(
        `[id="${CSS.escape(saved.id)}"]`,
      );
    }
  } else if (saved.path) {
    let node: Node | null = root as unknown as Node;
    for (const index of saved.path) {
      const child = node!.childNodes[index];
      if (!child) { node = null; break; }
      node = child;
    }
    if (node && node !== root) target = node as Element;
  }

  if (target && target instanceof HTMLElement) {
    target.focus({ preventScroll: true });
  }

  const active = getActiveElement(root);
  if (
    active &&
    saved.selectionEnd != null &&
    (active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement)
  ) {
    if (active.selectionStart !== saved.selectionStart ||
        active.selectionEnd !== saved.selectionEnd) {
      active.setSelectionRange(saved.selectionStart, saved.selectionEnd);
    }
  }
}

// ============================================================
// activeElement chain
// ============================================================

function collectActiveElementChain(root: Element | ShadowRoot): Element[] {
  const chain: Element[] = [];
  let elt = getActiveElement(root);
  if (!elt || elt.tagName === "BODY") return chain;

  if (!(root as unknown as Node).contains(elt)) return chain;

  while (elt) {
    chain.push(elt);
    if ((elt as unknown as Node) === (root as unknown as Node)) break;
    const parent: Node | null = elt.parentNode;
    if (!parent || parent === root) break;
    elt = parent instanceof Element ? parent : null;
  }
  return chain;
}

