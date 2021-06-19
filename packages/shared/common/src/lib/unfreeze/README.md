# Unfreeze

Unfreezes the frozen values creating a recursive shallow clone of each value emitted by the source Observable,
and emitting the resulting deep cloned values as an Observable. Non-frozen objects are emited as is.

This method is loosely based on the structured clone algorithm and supports cloning arrays, array buffers, booleans,
date objects, maps, numbers, Object objects, regexes, sets, strings, symbols, and typed arrays.
The own enumerable properties of arguments objects are cloned as plain objects.
An empty object is returned for uncloneable values such as error objects, functions, DOM nodes, JSON object,
Atomics object, Math object, WeakSets, WeakMaps and SharedArrayBuffers.
BigInt64Array and BigUint64Array are cloned as plain objects due to limitations of Lodash.

## API

### Function

#### `function unfreeze<T>(): MonoTypeOperatorFunction<T>`

Returns an Observable that emits the unfreezed values from the source Observable.

```ts
const mutable$: Observable<any> = observable$.pipe(unfreeze());
```

## Example of use

```ts
import { unfreeze } from '@kaikokeke/common';
import { of } from 'rxjs';

const obj: { [key: string]: any } = Object.freeze({ a: 0, b: Object.freeze({ b: 0 }) });

of(obj)
  .pipe(unfreeze())
  .subscribe({
    next: (value: { [key: string]: any }) => {
      value.a = 1;
      value.b.b = 1;
      // { a: 1, b: { b: 1 } }
    },
  });
```
