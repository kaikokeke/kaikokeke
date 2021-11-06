# Environment Loader

Loads the environment properties from the provided asynchronous sources.

## Getting Started

You can create an environment loader class extending from `EnvironmentLoader`.

```ts
import { EnvironmentLoader, EnvironmentService, PropertiesSource } from '@kaikokeke/environment';
import { environmentService } from './environment.service.ts';
import { environmentSources } from './environment.sources.ts';

class SimpleEnvironmentLoader extends EnvironmentLoader {
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    super(service, surces);
  }
}

export const environmentQuery: EnvironmentLoader = new SimpleEnvironmentLoader(environmentService, environmentSources);
```

## API

```ts
abstract class EnvironmentLoader {
  load(): Promise<void>;
  resolveLoad(): void;
  rejectLoad<E>(error: E): void;
  completeAllSources(): void;
  completeSource(id: string): void;
  onDestroy(): void;
}
```

### Exposed Methods

#### `async load(): Promise<void>`

Loads the environment properties from the provided asynchronous sources.

Returns a promise to load once the `requiredToLoad` sources are loaded.

## Lifecycle Hooks

An `EnvironmentLoader` instance has a lifecycle that starts each time the `load()` or `loadSubmodule()` methods are invoked. Each lifecycle ends when the method returns. Your implementation can use lifecycle hook methods to tap into key events in the environment loader service.

Respond to events in the lifecycle of the loader by implementing one or more of the _lifecycle hook_ interfaces presented below. The hooks give you the opportunity to act on the instance at the appropriate moment.

Each interface defines the prototype for a single hook method, whose name is the interface name starting in lowercase. For example, the `OnBeforeLoad` interface has a hook method named `onBeforeLoad()`.

You don't have to implement all (or any) of the lifecycle hooks, just the ones you need.

### `OnBeforeLoad`

### `OnAfterLoad`

### `OnAfterError`

### `OnAfterComplete`

### `OnBeforeSourceLoad`

### `OnBeforeSourceAdd`

### `OnAfterSourceAdd`

### `OnAfterSourceError`

### `OnAfterSourceComplete`

## Source Middleware

It’s possible to define a middleware function to manage how properties before they are added to the environment.

### `preAddProperties(properties: Properties, source: LoaderPropertiesSource): Properties`

The `preAddProperties()` middleware is called when we invoke the `EnvironmentService.add()` or `EnvironmentService.merge()` methods with the newly added properties, and gives you the possibility to modify it before inserting it into the environment.

## Examples of use

### Completes after error

Is a common requirement to complete all sources after application load error and reset the environment store.
It's easy to do by implementing `OnAfterLoadError`.

```ts
import { EnvironmentLoader, EnvironmentService, OnAfterError, PropertiesSource } from '@kaikokeke/environment';

export class AfterErrorEnvironmentLoader extends EnvironmentLoader implements OnAfterError {
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    super(service, sources);
  }

  protected onAfterError(): void {
    this.onDestroy();
    this.service.reset();
  }
}
```

### Dismiss other sources

If the application must stop loading all the rest of sources after load.

### Load immediately

### Multiple sources ignore error until X error

### Max load time

### Load on required properties available
