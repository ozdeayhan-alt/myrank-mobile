export function devWarn(...args: unknown[]): void {
  if (__DEV__) {
    console.warn(...args);
  }
}
