# Environment Store

Manages the environment store.

## Getting Started

You can create an environment store class extending from `EnvironmentStore` and implementing the required methods as described in the API and examples.

## API

### Exposed Methods

#### `getAll$(): Observable<Properties>`

Gets all properties from the environment store.

```ts
store.getAll$(); // Observable { a: 0 } ... { a: 0, b: 0 }
```

Returns the environment properties as Observable that emits on every environment change.

#### `getAll(): Properties`

Gets all properties from the environment store.

```ts
store.getAll(); // { a: 0 }
```

Returns the environment properties.

#### `update(properties: Properties): void`

Updates the properties in the environment store.

```ts
store.getAll(); // {}
store.update({ a: 0 });
store.getAll(); // { a: 0 }
```

It is important to ensure that **the store update is complete and not partial**, as the service will manage the entire environment in the implementation, and a partial update can cause inconsistencies.

```ts
// Total update
store.getAll(); // { a: 0 }
store.update({ b: 0 });
store.getAll(); // { b: 0 }

// Partial update
store.getAll(); // { a: 0 }
store.update({ b: 0 });
store.getAll(); // { a: 0, b: 0 }
```

#### `reset(): void`

Resets the environment store to the initial state.

```ts
store.getAll(); // { a: 0 }
store.reset();
store.getAll(); // {}
```

## Examples of use

### Using a basic RxJS State Manager

The most basic implementation uses a property as store.

```ts
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export class RxjsEnvironmentStore extends EnvironmentStore {
  private readonly _properties: BehaviorSubject<Properties> = new BehaviorSubject({});

  getAll(): Properties {
    return this._properties.getValue();
  }

  getAll$(): Observable<Properties> {
    return this._properties.asObservable();
  }

  update(properties: Properties): void {
    this._properties.next(properties);
  }

  reset(): void {
    this._properties.next({});
  }
}
```

### Using Akita Reactive State Management

[Akita](https://datorama.github.io/akita/) is a state management pattern, built on top of RxJS, which takes the idea of multiple data stores from Flux and the immutable updates from Redux, along with the concept of streaming data, to create the Observable Data Store model. Akita can work with any framework and can be used with plain JS.

```ts
import { createStore, isDev, setAction, Store } from '@datorama/akita';
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';

class AkitaEvironmentStore extends EnvironmentStore {
  private readonly store: Store<Properties> = createStore({}, { name: 'environment', resettable: true });

  getAll$(): Observable<Properties> {
    return this.store._select((state: Properties) => state);
  }

  getAll(): Properties {
    return this.store.getValue();
  }

  update(properties: Properties): void {
    isDev() && setAction('Update');
    this.store._setState(properties);
  }

  reset(): void {
    this.store.reset();
  }
}
```
