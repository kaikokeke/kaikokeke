# Environment Query

Gets the properties from the environment.

## Getting Started

You can create an environment query class extending from `EnvironmentQuery`.

```ts
import { EnvironmentQuery, EnvironmentStore } from '@kaikokeke/environment';
import { environmentStore } from './environment.store.ts';

class SimpleEnvironmentQuery extends EnvironmentQuery {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

export const environmentQuery: EnvironmentQuery = new SimpleEnvironmentQuery(environmentStore);
```

## API

```ts
abstract class EnvironmentQuery {
  getAll$(): Observable<Properties>;
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

### Exposed Methods

#### `getAll$(): Observable<Properties>`

Gets all the distinct environment properties.

```ts
query.getAll$(); // -{}---{a:0}---{a:1}-
```

Returns all the environment properties as Observable.

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

export const query: EnvironmentQuery = new CustomEnvironmentQuery(store);

const address$: Observable<Property> = query.get$('user.address').pipe(mapAsMutable());
const address: Property = query.getTyped('user.address', asMutable);
```
