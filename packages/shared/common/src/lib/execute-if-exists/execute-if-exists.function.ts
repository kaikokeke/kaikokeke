// eslint-disable @typescript-eslint/no-explicit-any

/**
 * Execute a method if exists.
 * @param obj The object of the method to execute.
 * @param method The method to execute.
 * @param params The params for the method to execute.
 */
export function executeIfExists(obj: any, method: string, ...params: unknown[]): void {
  if (typeof obj[method] === 'function') {
    obj[method](...params);
  }
}
