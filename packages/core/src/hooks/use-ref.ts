import { nextIndex, getHookState } from "./context.js";

type HookStateWithInit = { value: unknown; _initialized?: true };

export function useRef<T>(initial: T): { current: T } {
  const index = nextIndex();
  const hookState = getHookState(index) as HookStateWithInit;

  if (!hookState._initialized) {
    hookState.value = { current: initial };
    hookState._initialized = true;
  }

  return hookState.value as { current: T };
}
