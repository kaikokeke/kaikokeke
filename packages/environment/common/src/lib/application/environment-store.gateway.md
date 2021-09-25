# Environment Store

Manages the environment store.

## Getting Started

You can create an environment store class extending from `EnvironmentStore` and implementing the required methods as described in the API and examples. The most basic implementation is shown below.

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

## API

### Exposed Methods

#### `getAll$(): Observable<Properties>`

#### `getAll(): Properties`

#### `update(properties: Properties): void`

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

## Examples of use
