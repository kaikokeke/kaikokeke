# As Mutable

Converts the property to mutable if is an object.

```ts
export function asMutable<T>(property: T): Writable<T>;
```

Returns the property as mutable.

## Example of use

```ts
import { asMutable } from '@kaikokeke/environment';

const arr: ReadonlyArray<any> = Object.freeze([Object.freeze({ a: 0 }), Object.freeze({ b: 0 })]);

const value: unknown[] = asMutable(arr);
value[0] = 0;
value[1].b = 1;
value.push(1);
console.log(value); // [0, { b: 1 }, 1]
```
