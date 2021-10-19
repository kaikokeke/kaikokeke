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

### Exposed Methods

#### `getAll$()`

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
