# Environment Store

Manages the environment store.

This object stores all the environment properties that the system needs, functioning as the only point of truth for them. It can be adapted to use any store system that is already using the application or implement your own.

## Getting Started

You can create an environment store with `TypeScript` by extending from `EnvironmentStore` and implementing the required methods as described in the API and examples.

```ts
import { EnvironmentStore } from '@kaikokeke/environment';

class SimpleEnvironmentStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    // implementation
  }

  getAll(): Properties {
    // implementation
  }

  update(properties: Properties): void {
    // implementation
  }

  reset(): void {
    // implementation
  }
}

const environmentStore: EnvironmentStore = new SimpleEnvironmentStore();
```

If you want to create a pure `JavaScript` implementation you must create a plain object with the same function properties described in the `TypeScript` class implementation.

```js
const environmentStore = {
  getAll$ = () => { return },
  getAll = () => { return },
  update = (properties) => {},
  reset = () => {},
}
```

## API

```ts
abstract class EnvironmentStore {
  abstract getAll$(): Observable<Properties>;
  abstract getAll(): Properties;
  abstract update(properties: Properties): void;
  abstract reset(): void;
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

It is important to ensure that **the store update is an overwrite and not a partial update**, as the service will manage the entire environment in the implementation, and a partial update can cause inconsistencies.

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

A basic RxJS implementation can use a [BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject) as store.

```ts
// TypeScript
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { BehaviorSubject, Observable } from 'rxjs';

class RxjsEnvironmentStore extends EnvironmentStore {
  private readonly _environment: BehaviorSubject<Properties> = new BehaviorSubject({});

  getAll(): Properties {
    return this._environment.getValue();
  }

  getAll$(): Observable<Properties> {
    return this._environment.asObservable();
  }

  update(properties: Properties): void {
    this._environment.next(properties);
  }

  reset(): void {
    this._environment.next({});
  }
}

const environmentStore: EnvironmentStore = new RxjsEnvironmentStore();
```

```js
// JavaScript
import { BehaviorSubject } from 'rxjs';

const _environment = new BehaviorSubject({});

const environmentStore = {
  getAll$: () => _environment.asObservable(),
  getAll: () => _environment.getValue(),
  update: (properties) => {
    _environment.next(properties);
  },
  reset: () => {
    _environment.next({});
  },
};
```

### Using Akita Reactive State Management

[Akita](https://datorama.github.io/akita/) is a state management pattern, built on top of RxJS, which takes the idea of multiple data stores from Flux and the immutable updates from Redux, along with the concept of streaming data, to create the Observable Data Store model. Akita can work with any framework and can be used with plain JS.

```ts
// TypeScript
import { isDev, setAction, Store, StoreConfig } from '@datorama/akita';
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';

@StoreConfig({ name: 'environment', resettable: true })
class AkitaStore extends Store<Properties> {
  constructor() {
    super({});
  }
}

class AkitaEvironmentStore extends EnvironmentStore {
  constructor(private readonly _environment: Store<Properties>) {
    super();
  }

  getAll$(): Observable<Properties> {
    return this._environment._select((state: Properties) => state);
  }

  getAll(): Properties {
    return this._environment.getValue();
  }

  update(properties: Properties): void {
    isDev() && setAction('Update');
    this._environment._setState(properties);
  }

  reset(): void {
    this._environment.reset();
  }
}

const akitaStore: Store<Properties> = new AkitaStore();

const environmentStore: EnvironmentStore = new AkitaEvironmentStore(akitaStore);
```

```js
// JavaScript
import { createStore, isDev, setAction } from '@datorama/akita';

const _environment = createStore({}, { name: 'environment', resettable: true });

const environmentStore = {
  getAll$: () => _environment._select((state: Properties) => state),
  getAll: () => _environment.getValue(),
  update: (properties) => {
    isDev() && setAction('Update');
    _environment._setState(properties);
  },
  reset: () => {
    _environment.reset();
  },
};
```

### Using Redux State Container

[Redux](https://redux.js.org/) is a predictable state container for JavaScript apps. It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. You can use Redux together with React, or with any other view library.

```ts
// TypeScript
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { Action, createStore, Reducer, Store } from 'redux';
import { Observable, from } from 'rxjs';

interface EnvironmentAction extends Action<string> {
  properties?: Properties;
}

const _environmentReducer: Reducer = (state: Properties = {}, action: EnvironmentAction) => {
  switch (action.type) {
    case 'UPDATE':
      return action.properties;
    case 'RESET':
      return {};
    default:
      return state;
  }
};

class ReduxEvironmentStore extends EnvironmentStore {
  private readonly _environment: Store<Properties> = createStore(_environmentReducer);

  getAll$(): Observable<Properties> {
    return from(this._environment as ObservableInput<Properties>);
  }

  getAll(): Properties {
    return this._environment.getState();
  }

  update(properties: Properties): void {
    this._environment.dispatch({ type: 'UPDATE', properties });
  }

  reset(): void {
    this._environment.dispatch({ type: 'RESET' });
  }
}

const environmentStore: EnvironmentStore = new ReduxEvironmentStore();
```

```js
// JavaScript
import { createStore } from 'redux';
import { from } from 'rxjs';

const _environmentReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE':
      return action.properties;
    case 'RESET':
      return {};
    default:
      return state;
  }
};
const _environment = createStore(_environmentReducer);

const environmentStore = {
  getAll$: () => from(_environment),
  getAll: () => _environment.getState(),
  update: (properties) => {
    _environment.dispatch({ type: 'UPDATE', properties });
  },
  reset: () => {
    _environment.dispatch({ type: 'RESET' });
  },
};
```
