# Path

Represents the property path of an object.

## API

### Types

#### `Path`

Represents the property path of an object.

```ts
export type Path = string | string[];
```

### Functions

#### `isValidPath(value: unknown): value is Path`

Checks if the value is a valid path.

```ts
isValidPath('a');
```

Returns `true` if the value is a valid path, `false` otherwise.
A valid path is a non empty string or Array of non empty strings.

```ts
isValidPath(''); // false
isValidPath('a.a'); // true
isValidPath(['a', 'a']); // true
```

#### `pathAsArray(path: Path): Path`

Converts a Path to Array format.

```ts
pathAsArray('a');
```

Returns the path as Array.

```ts
pathAsArray('a.a'); // ['a','a']
pathAsArray(['a', 'a']); // ['a','a']
```

#### `pathAsString(path: Path): Path`

Converts a Path to string format.

```ts
pathAsString(['a']);
```

Returns the path as string.

```ts
pathAsString('a.a'); // 'a.a'
pathAsString(['a', 'a']); // 'a.a'
```

#### `prefixPath(path: Path, prefix: Path): Path`

Adds a prefix to a path.

```ts
prefixPath('a', 'b');
```

Returns the prefixed path in the same format of the original path.

```ts
prefixPath('a', 'b'); // 'b.a'
prefixPath('a', ['b']); // 'b.a'
prefixPath(['a'], 'b'); // ['b','a']
prefixPath(['a'], ['b']); // ['b','a']
```

#### `suffixPath(path: Path, suffix: Path): Path`

Adds a suffix to a path.

```ts
suffixPath('a', 'b');
```

Returns the suffixed path in the same format of the original path.

```ts
suffixPath('a', 'b'); // 'a.b'
suffixPath('a', ['b']); // 'a.b'
suffixPath(['a'], 'b'); // ['a','b']
suffixPath(['a'], ['b']); // ['a','b']
```

### Errors

#### `InvalidPathError`

Throws an invalid path error.

```ts
throw new InvalidPathError('');
// Error { name: 'InvalidPathError', message: 'The path "" is invalid'}
```
