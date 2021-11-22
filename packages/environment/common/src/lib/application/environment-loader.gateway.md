# Environment Loader

Loads the environment properties from the provided asynchronous sources.

## Getting Started

You can create an environment query with `TypeScript` by extending from `EnvironmentLoader`. This option is ideal to change or extends the service behavior, as described in the API and examples.

```ts
import { EnvironmentLoader, EnvironmentService, PropertiesSource } from '@kaikokeke/environment';
import { environmentService } from './environment.service';
import { environmentSources } from './environment.sources';

class SimpleEnvironmentLoader extends EnvironmentLoader {
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    super(service, sources);
  }
}

export const environmentLoader: EnvironmentLoader = new SimpleEnvironmentLoader(environmentService, environmentSources);
```

If you want to create a pure `JavaScript` implementation you can use the `createEnvironmentLoader(service, sources)` function.

```js
import { createEnvironmentLoader } from '@kaikokeke/environment';
import { environmentService } from './environment.service';
import { environmentSources } from './environment.sources';

const environmentLoader = createEnvironmentLoader(environmentService, environmentSources);
```

## API

```ts
function createEnvironmentLoader(
  service: EnvironmentService,
  sources?: PropertiesSource | PropertiesSource[],
): EnvironmentLoader;
```

```ts
abstract class EnvironmentLoader {
  constructor(
    protected readonly service: EnvironmentService,
    protected readonly sources?: PropertiesSource | PropertiesSource[],
  );
  async load(): Promise<void>;
  preAddProperties(properties: Properties, source: LoaderPropertiesSource): Properties;
  resolveLoad(): void;
  rejectLoad<E>(error: E): void;
  completeAllSources(): void;
  completeSource(id: string): void;
  onDestroy(): void;
}
```

### Function

#### `function createEnvironmentLoader(service: EnvironmentService, sources?: PropertiesSource | PropertiesSource[]): EnvironmentLoader`

Creates an environment loader service.

```ts
createEnvironmentLoader(environmentService, environmentSources);
```

Returns a basic EnvironmentLoader instance.

```ts
const environmentLoader: EnvironmentLoader = createEnvironmentLoader(environmentService, environmentSources);
```

### Exposed Methods

#### `async load(): Promise<void>`

Loads the environment properties from the provided asynchronous sources.

```ts
environmentLoader.load();
```

Returns a promise to load once the `requiredToLoad` sources are loaded.

```ts
environmentLoader
  .load()
  .then(() => {})
  .catch(<E>(error: E) => {});
```

#### `preAddProperties(properties: Properties, source?: LoaderPropertiesSource): Properties`

Middleware function that gives the possibility to modify the source properties before inserting it into the environment.

```ts
environmentLoader.preAddProperties({});
```

The `preAddProperties()` middleware is called when we invoke the `EnvironmentService.add()` or `EnvironmentService.merge()` methods with the newly added properties, and gives you the possibility to modify it before inserting it into the environment.

```ts
preAddProperties(properties: Properties, source?: LoaderPropertiesSource): Properties {
  return {...properties, ...{ sources: [source.name ?? source.id] } };
}
```

#### `resolveLoad(): void`

Forces the load to resolve.

```ts
environmentLoader.resolveLoad();
```

#### `rejectLoad<E>(error: E): void`

Forces the load to reject.

```ts
environmentLoader.rejectLoad(new Error());
```

#### `completeAllSources(): void`

Forces the load to resolve and stops all ongoing source loads.

```ts
environmentLoader.completeAllSources();
```

#### `completeSource(id: string): void`

Completes a source load.

```ts
environmentLoader.completeSource('550e8400-e29b-41d4-a716-446655440000');
```

#### `onDestroy(): void`

Forces the load to resolve, stops all ongoing source loads and completes the subjects.

```ts
environmentLoader.onDestroy();
```

## Lifecycle Hooks

An `EnvironmentLoader` instance has a lifecycle that starts each time the `load()` method is invoked. Each lifecycle ends when the method returns. Your implementation can use lifecycle hook methods to tap into key events in the environment loader service.

Respond to events in the lifecycle of the loader by implementing one or more of the _lifecycle hook_ interfaces presented below. The hooks give you the opportunity to act on the instance at the appropriate moment.

Each interface defines the prototype for a single hook method, whose name is the interface name starting in lowercase. For example, the `OnBeforeLoad` interface has a hook method named `onBeforeLoad()`.

You don't have to implement all (or any) of the lifecycle hooks, just the ones you need.

### OnBeforeLoad

### OnAfterLoad

### OnAfterError

### OnAfterComplete

### OnBeforeSourceLoad

### OnBeforeSourceAdd

### OnAfterSourceAdd

### OnAfterSourceError

### OnAfterSourceComplete

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
