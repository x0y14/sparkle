export interface LayoutDragState {
  sourcePath: string
  sourceNodeId: string
  startMouseX: number
  startMouseY: number
  startElementX: number
  startElementY: number
}

export interface DragPosition {
  x: number
  y: number
}

export function beginLayoutDrag(
  sourcePath: string, sourceNodeId: string,
  mouseX: number, mouseY: number,
  elementX: number, elementY: number,
): LayoutDragState {
  return { sourcePath, sourceNodeId, startMouseX: mouseX, startMouseY: mouseY, startElementX: elementX, startElementY: elementY }
}

export function moveLayoutDrag(state: LayoutDragState, mouseX: number, mouseY: number): DragPosition {
  return {
    x: state.startElementX + (mouseX - state.startMouseX),
    y: state.startElementY + (mouseY - state.startMouseY),
  }
}
