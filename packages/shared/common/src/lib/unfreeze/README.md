# Unfreeze

Unfreezes the frozen object value.

This method is loosely based on the structured clone algorithm and supports cloning arrays, array buffers, booleans,
date objects, maps, numbers, Object objects, regexes, sets, strings, symbols, and typed arrays.
The own enumerable properties of arguments objects are cloned as plain objects.
An empty object is returned for uncloneable values such as error objects, functions, DOM nodes, JSON object,
Atomics object, Math object, WeakSets, WeakMaps and SharedArrayBuffers.
BigInt64Array and BigUint64Array are cloned as plain objects due to limitations of Lodash.

## API

### Function

#### `function unfreeze<T>(value: T): T`

Unfreezes the frozen object value. Non-frozen objects are returned as is.

```ts
import { unfreeze } from '@kaikokeke/common';

const obj: { [key: string]: any } = Object.freeze({ a: 0, b: Object.freeze({ b: 0 }) });

const value: { [key: string]: any } = unfreeze(obj);
value.a = 1;
value.b.b = 1;
// value = { a: 1, b: { b: 1 } }
```

#### `function unfreezeAll<T>(): MonoTypeOperatorFunction<T>`

Unfreezes the frozen values creating a recursive shallow clone of each value emitted by the source Observable,
and emitting the resulting deep cloned values as an Observable. Non-frozen objects are emited as is.

```ts
import { unfreezeAll } from '@kaikokeke/common';
import { of } from 'rxjs';

const obj: { [key: string]: any } = Object.freeze({ a: 0, b: Object.freeze({ b: 0 }) });

of(obj)
  .pipe(unfreezeAll())
  .subscribe({
    next: (value: { [key: string]: any }) => {
      value.a = 1;
      value.b.b = 1;
      // value = { a: 1, b: { b: 1 } }
    },
  });
```
