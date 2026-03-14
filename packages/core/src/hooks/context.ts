export type HookState = {
  value: unknown;
  deps?: unknown[];
  cleanup?: (() => void) | void;
};

export type HookContext = {
  host: HTMLElement;
  hooks: HookState[];
  update: () => void;
  isSSR?: boolean;
  _scheduler?: import("./scheduler.js").RenderScheduler;
};

type ContextFrame = { ctx: HookContext; index: number };
const contextStack: ContextFrame[] = [];
let currentContext: HookContext | null = null;
let hookIndex: number = 0;

export function setCurrent(ctx: HookContext): void {
  if (currentContext !== null) {
    contextStack.push({ ctx: currentContext, index: hookIndex });
  }
  currentContext = ctx;
  hookIndex = 0;
}

export function clear(): void {
  const prev = contextStack.pop();
  if (prev) {
    currentContext = prev.ctx;
    hookIndex = prev.index;
  } else {
    currentContext = null;
    hookIndex = 0;
  }
}

/** Fully reset context state. Intended for test isolation only. */
export function resetAll(): void {
  currentContext = null;
  hookIndex = 0;
  contextStack.length = 0;
}

export function getCurrent(): HookContext {
  if (currentContext === null) {
    throw new Error("Hook called outside of component render");
  }
  return currentContext;
}

export function nextIndex(): number {
  return hookIndex++;
}

export function getHookState(index: number): HookState {
  const ctx = getCurrent();
  if (index >= ctx.hooks.length) {
    ctx.hooks.push({ value: undefined });
  }
  return ctx.hooks[index]!;
}

export function runInContext<T>(ctx: HookContext, fn: () => T): T {
  setCurrent(ctx);
  try {
    return fn();
  } finally {
    clear();
  }
}
