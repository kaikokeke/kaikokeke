# Map as Mutable

Converts to mutable each object value emitted by the source Observable, and emits the resulting values as an Observable.

```ts
export function mapAsMutable<T extends Property>(): OperatorFunction<T, Writable<T>>;
```

Returns an Observable that emits the values from the source Observable as mutable.

## Example of use

```ts
import { mapAsMutable } from '@kaikokeke/environment';
import { of } from 'rxjs';

const arr: ReadonlyArray<any> = Object.freeze([Object.freeze({ a: 0 }), Object.freeze({ b: 0 })]);

of(arr)
  .pipe(mapAsMutable())
  .subscribe({
    next: (value) => {
      value[0] = 0;
      value[1].b = 1;
      value.push(1);
      console.log(value); // [0, { b: 1 }, 1]
    },
  });
```
