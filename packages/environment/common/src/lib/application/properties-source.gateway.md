# Properties Source

An environment properties source definition to get the application properties asynchronously.

```ts
export abstract class PropertiesSource {
  name: string = this.constructor.name;
  requiredToLoad: boolean = false;
  loadInOrder: boolean = false;
  loadImmediately: boolean = false;
  dismissOtherSources: boolean = false;
  deepMergeValues: boolean = false;
  resetEnvironment: boolean = false;
  ignoreError: boolean = false;
  path?: Path;
  abstract load(): ObservableInput<Properties>;
}
```

## Getting Started

For a minimal implementation create a class that extends from `PropertiesSource` and implement the `load()` method.

```ts
import { Properties, PropertiesSource } from '@kaikokeke/environment';

export class TestSource extends PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }];
  }
}
```

This minimal implementation can be extended by setting properties or using other classes in the load method, as described in the API and examples below.

## API

### Exposed Properties

### `id`

The unique random id for each class instance.

```ts
readonly id: string = v4();
```

Uses a RFC4122 v4 generator.

### `name`

The properties source name.
Defaults to the class name.

```ts
name: string = this.constructor.name;
```

> If the code is minimized or uglified on build and logs are stored, this property should be overridden with a descriptive value, such as the class name, because the constructor name changes in these processes.

#### `requiredToLoad`

Loads the source values before the application or submodule load.
Defaults to `false`.

```ts
requiredToLoad = false;
```

#### `loadInOrder`

Loads the source in the order defined in the array.
The ordered sources will wait until the previous ordered source completes to start.
Defaults to `false`.

```ts
loadInOrder = false;
```

#### `loadImmediately`

The application or submodule will load immediately after loading the source.
Defaults to `false`.

```ts
loadImmediately = false;
```

#### `dismissOtherSources`

Dismiss the loading of all other sources after this source load and loads the application or submodule.
Defaults to `false`.

```ts
dismissOtherSources = false;
```

#### `deepMergeValues`

The source recursively merge own and inherited enumerable values into the properties.
Defaults to `false`.

```ts
deepMergeValues = false;
```

#### `resetEnvironment`

Resets the environment before inserting the properties from this source.
Defaults to `false`.

```ts
resetEnvironment = false;
```

#### `ignoreError`

Ignores the errors from the source load.
The application or submodule load will not occur if the source load throws an error.
Defaults to `false`.

```ts
ignoreError = false;
```

#### `path`

The optional path where the loaded properties are going to be setted in the environment.
If a path is not specified, the loaded properties will be set to the root of the environment properties.

```ts
path?: Path;
```

### Exposed Methods

#### `load(): ObservableInput<Properties>`

Asynchronously loads environment properties from source.

```ts
load(): ObservableInput<Properties>;
```

```ts
export declare type ObservableInput<Properties> =
  | Subscribable<Properties>
  | PromiseLike<Properties>
  | InteropObservable<Properties>
  | ArrayLike<Properties>
  | Iterable<Properties>;
```

## Examples of use

### Max load time

If it is necessary to set a maximum wait time before loading the application, regardless of whether the required source values ​​are loaded, we can create a `PropertiesSource` with `loadImmediately` set to `true`. This is because we do want to wait for max load source to load the application.

```ts
export class MaxLoadTimeSource extends PropertiesSource {
  readonly loadImmediately = true;

  load(): Observable<Properties> {
    return of({}).pipe(delay(1000));
  }
}
```

### Fallback sources

Sometimes is needed to provide a fallback source if the first one fails. This can be done easily in the original properties source with the `catchError` function. This condition can be chained as many times as necessary.

```ts
export class FileSource extends PropertiesSource {
  constructor(protected readonly http: HttpClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.http.get('environment.json').pipe(catchError(() => this.http.get('environment2.json')));
  }
}
```

### Sources for Long-lived Observables

If the application needs to load the properties from sources that emit multiple times asynchronously, such as a webservice or a Server Sent Event (SSE) service, ensure that `loadInOrder` is `false` or is the last source, because ordered sources must complete to let the next one start.

```ts
export class ServerSideEventSource extends PropertiesSource {
  readonly loadInOrder = false;

  constructor(protected readonly sse: ServerSideEventClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.sse.get('/my-endpoint');
  }
}
```