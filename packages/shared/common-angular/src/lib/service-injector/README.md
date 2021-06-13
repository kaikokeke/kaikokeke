# Service Injector Module

Creates a `serviceInjector()` function that is able to statically inject any service available in the application.

It's very useful to avoid populating the constructor in inherited classes with singletons and to use services in functions or environments outside of Angular entities.

## Getting Started

Import the `ServiceInjectorModule` in every module that wants to use this feature.

```ts
import { ServiceInjectorModule } from '@kaikokeke/common-angular';

@NgModule({
  imports: [ServiceInjectorModule],
})
export class AppModule {}
```

## API

### `function serviceInjector<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;`

Retrieves an instance from the injector based on the provided token.

Returns The instance from the injector if defined, otherwise the `notFoundValue`.

Throws if no `ServiceInjectorModule` imported, the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.

```ts
import { ServiceInjector } from '@kaikokeke/common-angular';

export abstract class AbstractComponent {
  readonly http: HttpClient = serviceInjector(HttpClient);
}

@Component({ template: '' })
export class AppComponent extends AbstractComponent {
  readonly json$: Observable<{ [key: string]: any }> = this.http.get('environment.json');
}

function getJson$(): Observable<{ [key: string]: any }> {
  const http: HttpClient = serviceInjector(HttpClient);
  return http.get('environment.json');
}
```

## Decorators

### @Autowired()

Sets an instance from the injector based on the provided token.

```ts
@Autowired<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags)
```

Throws if no `ServiceInjectorModule` imported, the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.

```ts
@Component({ template: '' })
export class AppComponent {
  @Autowired(HttpClient)
  protected readonly http: HttpClient;

  load(): Observable<{ [key: string]: any }> {
    return this.http.get('environment.json');
  }
}
```
