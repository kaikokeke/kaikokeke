# Merge deep

Recursively merges own and inherited enumerable string keyed properties of source objects.

Source properties that resolve to undefined are skipped if a destination value exists.
Other objects and value types are overridden by assignment.
Source objects are applied from left to right.
Ierable sources, except strings, are merged with previous sources.

## API

### Function

#### `function mergeDeep(source1: Record<string, unknown>, source2: Record<string, unknown>, ...otherSources: Record<string, unknown>[]): Record<string, unknown>`

Returns an object with merged own and inherited enumerable string keyed properties.

```ts
mergeDeep({ a: 0 }, { b: 0 });
```

## Example of use

```ts
import { mergeDeep } from '@kaikokeke/common';

mergeDeep({ a: { a: [0] }, b: 1 }, { a: { a: [1] }, b: 0 });
// { a: { a: [0, 1] }, b: 0 }
```
