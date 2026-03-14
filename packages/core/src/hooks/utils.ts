export function argsChanged(oldArgs: unknown[] | undefined, newArgs: unknown[]): boolean {
  if (!oldArgs) return true
  if (oldArgs.length !== newArgs.length) return true
  return newArgs.some((arg, i) => !Object.is(arg, oldArgs[i]))
}
