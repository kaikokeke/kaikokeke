# Properties Source

Definition of the source from which to get environment properties asynchronously.

## Getting Started

You can create a properties source with `TypeScript` by extending from `PropertiesSource` and implementing the required methods as described in the API and examples.

```ts
import { PropertiesSource, Properties } from '@kaikokeke/environment';

class ExtendsSource extends PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }];
  }
}

const source: PropertiesSource = new ExtendsSource();
```

If you want to create a pure `JavaScript` implementation you must create a plain object with the same properties and function properties described in the `TypeScript` class implementation.

```ts
const source = {
  load: () => [{ a: 0 }],
};
```

## API

```ts
abstract class PropertiesSource {
  name?: string;
  requiredToLoad?: boolean;
  loadInOrder?: boolean;
  mergeProperties?: boolean;
  ignoreError?: boolean;
  path?: Path;
  abstract load(): ObservableInput<Properties>;
}
```

### Exposed Properties

#### `name?: string`

The source name.

```ts
source.name = 'ExtendsSource';
```

Set the name if you're planning to use a loader source lifecycle to add custom behavior to the source. This way it will be easier to discriminate the source to decide whether or not the custom code is executed.
Avoid the use of `constructor.name` because if the code is minimized or uglified on build the constructor name changes.

#### `requiredToLoad?: boolean`

Loads the required to load sources properties before the app load.

```ts
source.requiredToLoad = true;
```

It's useful to delay the loading of the application until all the necessary properties from this sources are available in the environment.

```ts
export class FirstSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(10));
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(20));
  }
}

loader.load(); // resolves after 20 ms
// sets the FirstSource properties after 10 ms
// sets the SecondSource properties after 20 ms
```

If there is no required to load sources the loader will resolve immedialely.

```ts
export class NoRequiredSource implements PropertiesSource {
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(10));
  }
}

loader.load(); // resolves immedialely
// sets the NoRequiredSource properties after 10 ms
```

If a required to load source never completes the loader will never resolve.

```ts
export class InfiniteSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return interval(10).pipe(map((value: number) => ({ value })));
  }
}

loader.load(); // will never resolve
// sets the InfiniteSource properties every 10 ms
```

The loader will reject after a required to load source error.

```ts
export class FirstSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delayThrow(10));
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(20));
  }
}

loader.load(); // rejects after 10 ms
// sets the SecondSource properties after 20 ms
```

The loader will resolves normally after a no required to load source error.

```ts
export class FirstSource implements PropertiesSource {
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delayThrow(10));
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(20));
  }
}

loader.load(); // resolves after 20 ms
// sets the SecondSource properties after 20 ms
```

#### `loadInOrder?: boolean`

Loads the source in the declaration order.

```ts
source.loadInOrder = true;
```

The not loadInOrder sources will add properties all at once.

```ts
export class FirstSource implements PropertiesSource {
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(10));
  }
}

export class SecondSource implements PropertiesSource {
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

loader.load(); // resolves immediately
// sets the FirstSource properties after 10 ms
// sets the SecondSource properties after 10 ms
```

The loadInOrder sources will wait until the previous loadInOrder source completes to add the properties.

```ts
export class FirstSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ a: 0 }, { a: 1 }, { a: 2 }).pipe(delay(10));
  }
}

export class SecondSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

loader.load(); // resolves immediately
// sets the FirstSource properties after 10 ms, 20 ms & 30ms
// sets the SecondSource properties after 40 ms
```

If a loadInOrder source never completes will never set the next ordered source properties.

```ts
export class InfiniteSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return interval(10).pipe(map((value: number) => ({ a: value })));
  }
}

export class SecondSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

loader.load(); // resolves immediately
// sets the InfiniteSource properties every 10 ms
// never sets the SecondSource properties
```

If a loadInOrder source returns an error will be ignored and will continue with the next ordered source.

```ts
export class FirstSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delayThrow(10));
  }
}

export class SecondSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

loader.load(); // resolves immediately
// sets the SecondSource properties after 20 ms
```

#### `mergeProperties?: boolean`

Adds properties to the environment using the deep merge strategy.

```ts
source.mergeProperties = true;
```

See the `merge(properties, path?)` method from `EnvironmentService`.

#### `ignoreError?: boolean`

Ignores the errors thrown by the source.

```ts
source.ignoreError = true;
```

If a required to load source throws an error the loader will rejects, but if the `ignoreError` property is set to `true` the error will be ignored as a no required to load source error.

```ts
export class FirstSource implements PropertiesSource {
  requiredToLoad = true;
  ignoreError = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delayThrow(10));
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(20));
  }
}

loader.load(); // resolves after 20 ms
// sets the SecondSource properties after 20 ms
```

#### `path?: Path`

The path to set the properties in the environment.

```ts
source.path = 'user';
source.path = 'user.info';
source.path = ['user', 'info'];
```

```ts
type Path = string | string[];
```

### Exposed Methods

#### `load(): ObservableInput<Properties>`

Asynchronously loads the environment properties from the source.

```ts
source.load();
```

```ts
export type ObservableInput<Properties> =
  | PromiseLike<Properties>
  | Subscribable<Properties>
  | InteropObservable<Properties>
  | ArrayLike<Properties>
  | Iterable<Properties>;
```

The PropertiesSource can returns a Promise.

```ts
export class PromiseSource implements PropertiesSource {
  async load(): Promise<Properties> {
    return Promise.resolve({ a: 0 });
  }
}

loader.load(); // resolves immediately
// sets the PromiseSource properties after 0 ms
```

The PropertiesSource can returns an Observable or any other Subscribable type.

```ts
export class ObservableSource implements PropertiesSource {
  load(): Observable<Properties> {
    return of({ a: 0 });
  }
}

export class MultipleObservableSource implements PropertiesSource {
  load(): Observable<Properties> {
    return of({ a: 0 }, { b: 0 }, { c: 0 });
  }
}

loader.load(); // resolves immediately
// sets the ObservableSource properties after 0 ms
// sets the MultipleObservableSource properties after 0 ms, 1 ms and 2 ms
```

The PropertiesSource can returns an Array or any Iterable type.

```ts
export class ArraySource implements PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }];
  }
}

export class MultipleArraySource implements PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }, { b: 0 }, { c: 0 }];
  }
}

loader.load(); // resolves immediately
// sets the ArraySource properties after 0 ms
// sets the MultipleArraySource properties after 0 ms, 1 ms and 2 ms
```

## Examples of use

### Fallback sources

Sometimes is needed to provide a fallback source if the first one fails. This can be done easily in the original properties source with the `catchError` function. This condition can be chained as many times as necessary.

```ts
import { PropertiesSource, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators':
import { HttpClient } from './http-client.service';

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
import { PropertiesSource, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { ServerSideEventClient } from './server-side-event-client.service';

export class ServerSideEventSource extends PropertiesSource {
  loadInOrder = false;

  constructor(protected readonly sse: ServerSideEventClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.sse.get('/my-endpoint');
  }
}
```
