import { APP_INITIALIZER, Inject, Injectable, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Query, Store, StoreConfig } from '@datorama/akita';
import {
  EnvironmentConfig,
  EnvironmentServiceGateway,
  EnvironmentStoreGateway,
  LoadType,
  Properties,
  PropertiesSource,
} from '@kaikokeke/environment';
import { Observable, of, throwError } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class EnvironmentStore implements EnvironmentStoreGateway {
  constructor(protected readonly store: AkitaEnvironmentStore) {}

  getProperties(): Properties {
    return this.store.getValue();
  }

  updateProperties(newProperties: Properties): void {
    this.store.reset();
    this.store.update(newProperties);
  }

  resetProperties(): void {
    this.store.reset();
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources extends PropertiesSource {
  readonly name = 'TestSources';
  readonly loadType: LoadType = LoadType.INITIALIZATION;

  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources2 extends PropertiesSource {
  readonly name = 'TestSources2';
  readonly loadType: LoadType = LoadType.INITIALIZATION;

  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(5000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources3 extends PropertiesSource {
  readonly name = 'TestSources3';
  readonly loadType: LoadType = LoadType.INITIALIZATION;
  isRequired = false;

  load(): Observable<Properties> {
    // return of({ c: 0 }).pipe(delay(5000));
    throw throwError(new Error('A custom error'));
  }
}

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSource[]> = new InjectionToken<PropertiesSource[]>(
  'ENVIRONMENT_SOURCES'
);

export const ENVIRONMENT_CONFIG: InjectionToken<PropertiesSource[]> = new InjectionToken<Partial<EnvironmentConfig>>(
  'ENVIRONMENT_CONFIG'
);

@Injectable({ providedIn: 'root' })
export class EnvironmentService extends EnvironmentServiceGateway {
  constructor(
    protected readonly store: EnvironmentStore,
    @Inject(ENVIRONMENT_CONFIG) protected readonly partialConfig: Partial<EnvironmentConfig>,
    @Inject(ENVIRONMENT_SOURCES) protected readonly sources: PropertiesSource[]
  ) {
    super(store, partialConfig, sources);
  }
}

export function environmentForRoot(service: EnvironmentService) {
  return () => service.load();
}

@NgModule({
  providers: [
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
          deps: [EnvironmentService],
          multi: true,
        },
      ],
    };
  }
}
