import {
  APP_INITIALIZER,
  Inject,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Optional,
} from '@angular/core';
import { Query, Store, StoreConfig } from '@datorama/akita';
import {
  EnvironmentConfig,
  EnvironmentLoader,
  EnvironmentQuery,
  EnvironmentService,
  EnvironmentStore,
  Properties,
  PropertiesSource,
} from '@kaikokeke/environment';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestSources extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;
  readonly loadImmediately = true;

  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources2 extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources3 extends PropertiesSource {
  readonly loadInOrder = true;
  readonly requiredToLoad = true;

  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(3000));
  }
}

@Injectable({ providedIn: 'root' })
export class TestSources4 extends PropertiesSource {
  readonly loadInOrder = false;
  readonly requiredToLoad = false;

  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(5000));
  }
}

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
export class AngularAkitaEnvironmentStore extends EnvironmentStore {
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

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSource[]> = new InjectionToken<PropertiesSource[]>(
  'ENVIRONMENT_SOURCES',
);

export const ENVIRONMENT_CONFIG: InjectionToken<Partial<EnvironmentConfig>> = new InjectionToken<
  Partial<EnvironmentConfig>
>('ENVIRONMENT_CONFIG');

@Injectable()
export class AngularAkitaEnvironmentService extends EnvironmentService {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

@Injectable()
export class AngularAkitaEnvironmentQuery extends EnvironmentQuery {
  constructor(
    protected readonly store: EnvironmentStore,
    @Optional() @Inject(ENVIRONMENT_CONFIG) protected readonly partialConfig: Partial<EnvironmentConfig>,
  ) {
    super(store, partialConfig);
  }
}

@Injectable()
export class AngularAkitaEnvironmentLoader extends EnvironmentLoader {
  constructor(
    protected readonly service: EnvironmentService,
    @Inject(ENVIRONMENT_SOURCES) protected readonly sources: PropertiesSource[],
  ) {
    super(service, sources);
  }
}

export function environmentForRoot(loader: EnvironmentLoader): () => Promise<void> {
  return () => loader.load();
}

@NgModule({
  providers: [
    { provide: EnvironmentStore, useClass: AngularAkitaEnvironmentStore },
    { provide: EnvironmentService, useClass: AngularAkitaEnvironmentService },
    { provide: EnvironmentLoader, useClass: AngularAkitaEnvironmentLoader },
    { provide: EnvironmentQuery, useClass: AngularAkitaEnvironmentQuery },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources2, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources3, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources4, multi: true },
  ],
})
export class AkitaEnvironmentModule {
  static forRoot(config?: Partial<EnvironmentConfig>): ModuleWithProviders<AkitaEnvironmentModule> {
    return {
      ngModule: AkitaEnvironmentModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: environmentForRoot,
          deps: [EnvironmentLoader],
          multi: true,
        },
        config ? { provide: ENVIRONMENT_CONFIG, useValue: config } : [],
      ],
    };
  }
}
