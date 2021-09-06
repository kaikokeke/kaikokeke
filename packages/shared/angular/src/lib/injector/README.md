# Injector Module

Creates an `injector()` function that is able to inject any token available in the application.

It's very useful to avoid populating the constructor in inherited classes with singletons and to use services in functions or environments outside of Angular entities.

## Getting Started

Import the `InjectorModule` in every module that wants to use this feature.

```ts
import { NgModule } from '@angular/core';
import { InjectorModule } from '@kaikokeke/angular';

@NgModule({
  imports: [InjectorModule],
})
export class AppModule {}
```

## API

### InjectorModule

Exposes the Angular's implemented Injector.

#### `static get injector(): Injector`

Gets the Angular's implemented Injector.

```ts
import { Injector } from '@angular/core';
import { InjectorModule } from '@kaikokeke/angular';

const injector: Injector = InjectorModule.injector;
```

### Function

#### `function injector<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;`

Retrieves an instance from the injector based on the provided token.

```ts
import { injector } from '@kaikokeke/angular';
import { Service } from './service.service.ts';

const service: Service = injector(Service);
```

Returns the instance from the injector if defined, otherwise the `notFoundValue`.

Throws when `InjectorModule` is not imported.

Throws when the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.

## Examples of use

```ts
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { InjectorModule } from '@kaikokeke/angular';

@NgModule({
  imports: [InjectorModule, HttpClientModule],
})
export class AppModule {}
```

### Inject avoiding injection in constructor

```ts
import { HttpClient } from '@angular/common/http';
import { injector } from '@kaikokeke/angular';

export abstract class AbstractComponent {
  readonly http: HttpClient = injector(HttpClient);
}

@Component({ template: '' })
export class AppComponent extends AbstractComponent {
  readonly json$: Observable<Record<string, unknown>> = this.http.get('environment.json');
}
```

### Inject in function

```ts
import { HttpClient } from '@angular/common/http';
import { injector } from '@kaikokeke/angular';

function getJson$(): Observable<Record<string, unknown>> {
  const http: HttpClient = injector(HttpClient);
  return http.get('environment.json');
}

@Component({ template: '' })
export class AppComponent {
  readonly json$: Observable<Record<string, unknown>> = getJson$();
}
```
