# Invalid Path Error

Throws an invalid path error.

## Getting started

Import from `@kaikokeke/common` and use as described in the API.

```ts
import { InvalidPathError } from '@kaikokeke/common';

const error: Error = new InvalidPathError(['a', '']);
```

## API

```ts
class InvalidPathError extends Error {
  constructor(path: Path);
}
```

### Exposed Properties

#### `name`

The error name is allways 'InvalidPathError'.

```ts
error.name; // 'InvalidPathError'
```

#### `message`

The error message displays the invalid path as string.

```ts
error.message; // 'The path "a." is invalid'
```

## Examples of use

### Use with `isValidPath()`

This error is commonly used with the `isValidPath()` function.

```ts
import { InvalidPathError, isValidPath } from '@kaikokeke/common';

function doSomething(path: Path): void {
  if (isValidPath(path)) {
    // do something
  } else {
    throw new InvalidPathError(path);
  }
}
```
