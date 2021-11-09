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

  containsAll$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsAllAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsAll(...paths: AtLeastOne<Path>): boolean;

  containsSome$(...paths: AtLeastOne<Path>): Observable<boolean>;
  containsSomeAsync(...paths: AtLeastOne<Path>): Promise<boolean>;
  containsSome(...paths: AtLeastOne<Path>): boolean;

  get$<T = Property>(path: Path, options?: GetOptions<T>): Observable<T | undefined>;
  getAsync<T = Property>(path: Path, options?: GetOptions<T>): Promise<T | undefined>;
  get<T = Property>(path: Path, options?: GetOptions<T>): T | undefined;
}
```

```ts
interface GetOptions<T> {
  defaultValue?: Property;
  targetType?: (property: Property) => T;
  transpile?: Properties;
  interpolation?: [string, string];
  useEnvironmentToTranspile?: boolean;
}
```

### Function

#### `createEnvironmentQuery(store: EnvironmentStore, config?: Partial<EnvironmentConfig>): EnvironmentQuery`

Creates an environment query service.

```ts
createEnvironmentQuery(environmentStore);
```

Returns a basic EnvironmentQuery instance.

```ts
const environmentQuery: EnvironmentQuery = createEnvironmentQuery(environmentStore);
```

You can also pass an optional configuration parameters for the Environment module.

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

#### `get$<T = Property>(path: Path, options?: GetOptions<T>): Observable<T | undefined>`

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

#### `getAsync<T = Property>(path: Path, options?: GetOptions<T>): Promise<T | undefined>`

Gets the environment property at path.

```ts
environmentQuery.getAsync('a');
```

Returns the first non nil environment property at path as Promise.

```ts
// null-undefined-{}-{a:0}-{a:1}-
environmentQuery.getAsync('a'); // resolves 0 after 7 ticks
```

#### `get<T = Property>(path: Path, options?: GetOptions<T>): T | undefined`

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

### Exposed Types

#### `GetOptions`

These options allow you to modify the property value returned by the `get$`, `getAsync` and `get` methods.

The order of resolution will be as follows:

1. `defaultValue`
2. `targetType`
3. `transpile`

The `interpolation` and `useEnvironmentToTranspile` properties will only be used if the `transpile` property is set. You can learn more about this in the API and examples below.

##### `defaultValue?: Property`

The default value to resolve if no value is found.

```ts
environmentQuery.get$('a', { defaultValue: 1 });
environmentQuery.getAsync('a', { defaultValue: 1 });
environmentQuery.get('a', { defaultValue: 1 });
```

The default value will be returned whenever a property is not defined in the specified path.

```ts
// {a:{a:0},b:null,c:undefined}
environmentQuery.get('a.a', { defaultValue: 1 }); // 0
environmentQuery.get('a.b', { defaultValue: 1 }); // 1
environmentQuery.get('b', { defaultValue: 1 }); // null
environmentQuery.get('c', { defaultValue: 1 }); // 1
```

##### `targetType?: (property: Property) => T`

The expected type converter function.

```ts
environmentQuery.get$('a', { targetType: String });
environmentQuery.getAsync('a', { targetType: String });
environmentQuery.get('a', { targetType: String });
```

If a function is set in this property, it will be executed, passing it as an input parameter the value of the property found in the specified path, as long as it is not undefined.

```ts
// {a:{a:0},b:null,c:undefined}
environmentQuery.get('a.a', { targetType: String }); // '0'
environmentQuery.get('a.b', { targetType: String }); // undefined
environmentQuery.get('b', { targetType: String }); // 'null'
environmentQuery.get('c', { targetType: String }); // undefined
```

##### `transpile?: Properties`

The properties to resolve the interpolation.

```ts
environmentQuery.get$('a', { transpile: { a: 0 } });
environmentQuery.getAsync('a', { transpile: { a: 0 } });
environmentQuery.get('a', { transpile: { a: 0 } });
```

If a string contains an interpolation string and this property is set, the path specified in the interpolation will be replaced with the data provided in the `interpolation` object.

```ts
// {a:'{{a.a}} users'}
environmentQuery.get('a', { transpile: { a: { a: 0 } } }); // '0 users'
```

If the path to be interpolated is not found, the string will be returned as is.

```ts
// {a:'{{ a.a }} users'}
environmentQuery.get('a', { transpile: {}); // '{{ a.a }} users'
```

This behavior can be modified through the `interpolation` and `useEnvironmentToTranspile` properties, which can be defined when creating the `EnvironmentQuery` object or in the call itself, as shown below. If no `EnvironmentConfig` is specified during the construction of the object, the default values ​​will be the following:

```ts
{ interpolation: ['{{', '}}'], useEnvironmentToTranspile: false }
```

The behavior of each of these properties is described in its own description.

##### `interpolation?: [string, string]`

The start and end markings for interpolation parameters.

```ts
environmentQuery.get$('a', { transpile: { a: 0 }, interpolation: ['[<', '>]'] });
environmentQuery.getAsync('a', { transpile: { a: 0 }, interpolation: ['[<', '>]'] });
environmentQuery.get('a', { transpile: { a: 0 }, interpolation: ['[<', '>]'] });
```

If it has been specified that the property must transpile, this property allows modifying the characters that demarcate the path to transpile.

```ts
// {a:'[< b >] users' }
environmentQuery.get('a', { transpile: { b: 0 } }); // '[< b >] users'
environmentQuery.get('a', { transpile: { b: 0 }, interpolation: ['[<', '>]'] }); // '0 users'
```

##### `useEnvironmentToTranspile?: boolean`

Use the environment properties to transpile the interpolation.

```ts
environmentQuery.get$('a', { transpile: { a: 0 }, useEnvironmentToTranspile: true });
environmentQuery.getAsync('a', { transpile: { a: 0 }, useEnvironmentToTranspile: true });
environmentQuery.get('a', { transpile: { a: 0 }, useEnvironmentToTranspile: true });
```

If this property is set to true, all the existing properties in the environment will be added to the properties specified in `interpolation`.
If there is a conflict, those specified in interpolation will take precedence over those in the environment.

```ts
// {a:'{{ b }} users',b:0}
environmentQuery.get('a', { transpile: {} }); // '{{ b }} users'
environmentQuery.get('a', { transpile: {}, useEnvironmentToTranspile: true }); // '0 users'
environmentQuery.get('a', { transpile: { b: 2 }, useEnvironmentToTranspile: true }); // '2 users'
```

## Examples of use

### Returns as mutable

If the store uses immutable objects and the coder needs to change the returned values she can use the `asMutable()` function or the `mapAsMutable()` Observable operator to convert it.

```ts
import { asMutable, createEnvironmentQuery, EnvironmentQuery, mapAsMutable, Property } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { environmentStore } from './environment.store';

export const environmentQuery: EnvironmentQuery = createEnvironmentQuery(environmentStore);

const addressPipe$: Observable<Property> = environmentQuery.get$('user.address').pipe(mapAsMutable());
const address$: Observable<Property> = environmentQuery.get$('user.address', { targetType: asMutable });
const addressAsync: Promise<Property> = environmentQuery.getAsync('user.address', { targetType: asMutable });
const address: Property = environmentQuery.get('user.address', { targetType: asMutable });
```
