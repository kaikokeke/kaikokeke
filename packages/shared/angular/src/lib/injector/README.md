# Injector Module

Creates an `inject()` function that is able to inject any token available in the application.

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

#### `static get injector(): Injector | undefined`

Gets the Angular's implemented Injector.

```ts
import { Injector } from '@angular/core';
import { InjectorModule } from '@kaikokeke/angular';

const injector: Injector = InjectorModule.injector;
```

### Function

#### `function inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;`

Retrieves an instance from the Injector based on the provided token.

```ts
import { inject } from '@kaikokeke/angular';
import { Service } from './service.service.ts';

const service: Service = inject(Service);
```

Returns the injected instance if defined, otherwise the `notFoundValue`.

Throws when `InjectorModule` is not imported.

Throws when the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.

## Examples of use

First, import the `InjectorModule`.

```ts
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InjectorModule } from '@kaikokeke/angular';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule, InjectorModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Injects avoiding constructor

It allows to inject dependencies avoiding populating the constructor, facilitating inheritance.
It is especially recommended for singletons, although you have to be careful, as many abstract classes, such as `ChangeDetectorRef` cannot be injected this way.

```ts
import { HttpClient } from '@angular/common/http';
import { inject } from '@kaikokeke/angular';
import { Observable } from 'rxjs';

export abstract class AbstractComponent {
  readonly http: HttpClient = inject(HttpClient);
}

@Component({ template: '' })
export class AppComponent extends AbstractComponent {
  readonly json$: Observable<Object> = this.http.get('file.json');
}
```

### Injects in a function

In this way you can easily inject a service into a function, facilitating code separation.

```ts
import { HttpClient } from '@angular/common/http';
import { inject } from '@kaikokeke/angular';
import { Observable } from 'rxjs';

function getJson$(): Observable<Object> {
  const http: HttpClient = inject(HttpClient);
  return http.get('file.json');
}

@Component({ template: '' })
export class AppComponent {
  readonly json$: Observable<Object> = getJson$();
}
```
