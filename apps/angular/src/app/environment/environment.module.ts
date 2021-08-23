import { APP_INITIALIZER, Inject, Injectable, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Query, Store, StoreConfig } from '@datorama/akita';
import {
  EnvironmentLoaderGateway,
  EnvironmentServiceGateway,
  EnvironmentStoreGateway,
  Properties,
  PropertiesSourceGateway,
} from '@kaikokeke/environment';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'environment', resettable: true })
export class AkitaEnvironmentStore extends Store<Properties> {
  constructor() {
    super({});
  }
}

@Injectable({ providedIn: 'root' })
export class AkitaEnvironmentQuery extends Query<Properties> {
  constructor(protected store: AkitaEnvironmentStore) {
    super(store);
  }
}

@Injectable()
export class EnvironmentStore extends EnvironmentStoreGateway {
  constructor(protected readonly store: AkitaEnvironmentStore, protected readonly query: AkitaEnvironmentQuery) {
    super();
  }

  getAll(): Properties {
    return this.query.getValue();
  }

  getAll$(): Observable<Properties> {
    return this.query.select();
  }

  update(newProperties: Properties): void {
    this.store.update(newProperties);
  }

  reset(): void {
    this.store.reset();
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources extends PropertiesSourceGateway {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;
  readonly loadImmediately = true;

  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources2 extends PropertiesSourceGateway {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources3 extends PropertiesSourceGateway {
  readonly loadInOrder = true;
  readonly requiredToLoad = true;

  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources4 extends PropertiesSourceGateway {
  readonly loadInOrder = false;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(5000));
  }
}

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSourceGateway[]> = new InjectionToken<
  PropertiesSourceGateway[]
>('ENVIRONMENT_SOURCES');

@Injectable({ providedIn: 'root' })
export class EnvironmentService extends EnvironmentServiceGateway {
  constructor(protected readonly store: EnvironmentStoreGateway) {
    super(store);
  }
}

@Injectable({ providedIn: 'root' })
export class EnvironmentLoader extends EnvironmentLoaderGateway {
  constructor(
    protected readonly service: EnvironmentService,
    @Inject(ENVIRONMENT_SOURCES) protected readonly sources: PropertiesSourceGateway[],
  ) {
    super(service, sources);
  }
}

export function environmentForRoot(loader: EnvironmentLoaderGateway): () => Promise<void> {
  return () => loader.load();
}

@NgModule({
  providers: [
    { provide: EnvironmentStoreGateway, useClass: EnvironmentStore },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources2, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources3, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources4, multi: true },
  ],
})
export class AkitaEnvironmentModule {
  static forRoot(): ModuleWithProviders<AkitaEnvironmentModule> {
    return {
      ngModule: AkitaEnvironmentModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: environmentForRoot,
          deps: [EnvironmentLoader],
          multi: true,
        },
      ],
    };
  }
}
