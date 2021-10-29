# Environment Store

Manages the environment store.

This stores all the environment properties that the system needs, functioning as the only point of truth for them. It can be adapted to use any store system that is already using the application or implement your own.

## Getting Started

You can create an environment store class by extending from `EnvironmentStore` and implementing the required methods as described in the API and examples.

```ts
import { EnvironmentStore } from '@kaikokeke/environment';

class SimpleEnvironmentStore extends EnvironmentStore {
  // implement methods
}

export const store: EnvironmentStore = new SimpleEnvironmentStore();
```

## API

```ts
abstract class EnvironmentStore {
  getAll$(): Observable<Properties>;
  getAll(): Properties;
  update(properties: Properties): void;
  reset(): void;
}
```

### Exposed Methods

#### `getAll$(): Observable<Properties>`

Gets all properties from the environment store.

```ts
store.getAll$(); // -{a:0}--{a:0}--{a:0,b:0}-
```

Returns the environment properties as Observable that emits on every environment change.

#### `getAll(): Properties`

Gets all properties from the environment store.

```ts
store.getAll(); // {a:0}
```

Returns the environment properties.

#### `update(properties: Properties): void`

Updates the properties in the environment store.

```ts
store.getAll(); // {}
store.update({ a: 0 });
store.getAll(); // {a:0}
```

It is important to ensure that **the store update is an overwrite and not partial update**, as the service will manage the entire environment in the implementation, and a partial update can cause inconsistencies.

```ts
// overwrite
store.getAll(); // {a:0}
store.update({ b: 0 });
store.getAll(); // {b:0}

// partial update
store.getAll(); // {a:0}
store.update({ b: 0 });
store.getAll(); // {a:0,b:0}
```

#### `reset(): void`

Resets the environment store to the initial state.

```ts
store.getAll(); // {a:0}
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

[Redux](https://redux.js.org/) is a predictable state container for JavaScript apps. It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. You can use Redux together with React, or with any other view library.

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
      observer.next(store.getState());

      return store.subscribe(() => {
        observer.next(store.getState());
      });
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

### Using LocalStorage

The RxJS implementation can be extended by storing environment properties in localStorage (or any other browser storage), so that previously loaded properties are available right when the loader is instantiated.

```ts
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { BehaviorSubject, Observable } from 'rxjs';

class LocalStorageEvironmentStore extends EnvironmentStore {
  private readonly _key = 'env';
  private readonly _resetValue: Properties = {};
  private readonly _properties: BehaviorSubject<Properties> = new BehaviorSubject(this._resetValue);

  constructor() {
    super();
    const localEnvironment: Properties = this.getAll();
    this._properties.next(localEnvironment);
  }

  getAll$(): Observable<Properties> {
    return this._properties.asObservable();
  }

  getAll(): Properties {
    const properties: string = localStorage.getItem(this._key) ?? JSON.stringify(this._resetValue);

    return JSON.parse(properties);
  }

  reset(): void {
    this.update(this._resetValue);
  }

  update(properties: Properties): void {
    localStorage.setItem(this._key, JSON.stringify(properties));
    this._properties.next(properties);
  }
}
```
