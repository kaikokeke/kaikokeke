# Environment

## Use cases

### Max load time

If it is necessary to set a maximum wait time before loading the application, regardless of whether the required source values ​​are loaded, we can create a `PropertiesSourceGateway` with `loadImmediately` set to `true` and `requiredToLoad` and `loadInOrder` setted to `false`. This is because we do want to wait for max load source to load the application.

```ts
export class MaxLoadTimeSource extends PropertiesSourceGateway {
  readonly requiredToLoad = false;
  readonly loadInOrder = false;
  readonly loadImmediately = true;

  load(): Observable<Properties> {
    return of({}).pipe(delay(1000));
  }
}
```

### Fallback sources

Sometimes is needed to provide a fallback source if the first one fails. This can be done easily in the original properties source with the `catchError` function. This condition can be chained as many times as necessary.

```ts
export class FileSource extends PropertiesSourceGateway {
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
export class ServerSideEventSource extends PropertiesSourceGateway {
  readonly loadInOrder = false;

  constructor(protected readonly sse: ServerSideEventClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.sse.get('/my-endpoint');
  }
}
```
