# Execute If Exists

Executes an object method if it exists.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { executeIfExists } from '@kaikokeke/common';

class TestClass {
  plusOne(a: number): number {
    return a + 1;
  }
}

const testClass = new TestClass();

executeIfExists(testClass, 'plusOne', 0);
```

## API

### Function

#### `executeIfExists<R>(obj: any, method: string, ...args: unknown[]): R | undefined`

Executes an object method if it exists.

```ts
executeIfExists(testClass, 'plusOne', 0);
```

Returns the method's return value if exists.

```ts
executeIfExists(testClass, 'plusOne', 0); // 1
```

Return `undefined` the method doesn't exist.

```ts
executeIfExists(testClass, 'plusTwo', 0); // undefined
```

## Examples of use

### Lifecycle Hooks

Lifecycle hooks are optional methods that give you the opportunity to act on the instance at the appropriate moment.

```ts
interface OnOperation {
  onOperation(operation: string, ...args: number[]): void;
}

abstract class AbstractOperationClass {
  plusOne(a: number): number {
    executeIfExists(this, 'onOperation', 'sum', a, 1);
    return a + 1;
  }
}

class SumClass extends AbstractOperationClass implements OnOperation {
  onOperation(operation: string, ...args: number[]): void {
    console.log(`operation: ${operation}`, ...args);
  }
}

class OperationClass extends AbstractOperationClass {}

const sumClass: AbstractOperationClass = new SumClass();
const operationClass: AbstractOperationClass = new OperationClass();

sumClass.plusOne(0); // 1
// 'operation: sum', 0, 1

operationClass.plusOne(0); // 1
//
```
