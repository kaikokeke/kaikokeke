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
interface EnvironmentQueryOptions<T> {
  defaultValue?: Property;
  targetType?: (property: Property) => T;
  transpile?: Properties;
  interpolation?: [string, string];
  useEnvironmentToTranspile?: boolean;
}
```

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

  containsAll$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsAll(...paths: AtLeastOne<Path>): boolean;

  containsSome$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsSome(...paths: AtLeastOne<Path>): boolean;

  get$<T>(path: Path, options?: EnvironmentQueryOptions<T>): Observable<T | undefined>;
  getAsync<T>(path: Path, options?: EnvironmentQueryOptions<T>): Promise<T | undefined>;
  get<T>(path: Path, options?: EnvironmentQueryOptions<T>): T | undefined;
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
// {}-{}-{a:0}-{a:0}-{a:1}-
environmentQuery.getAll$(); // {}---{a:0}---{a:1}-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {a:1}

> getAll$()

a---b---c-
a := {}
b := {a:0}
c := {a:1}
```

#### `getAllAsync(): Promise<Properties>`

Gets all the environment properties.

```ts
environmentQuery.getAllAsync();
```

Returns the first non nil or empty set of environment properties as Promise.

```ts
// null-undefined-{}-{}-{a:1}-
environmentQuery.getAllAsync(); // resolves {a:1} after 9 ticks
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

#### `containsAll$(...paths: AtLeastOne<Path>): Observable<boolean>`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAll$('a', 'b');
```

Returns distinct `true` as Observable if all the environment property paths exists, otherwise `false`.

```ts
// {}-{}-{a:0,b:0}-{a:0,b:0}-{b:0}-
environmentQuery.containsAll$('a', 'b'); // false---true---false-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 40
frame_width = 50

a-b-c-d-e-
a := {}
b := {}
c := {a:0,b:0}
d := {a:0,b:0}
e := {b:0}

> containsAll$('a', 'b')

a---b---a-
a := false
b := true
```

#### `containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean>`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAllAsync('a', 'b');
```

Returns the first `true` as Promise when all environment property paths exists.

```ts
// {}-{}-{a:0,b:0}-{a:0,b:0}-{b:0}-
environmentQuery.containsAllAsync('a', 'b'); // resolves true after 5 ticks
```

#### `containsAll(...paths: AtLeastOne<Path>): boolean`

Checks if all the environment property paths are available for resolution.

```ts
environmentQuery.containsAll('a');
```

Returns `true` if all the environment property paths exists.

```ts
// {a:0,b:0}
environmentQuery.containsAll('a', 'b'); // true
```

Returns `false` if one or more environment property paths doesn't exist.

```ts
// {a:0,b:0}
environmentQuery.containsAll('a', 'c'); // false
```

#### `containsSome$(...paths: AtLeastOne<Path>): Observable<boolean>`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSome$('a', 'b');
```

Returns distinct `true` as Observable if some environment property paths exists, otherwise `false`.

```ts
// {}-{}-{a:0}-{b:0}-{c:0}-
environmentQuery.containsSome$('a', 'b'); // false---true---false-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {b:0}
e := {c:0}

> containsSome$('a', 'b')

a---b---a-
a := false
b := true
```

#### `containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean>`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSomeAsync('a', 'b');
```

Returns the first `true` as Promise when some environment property paths exists.

```ts
// {}-{}-{a:0}-{b:0}-{b:0}-
environmentQuery.containsSomeAsync('a', 'b'); // resolves true after 5 ticks
```

#### `containsSome(...paths: AtLeastOne<Path>): boolean`

Checks if some environment property paths are available for resolution.

```ts
environmentQuery.containsSome('a', 'c');
```

Returns `true` if some environment property paths exists.

```ts
// {a:0,b:0}
environmentQuery.containsSome('a', 'c'); // true
```

Returns `false` if all environment property paths doesn't exist.

```ts
// {a:0,b:0}
environmentQuery.containsSome('c', 'd'); // false
```

#### `get$<T>(path: Path, options?: EnvironmentQueryOptions<T>): Observable<T | undefined>`

Gets the environment property at path.

```ts
environmentQuery.get$('a');
```

Returns the distinct environment property at path as Observable.

```ts
// {}-{}-{a:0}-{a:0}-{a:1}-
environmentQuery.get$('a'); // undefined---0---1-
```

```
// See in https://swirly.dev/

[styles]
event_radius = 25

a-b-c-d-e-
a := {}
b := {}
c := {a:0}
d := {a:0}
e := {a:1}

> get$('a')

a---b---c-
a := und
b := 0
c := 1
```

#### `getAsync<T>(path: Path, options?: EnvironmentQueryOptions<T>): Promise<T | undefined>`

Gets the environment property at path.

```ts
environmentQuery.getAsync('a');
```

Returns the first non nil environment property at path as Promise.

```ts
// null-undefined-{}-{a:0}-{a:1}-
environmentQuery.getAsync('a'); // resolves 0 after 7 ticks
```

#### `get<T>(path: Path, options?: EnvironmentQueryOptions<T>): T | undefined`

Gets the environment property at path.

```ts
environmentQuery.get('a');
```

Returns the environment property at path.

```ts
// {a:0}
environmentQuery.get('a'); // 0
```

Returns `undefined` if the path cannot be resolved.

```ts
// {a:0}
environmentQuery.get('b'); // undefined
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
