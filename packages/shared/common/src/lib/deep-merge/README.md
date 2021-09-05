# Deep Merge

Recursively merges own and inherited enumerable string keyed properties of source objects.

Source properties that resolve to undefined are skipped if a destination value exists.
Other objects and value types are overridden by assignment.
Source objects are applied from left to right.
Iterable sources, except strings, are merged with previous sources.

## API

### Function

#### `function deepMerge<T extends Record<PropertyKey, unknown>>(source1: Record<PropertyKey, unknown>, source2: Record<PropertyKey, unknown>, ...otherSources: Record<PropertyKey, unknown>[]): T`

Returns an object with merged own and inherited enumerable string keyed properties.

```ts
import { deepMerge } from '@kaikokeke/common';

deepMerge(obj1, obj2);
```

## Examples of use

### Complex deep merge

```ts
import { deepMerge } from '@kaikokeke/common';

const a: Record<PropertyKey, unknown> = { a: { a: [0] }, b: 1 };
const b: Record<PropertyKey, unknown> = { a: { a: [1] }, b: 0, c: { a: 0 } };
const c: Record<PropertyKey, unknown> = { a: { a: [1] }, b: undefined, c: { b: 1 } };
deepMerge(a, b, c); // { a: { a: [0, 1, 1] }, b: 0, c: { a: 0, b: 1} }
```
