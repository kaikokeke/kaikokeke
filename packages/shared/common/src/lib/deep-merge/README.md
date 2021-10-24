# Deep Merge

Recursively merges own and inherited enumerable string keyed properties of source objects.

## Getting Started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { deepMerge } from '@kaikokeke/common';

deepMerge({ a: 0 }, { b: 0 });
```

## API

### Function

#### `deepMerge<T extends Record<string, unknown>>(...sources: AtLeastOne<object>): T`

Recursively merges own and inherited enumerable string keyed properties of source objects.

```ts
deepMerge({ a: 0 }, { b: 0 });
```

Returns an object with merged own enumerable string keyed properties.

```ts
const a: Record<string, unknown> = { a: { a: 0 } };
const b: Record<string, unknown> = { a: { b: 0 } };

deepMerge(a, b); // {a:{a:0,b:0}}
```

Returns an object with merged inherited enumerable string keyed properties.

```ts
class A {
  a = 0;
}

class B {
  b = 0;
}

class C extends A {
  c = 0;
}

const b: B = new B();
const c: C = new C();

deepMerge(b, c); // {a:0,b:0,c:0}
```

Source properties that resolve to undefined are skipped if a destination value exists.

```ts
const a: Record<string, unknown> = { a: { a: 0 } };
const b: Record<string, unknown> = { a: { a: undefined } };

deepMerge(a, b); // {a:{a:0}}
```

Other objects and value types are overridden by assignment.

```ts
const a: Record<string, unknown> = { a: { a: 0 } };
const b: Record<string, unknown> = { a: { a: null } };

deepMerge(a, b); // {a:{a:null}}
```

Source objects are applied from left to right.

```ts
const a: Record<string, unknown> = { a: { a: 0 } };
const b: Record<string, unknown> = { a: { a: 1 } };
const c: Record<string, unknown> = { a: { a: 2 } };

deepMerge(a, b, c); // {a:{a:2}}
```

Iterable sources, except strings, are merged with previous sources.

```ts
const a: Record<string, unknown> = { a: [0] };
const b: Record<string, unknown> = { a: [1] };

deepMerge(a, b); // {a:[0,1]}
```

## Examples of use

### Complex deep merge

Here is a complex example of merging objects.

```ts
import { deepMerge } from '@kaikokeke/common';

class D {
  d = 0;
}

class E extends D {
  e = 0;
}

const a: Record<string, unknown> = { a: { a: [0] }, b: 1 };
const b: Record<string, unknown> = { a: { a: [1] }, b: 0, c: { a: 0 } };
const c: Record<string, unknown> = { a: { a: [1] }, b: undefined, c: { b: 1 } };
const e: E = new E();

deepMerge(a, b, c, d); // {a:{a:[0,1,1]},b:0,c:{a:0,b:1},d:0,e:0}
```
