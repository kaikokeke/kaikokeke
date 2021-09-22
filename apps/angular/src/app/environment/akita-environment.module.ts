import { HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { EnvironmentModule } from '@kaikokeke/environment-angular';
import { Observable } from 'rxjs';

import { PROPERTIES_SOURCE_PROVIDERS } from './properties.sources';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'environment', resettable: true })
export class AkitaEnvironmentStore extends Store<Properties> {
  constructor() {
    super({});
  }
}

@Injectable()
export class AngularAkitaEnvironmentStore extends EnvironmentStore {
  constructor(protected readonly store: AkitaEnvironmentStore) {
    super();
  }

  getAll(): Properties {
    return this.store.getValue();
  }

  getAll$(): Observable<Properties> {
    return this.store._select((state: Properties) => state);
  }

  update(properties: Properties): void {
    this.store.update(properties);
  }

  reset(): void {
    this.store.reset();
  }
}

@NgModule({
  imports: [HttpClientModule, EnvironmentModule.forRoot()],
  providers: [{ provide: EnvironmentStore, useClass: AngularAkitaEnvironmentStore }, ...PROPERTIES_SOURCE_PROVIDERS],
})
export class AkitaEnvironmentModule {}
