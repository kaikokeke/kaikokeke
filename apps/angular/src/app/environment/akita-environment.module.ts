import { Injectable, NgModule } from '@angular/core';
import { Query, Store, StoreConfig } from '@datorama/akita';
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { ENVIRONMENT_SOURCES, EnvironmentModule } from '@kaikokeke/environment-angular';
import { Observable } from 'rxjs';

import { TestSources, TestSources2, TestSources3, TestSources4 } from './properties.sources';

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

@NgModule({
  imports: [EnvironmentModule.forRoot()],
  providers: [
    { provide: EnvironmentStore, useClass: AngularAkitaEnvironmentStore },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources2, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources3, multi: true },
    { provide: ENVIRONMENT_SOURCES, useClass: TestSources4, multi: true },
  ],
})
export class AkitaEnvironmentModule {}
