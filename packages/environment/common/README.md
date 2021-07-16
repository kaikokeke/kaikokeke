# Environment

## Use cases

### Max load time

Since the application will not load until all initialization sources have been loaded, you may want to ensures that the system loads in a maximun time creating a `PropertiesSource` with load type immediate that emits at max load time.

```ts
export class MaxLoadTimeSource extends PropertiesSource {
  readonly loadType: LoadType = LoadType.IMMEDIATE;

  load(): Observable<Properties> {
    return of({}).pipe(delay(5000));
  }
}
```

### Fallback sources

Sometimes is needed to provide a fallback source if the first one fails. This can be done easily in the original properties source with the `catchError` function. This condition can be chained as many times as necessary.

```ts
export class FileSource extends PropertiesSource {
  constructor(protected readonly http: HttpClient) {}

  load(): Observable<Properties> {
    return this.http.get('environment.json').pipe(catchError(() => this.http.get('environment2.json')));
  }
}
```

### Sources for Long-lived Observables

If the application needs to load the properties from sources that emit multiple times asynchronously, such as a webservice or a Server Sent Events (SSE) service, use the `DEFERRED` load type. In this way the properties are updated automatically when received.

```ts
export class ServerSideEventSource extends PropertiesSource {
  readonly loadType: LoadType = LoadType.DEFERRED;

  constructor(protected readonly sse: ServerSideEventClient) {}

  load(): Observable<Properties> {
    return this.sse.get('/my-endpoint');
  }
}
```
