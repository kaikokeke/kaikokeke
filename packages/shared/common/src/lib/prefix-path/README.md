# Prefix Path

Adds a prefix to a path.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { prefixPath } from '@kaikokeke/common';

prefixPath('c.d', 'a.b');
```

## API

### Function

#### `prefixPath(path: Path, prefix: Path): Path`

Adds a prefix to a path.

```ts
prefixPath('c.d', 'a.b');
```

Returns the prefixed path in the same format of the original path.

```ts
prefixPath('c.d', 'a.b'); // 'a.b.c.d'
prefixPath('c.d', ['a', 'b']); // 'a.b.c.d'
prefixPath(['c', 'd'], 'a.b'); // ['a','b','c','d']
prefixPath(['c', 'd'], ['a', 'b']); // ['a','b','c','d']
```
