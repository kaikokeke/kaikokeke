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

Below we present the integration of this class with some of the most popular store managers. It is not intended to be an exhaustive list of integration with all the functionalities, but an example of how to do this with the manager that uses the application in which it is going to be used.

### Using a basic RxJS State Manager

The most basic implementation uses an [RxJS](https://rxjs.dev/) [BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject) property as store.

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

const store: Store<Properties> = createStore({}, { name: 'environment', resettable: true });

class AkitaEvironmentStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    return store._select((state: Properties) => state);
  }

  getAll(): Properties {
    return store.getValue();
  }

  update(properties: Properties): void {
    isDev() && setAction('Update');
    store._setState(properties);
  }

  reset(): void {
    store.reset();
  }
}
```

### Using Redux State Container

[Redux](https://redux.js.org/) is a predictable state container for JavaScript apps.

It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as live code editing combined with a time traveling debugger.

You can use Redux together with React, or with any other view library. It is tiny (2kB, including dependencies), but has a large ecosystem of addons available.

```ts
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { Action, createStore, Reducer, Store } from 'redux';
import { Observable, Subscriber } from 'rxjs';

interface EnvironmentAction extends Action<string> {
  properties?: Properties;
}

const environmentReducer: Reducer = (state: Properties = {}, action: EnvironmentAction) => {
  switch (action.type) {
    case 'UPDATE':
      return action.properties;
    case 'RESET':
      return {};
    default:
      return state;
  }
};

const store: Store<Properties> = createStore(environmentReducer);

class ReduxEvironmentStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    return new Observable((observer: Subscriber<Properties>) => {
      observer.next(reduxStore.getState());

      const unsubscribe = reduxStore.subscribe(() => {
        observer.next(reduxStore.getState());
      });

      return unsubscribe;
    });
  }

  getAll(): Properties {
    return store.getState();
  }

  update(properties: Properties): void {
    store.dispatch({ type: 'UPDATE', properties });
  }

  reset(): void {
    store.dispatch({ type: 'RESET' });
  }
}
```
