# Suffix Path

Adds a suffix to a path.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { suffix } from '@kaikokeke/common';

suffixPath('a.b', 'c.d');
```

## API

### Function

#### `suffixPath(path: Path, suffix: Path): Path`

Adds a prefix to a path.

```ts
suffixPath('a.b', 'c.d');
```

Returns the suffixed path in the same format of the original path.

```ts
suffixPath('a.b', 'c.d'); // 'a.b.c.d'
suffixPath('a.b', ['c', 'd']); // 'a.b.c.d'
suffixPath(['a', 'b'], 'c.d'); // ['a','b','c','d']
suffixPath(['a', 'b'], ['c', 'd']); // ['a','b','c','d']
```
