# Environment Query

Gets the properties from the environment.

This service provides different ways to get the environment properties.

## Getting Started

You can create an environment query with `TypeScript` by extending from `EnvironmentQuery`. This option is ideal to change or extends the service behavior, as described in the API and examples.

```ts
import { EnvironmentConfig, EnvironmentQuery, EnvironmentStore } from '@kaikokeke/environment';
import { environmentStore } from './environment.store.ts';

class SimpleEnvironmentQuery extends EnvironmentQuery {
  constructor(
    protected readonly store: EnvironmentStore,
    protected readonly partialConfig?: Partial<EnvironmentConfig>,
  ) {
    super(store, partialConfig);
  }
}

export const environmentQuery: EnvironmentQuery = new SimpleEnvironmentQuery(environmentStore);
```

If you want to create a pure `JavaScript` implementation you can use the `createEnvironmentQuery(store, partialConfig)` function.

```js
import { createEnvironmentQuery } from '@kaikokeke/environment';
import { environmentStore } from './environment.store';

const environmentQuery = createEnvironmentQuery(environmentStore);
```

## API

```ts
function createEnvironmentQuery(store: EnvironmentStore, partialConfig?: Partial<EnvironmentConfig>): EnvironmentQuery;
```

```ts
abstract class EnvironmentQuery {
  constructor(
    protected readonly store: EnvironmentStore,
    protected readonly partialConfig?: Partial<EnvironmentConfig>,
  );

  getAll$(): Observable<Properties>;
  getAllAsync(): Promise<Properties>;
  getAll(): Properties;

  get$<P extends Property>(path: Path): Observable<P | undefined>;
  getAsync<P extends Property>(path: Path): Promise<P>;
  get<P extends Property>(path: Path): P | undefined;

  contains$(path: Path): Observable<boolean>;
  containsAsync(path: Path): Promise<boolean>;
  contains(path: Path): boolean;

  containsAll$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsAll(...paths: AtLeastOne<Path>): boolean;

  containsSome$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsSome(...paths: AtLeastOne<Path>): boolean;

  getRequired$<P extends Property, D extends Property>(path: Path, defaultValue?: D): Observable<P | D>;
  getRequired<P extends Property, D extends Property>(path: Path, defaultValue?: D): P | D;

  getTyped$<P extends Property, T>(path: Path, targetType: (value: P) => T): Observable<T | undefined>;
  getTypedAsync<P extends Property, T>(path: Path, targetType: (value: P) => T): Promise<T>;
  getTyped<P extends Property, T>(path: Path, targetType: (value: P) => T): T | undefined;

  getRequiredTyped$<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): Observable<T>;
  getRequiredTyped<P extends Property, D extends Property, T>(
    path: Path,
    targetType: (value: P | D) => T,
    defaultValue?: D,
  ): T;

  getTranspiled$<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | undefined>;
  getTranspiledAsync<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Promise<P>;
  getTranspiled<P extends Property>(
    path: Path,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | undefined;

  getRequiredTranspiled$<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): Observable<P | D>;
  getRequiredTranspiled<P extends Property, D extends Property>(
    path: Path,
    defaultValue?: D,
    properties?: Properties,
    config?: Partial<EnvironmentConfig>,
  ): P | D;
}
```

### Function

#### `createEnvironmentQuery(store: EnvironmentStore, partialConfig?: Partial<EnvironmentConfig>): EnvironmentQuery`

Creates an environment query service.

```ts
createEnvironmentQuery(environmentStore);
```

Returns a basic EnvironmentQuery instance.

```ts
const environmentQuery: EnvironmentQuery = createEnvironmentQuery(environmentStore);
```

You can also pass an optional partial configuration parameters for the Environment module.

```ts
const environmentQuery: EnvironmentQuery = createEnvironmentQuery(environmentStore, {
  useEnvironmentToTranspile: true,
});
```

### Exposed Methods

#### `getAll$(): Observable<Properties>`

Gets all the environment properties.

```ts
environmentQuery.getAll$();
```

Returns all the distinct environment properties as Observable.

```ts
// -{}-{}-{a:0}-{a:0}-{a:1}-
environmentQuery.getAll$(); // -{}---{a:0}---{a:1}-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {a:1}

> getAll$()

-a---b---c-
a := {}
b := {a:0}
c := {a:1}
```

#### `getAllAsync(): Promise<Properties>`

Gets all the environment properties.

```ts
environmentQuery.getAllAsync();
```

Returns the first non empty set of environment properties as Promise.

```ts
// -null-undefined-{}-{}-{a:1}-
environmentQuery.getAllAsync(); // resolves {a:1}
```

#### `getAll(): Properties`

Gets all the environment properties.

```ts
environmentQuery.getAll();
```

Returns all the environment properties.

```ts
// {a:1}
environmentQuery.getAll(); // {a:1}
```

#### `get$<P extends Property>(path: Path): Observable<P | undefined>`

Gets the environment property at path.

```ts
environmentQuery.get$('a');
```

Returns the distinct environment property at path as Observable or `undefined` if the path cannot be resolved.

```ts
// -{}-{}-{a:0}-{a:0}-{a:1}-
environmentQuery.get$('a'); // -undefined---0---1-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {a:1}

> get$('a')

-a---b---c-
a := und
b := 0
c := 1
```

#### `getAsync<P extends Property>(path: Path): Promise<P>`

Gets the environment property at path.

```ts
environmentQuery.getAsync('a');
```

Returns the non nil environment property at path as Promise.

```ts
// -null-undefined-{}-{a:0}-{a:1}-
environmentQuery.getAsync('a'); // resolves 0
```

#### `get<P extends Property>(path: Path): P | undefined`

Gets the environment property at path.

```ts
environmentQuery.get('a');
```

Returns the environment property at path or `undefined` if the path cannot be resolved.

```ts
// {a:1}
environmentQuery.get('a'); // 1
environmentQuery.get('b'); // undefined
```

#### `contains$(path: Path): Observable<boolean>`

Checks if the environment property path is available for resolution.

```ts
environmentQuery.contains$('a');
```

Returns distinct `true` as Observable if the environment property path exists, otherwise `false`.

```ts
// -{}-{}-{a:0}-{a:0}-{b:0}-
environmentQuery.contains$('a'); // -false---true---false-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {b:0}

> contains$('a')

-a---b---a-
a := false
b := true
```

#### `containsAsync(path: Path): Promise<boolean>`

Checks if the environment property path is available for resolution.

```ts
environmentQuery.containsAsync('a');
```

Returns `true` as Promise when the environment property path exists.

```ts
// -{}-{}-{a:0}-{a:0}-{b:0}-
environmentQuery.containsAsync('a'); // resolves true
```

#### `contains(path: Path): boolean`

Checks if the environment property path is available for resolution.

```ts
environmentQuery.contains('a');
```

Returns `true` if the environment property path exists, otherwise `false`.

```ts
// {a:0}
environmentQuery.contains('a'); // true
environmentQuery.contains('b'); // false
```

#### `containsAll$(...paths: AtLeastOne<Path>): Observable<boolean>`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAll$('a', 'b');
```

Returns distinct `true` as Observable if all the environment property paths exists, otherwise `false`.

```ts
// -{}-{}-{a:0,b:0}-{a:0,b:0}-{b:0}-
environmentQuery.containsAll$('a', 'b'); // -false---true---false-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 40
frame_width = 50

-a-b-c-d-e-
a := {}
b := {}
c := {a:0,b:0}
d := {a:0,b:0}
e := {b:0}

> containsAll$('a', 'b')

-a---b---a-
a := false
b := true
```

#### `containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean>`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAllAsync('a', 'b');
```

Returns `true` as Promise when all environment property paths exists.

```ts
// -{}-{}-{a:0,b:0}-{a:0,b:0}-{b:0}-
environmentQuery.containsAllAsync('a', 'b'); // resolves true
```

#### `containsAll(...paths: AtLeastOne<Path>): boolean`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAll('a');
```

Returns `true` if all the environment property paths exists, otherwise `false`.

```ts
// {a:0,b:0}
environmentQuery.containsAll('a', 'b'); // true
environmentQuery.containsAll('a', 'c'); // false
```

#### `containsSome$(...paths: AtLeastOne<Path>): Observable<boolean>`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSome$('a', 'b');
```

Returns distinct `true` as Observable if some environment property paths exists, otherwise `false`.

```ts
// -{}-{}-{a:0}-{b:0}-{c:0}-
environmentQuery.containsSome$('a', 'b'); // -false---true---false-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {b:0}
e := {c:0}

> containsSome$('a', 'b')

-a---b---a-
a := false
b := true
```

#### `containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean>`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSomeAsync('a', 'b');
```

Returns `true` as Promise when some environment property paths exists.

```ts
// -{}-{}-{a:0}-{b:0}-{b:0}-
environmentQuery.containsSomeAsync('a', 'b'); // resolves true
```

#### `containsSome(...paths: AtLeastOne<Path>): boolean`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSome('a', 'c');
```

Returns `true` if some environment property paths exists, otherwise `false`.

```ts
// {a:0,b:0}
environmentQuery.containsSome('a', 'c'); // true
environmentQuery.containsSome('c', 'd'); // false
```

#### `getRequired$<P extends Property, D extends Property>(path: Path, defaultValue?: D): Observable<P | D>`

Gets the required environment property at path.

```ts
environmentQuery.getRequired$('a', 1);
```

Returns the distinct environment property at path as Observable or the `defaultValue` if the path cannot be resolved.

```ts
// -{}-{}-{a:0}-{a:0}-{c:0}-
environmentQuery.getRequired$('a', 1); // -1---0---1-
```

Throws if the property at path is undefined and `defaultValue` is not provided.

```ts
// -{}-{}-{a:0}-{a:0}-{c:0}-
environmentQuery.getRequired$('a');
// -# Error 'The environment property at path "a" is required and is undefined'
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {c:0}

> getRequired$('a', 1)

-a---b---a-
a := 1
b := 0

> getRequired$('a')

-#
```

#### `getRequired<P extends Property, D extends Property>(path: Path, defaultValue?: D): P | D`

Gets the required environment property at path.

```ts
environmentQuery.getRequired('a', 1);
```

Returns the environment property at path.

```ts
// {a:0}
environmentQuery.getRequired('a', 1); // 0
```

Returns the `defaultValue` if the path cannot be resolved.

```ts
// {c:0}
environmentQuery.getRequired('a', 1); // 1
```

Throws if the property at path is undefined and `defaultValue` is not provided.

```ts
// {c:0}
environmentQuery.getRequired('a');
// Error 'The environment property at path "a" is required and is undefined'
```

#### `getTyped$<P extends Property, T>(path: Path, targetType: (value: P) => T): Observable<T | undefined>`

Gets the typed environment property at path.

```ts
environmentQuery.getTyped$('a', String);
```

Returns the distinct environment property at path converted to the `targetType` as Observable
or `undefined` if the path cannot be resolved.

```ts
// -{}-{}-{a:0}-{a:0}-{c:0}-
environmentQuery.getTyped$('a', String); // -undefined---'0'---undefined-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {c:0}

> getTyped$('a', String)

-a---b---a-
a := und
b := '0'
```

#### `getTyped<P extends Property, T>(path: Path, targetType: (value: P) => T): T | undefined`

Gets the typed environment property at path.

```ts
environmentQuery.getTyped('a', String);
```

Returns the environment property at path converted to the `targetType`.

```ts
// {a:0}
environmentQuery.getTyped('a', String); // '0'
```

Returns `undefined` if the path cannot be resolved.

```ts
// {a:0}
environmentQuery.getTyped('b', String); // undefined
```

#### `getRequiredTyped$<P extends Property, D extends Property, T>(path: Path,targetType: (value: P | D) => T, defaultValue?: D): Observable<T>`

Gets the required typed environment property at path.

```ts
environmentQuery.getRequiredTyped$('a', String, 1);
```

Returns the distinct environment property at path converted to the `targetType` as Observable
or the converted `defaultValue` if the path cannot be resolved.

```ts
// -{}-{}-{a:0}-{a:0}-{c:0}-
environmentQuery.getRequiredTyped$('a', String, 1); // -'1'---'0'---'1'-
```

Throws if the property at path is undefined and `defaultValue` is not provided.

```ts
// -{}-{}-{a:0}-{a:0}-{c:0}-
environmentQuery.getRequiredTyped$('a', String);
// -# Error 'The environment property at path "a" is required and is undefined'
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25
frame_width = 40

-a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {c:0}

> getRequiredTyped$('a', String, 1)

-a---b---a-
a := '1'
b := '0'

> getRequiredTyped$('a', String)

-#
```

#### `getRequiredTyped<P extends Property, D extends Property, T>(path: Path, targetType: value: P | D) => T, defaultValue?: D): T`

Gets the required typed environment property at path.

```ts
environmentQuery.getRequiredTyped('a', String, 1);
```

Returns the environment property at path converted to the `targetType`.

```ts
// {a:0}
environmentQuery.getRequiredTyped('a', String, 1); // '0'
```

Returns the converted `defaultValue` if the path cannot be resolved.

```ts
// {a:0}
environmentQuery.getRequiredTyped('b', String, 1); // '1'
```

Throws if the property at path is undefined and `defaultValue` is not provided.

```ts
// {a:0}
environmentQuery.getRequiredTyped('b', String);
// -# Error 'The environment property at path "b" is required and is undefined'
```

## Examples of use

### Returns as mutable

If the store uses immutable objects and the coder needs to change the returned values she can use the `asMutable()` function or the `mapAsMutable()` Observable operator to convert it.

```ts
import { asMutable, EnvironmentQuery, EnvironmentStore, mapAsMutable, Property } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { environmentStore } from './environment.store';

class CustomEnvironmentQuery extends EnvironmentQuery {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

export const environmentQuery: EnvironmentQuery = new CustomEnvironmentQuery(environmentStore);

const address$: Observable<Property> = environmentQuery.get$('user.address').pipe(mapAsMutable());
const address: Property = environmentQuery.getTyped('user.address', asMutable);
```
