# Properties Source

Definition of the source from which to get environment properties asynchronously.

```ts
interface PropertiesSource {
  name?: string;
  requiredToLoad?: boolean;
  loadInOrder?: boolean;
  mergeProperties?: boolean;
  ignoreError?: boolean;
  path?: Path;
  load(): ObservableInput<Properties>;
}
```

## Getting Started

The property source can be used by extending from the abstract class or implemented as an interface.

```ts
import { PropertiesSource, Properties } from '@kaikokeke/environment';

export class ExtendsSource extends PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }];
  }
}

export class ImplementsSource implements PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }];
  }
}

const source: PropertiesSource = new ExtendsSource();
```

This minimal implementation can be extended by setting properties as described in the API and examples below.

## API

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
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(10));
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
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
    return interval(10).pipe(map((value: number) => ({ a: value })));
  }
}

loader.load(); // will never resolve
// sets the InfiniteSource properties every 10 ms
```

The loader will reject after a required to load source error.

```ts
export class FirstSource implements PropertiesSource {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(
      catchError((error: Error) => timer(10).pipe(mergeMap(() => throwError(error)))),
    );
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

loader.load(); // rejects after 10 ms
// sets the SecondSource properties after 20 ms
```

The loader will resolves normally after a no required to load source error.

```ts
export class FirstSource implements PropertiesSource {
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(
      catchError((error: Error) => timer(10).pipe(mergeMap(() => throwError(error)))),
    );
  }
}

export class SecondSource implements PropertiesSource {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
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
    return throwError(new Error()).pipe(
      catchError((error: Error) => timer(10).pipe(mergeMap(() => throwError(error)))),
    );
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

#### `path?: Path`

The path to set the properties in the environment.

```ts
source.path = 'user';
source.path = 'user.info';
source.path = ['user', 'info'];
```

See [`Path`](../types/path.type.ts)

### Exposed Methods

#### `load(): ObservableInput<Properties>`

Asynchronously loads the environment properties from the source.

```ts
source.load();
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

In this use case is necessary to set a maximum wait time before loading the application, regardless of whether the required source values ​​are loaded.

```ts
import { PropertiesSource, Properties } from '@kaikokeke/environment';
import { Observable, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

export class MaxLoadTimeSource extends PropertiesSource {
  name = 'MaxLoadTimeSource';
  maxTime = 10000;

  load(): Observable<Properties> {
    return timer(this.maxTime).pipe(
      map(() => throw new Error(`Timeout in ${Math.round(this.maxTime / 1000)} s`),
      take(1)
    ));
  }
}
```

### Load on required properties available

Sometimes we want to load the app as soon as a set of required properties are available.

```ts
import { AtLeastOne } from '@kaikokeke/commons';
import { EnvironmentQuery, Path, PropertiesSource, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

export class RequiredPropertiesAvailableSource extends PropertiesSource {
  name = 'RequiredPropertiesAvailableSource';
  requiredKeys: AtLeastOne<Path> = ['user.name', 'basePath'];

  constructor(protected readonly query: EnvironmentQuery) {
    super();
  }

  load(): Observable<Properties> {
    return this.query.containsAll(...requiredKeys).pipe(
      filter((contains: boolean) => contains),
      map(() => ({})),
      take(1),
    );
  }
}
```

### Fallback sources

Sometimes is needed to provide a fallback source if the first one fails. This can be done easily in the original properties source with the `catchError` function. This condition can be chained as many times as necessary.

```ts
import { PropertiesSource, Properties } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators':
import { HttpClient } from '...';

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
import { ServerSideEventClient } from '...';

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
