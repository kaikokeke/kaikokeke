# Path As String

Converts a Path to string format.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { pathAsString } from '@kaikokeke/common';

pathAsString(['a', 'a']);
```

## API

### Function

#### `pathAsString(path: Path): string`

Converts a Path to string format.

```ts
pathAsString(['a', 'a']);
```

Returns the path as string.

```ts
pathAsString(['a', 'a']); // 'a.a'
pathAsString('a.a'); // 'a.a'
```
