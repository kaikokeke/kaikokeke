# Path As Array

Converts a Path to Array format.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { pathAsArray } from '@kaikokeke/common';

pathAsArray('a.a');
```

## API

### Function

#### `pathAsArray(path: Path): string[]`

Converts a Path to Array format.

```ts
pathAsArray('a.a');
```

Returns the path as Array.

```ts
pathAsArray('a.a'); // ['a', 'a']
pathAsArray(['a', 'a']); // ['a', 'a']
```
