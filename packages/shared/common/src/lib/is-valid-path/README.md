# Is Valid Path

Checks if the value is a valid path.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { isValidPath } from '@kaikokeke/common';

isValidPath('a.a');
```

## API

### Function

#### `isValidPath(value: unknown): value is Path`

Checks if the value is a valid path.

```ts
isValidPath('a.a');
```

Returns `true` if the value is a valid path.

```ts
isValidPath('a.a'); // true
```

Returns `false` if the value is an invalid path.

```ts
isValidPath(''); // false
```

A valid path is a simple string key, a complex string key or an array of simple keys to create a complex key.

```ts
isValidPath('a'); // true
isValidPath('a.a'); // true
isValidPath(['a']); // true
isValidPath(['a', 'a']); // true
```

Any other data type is not valid.

```ts
isValidPath(''); // false
isValidPath('a.'); // false
isValidPath('a..a'); // false
isValidPath([]); // false
isValidPath(['', 'a']); // false
isValidPath([0, 'a']); // false
isValidPath(['a', 'a.a']); // false
isValidPath(['a', 'a.']); // false
```
