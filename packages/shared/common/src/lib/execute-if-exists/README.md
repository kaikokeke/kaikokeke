# Execute If Exists

Executes an object method if it exists.

```ts
export function executeIfExists<T, R>(obj: T, method: string, ...args: unknown[]): R;
```

Returns the method's return value if exist, `undefined` otherwise.

## Examples of use

```ts
class TestClass {
  method(a: number): number {
    return a;
  }
}

const testClass = new TestClass();

executeIfExists(testClass, 'method', 1); // 1
executeIfExists(testClass, 'noMethod', 1); // undefined
```
