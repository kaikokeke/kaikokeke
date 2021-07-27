import { APP_INITIALIZER, Inject, Injectable, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Query, Store, StoreConfig } from '@datorama/akita';
import {
  EnvironmentConfig,
  EnvironmentLoaderGateway,
  EnvironmentServiceGateway,
  EnvironmentStoreGateway,
  LoadType,
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
  constructor(protected readonly store: AkitaEnvironmentStore) {
    super();
  }

  getAll(): Properties {
    return this.store.getValue();
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
  readonly name = 'TestSources';

  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources2 extends PropertiesSourceGateway {
  readonly name = 'TestSources2';

  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources3 extends PropertiesSourceGateway {
  readonly name = 'TestSources3';
  readonly loadType = LoadType.DEFERRED;
  // readonly isRequired = false;

  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(3000));
    // throw throwError(new Error('A custom error'));
  }
}

@Injectable({ providedIn: 'root' })
export class DeferredSource extends PropertiesSourceGateway {
  readonly name = 'DeferredSource';
  readonly loadType = LoadType.DEFERRED;

  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(5000));
  }
}

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSourceGateway[]> = new InjectionToken<
  PropertiesSourceGateway[]
>('ENVIRONMENT_SOURCES');

export const ENVIRONMENT_CONFIG: InjectionToken<PropertiesSourceGateway[]> = new InjectionToken<
  Partial<EnvironmentConfig>
>('ENVIRONMENT_CONFIG');

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
    @Inject(ENVIRONMENT_CONFIG) protected readonly partialConfig: Partial<EnvironmentConfig>,
    @Inject(ENVIRONMENT_SOURCES) protected readonly sources: PropertiesSourceGateway[]
  ) {
    super(service, partialConfig, sources);
  }
}

export function environmentForRoot(loader: EnvironmentLoaderGateway): () => Promise<void> {
  return () => loader.load();
}

@NgModule({
  providers: [
    { provide: EnvironmentStoreGateway, useClass: EnvironmentStore },
    { provide: ENVIRONMENT_CONFIG, useValue: {} },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources2, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources3, multi: true },
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
