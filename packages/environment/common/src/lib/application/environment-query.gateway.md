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
query.getAll$();
```

Returns all the distinct environment properties as Observable.

```ts
// -{}-{}-{a:0}-{a:0}-{a:1}-
query.getAll$(); // -{}---{a:0}---{a:1}-
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
query.getAllAsync();
```

Returns the first non empty set of environment properties as Promise.

```ts
// -null-undefined-{}-{}-{a:1}-
query.getAllAsync(); // resolves {a:1}
```

#### `getAll(): Properties`

Gets all the environment properties.

```ts
query.getAll();
```

Returns all the environment properties.

```ts
// {a:1}
query.getAll(); // {a:1}
```

#### `get$<P extends Property>(path: Path): Observable<P | undefined>`

Gets the environment property at path.

```ts
query.get$('a');
```

Returns the distinct environment property at path as Observable or `undefined` if the path cannot be resolved.

```ts
// -{}-{}-{a:0}-{a:0}-{a:1}-
query.get$('a'); // -undefined---0---1-
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
query.getAsync('a');
```

Returns the non nil environment property at path as Promise.

```ts
// -null-undefined-{}-{a:0}-{a:1}-
query.getAsync('a'); // resolves 0
```

#### `get<P extends Property>(path: Path): P | undefined`

Gets the environment property at path.

```ts
query.get('a');
```

Returns the environment property at path or `undefined` if the path cannot be resolved.

```ts
// {a:1}
query.get('a'); // 1
query.get('b'); // undefined
```

#### `contains$(path: Path): Observable<boolean>`

Checks if the environment property path is available for resolution.

```ts
query.contains$('a');
```

Returns distinct `true` as Observable if the environment property path exists, otherwise `false`.

```ts
// -{}-{}-{a:0}-{a:0}-{b:0}-
query.contains$('a'); // -false---true---false-
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
query.containsAsync('a');
```

Returns `true` as Promise when the environment property path exists.

```ts
// -{}-{}-{a:0}-{a:0}-{b:0}-
query.containsAsync('a'); // resolves true
```

#### `contains(path: Path): boolean`

Checks if the environment property path is available for resolution.

```ts
query.contains('a');
```

Returns `true` if the environment property path exists, otherwise `false`.

```ts
// {a:0}
query.contains('a'); // true
query.contains('b'); // false
```

## Examples of use

### Returns as mutable

If the store uses immutable objects and the coder needs to change the returned values she can use the `asMutable` function or the `mapAsMutable` Observable operator to convert it.

```ts
import { asMutable, EnvironmentQuery, EnvironmentStore, mapAsMutable, Property } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { store } from './custom-environment.store';

class CustomEnvironmentQuery extends EnvironmentQuery {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

export const environmentQuery: EnvironmentQuery = new CustomEnvironmentQuery(store);

const address$: Observable<Property> = query.get$('user.address').pipe(mapAsMutable());
const address: Property = query.getTyped('user.address', asMutable);
```
