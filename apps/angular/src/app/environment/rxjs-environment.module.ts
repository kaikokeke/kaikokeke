import { HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { EnvironmentStore, Properties } from '@kaikokeke/environment';
import { EnvironmentModule } from '@kaikokeke/environment-angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { PROPERTIES_SOURCE_PROVIDERS } from './properties.sources';

@Injectable()
export class RxjsEnvironmentStore extends EnvironmentStore {
  private readonly _properties: BehaviorSubject<Properties> = new BehaviorSubject({});

  getAll(): Properties {
    return this._properties.getValue();
  }

  getAll$(): Observable<Properties> {
    return this._properties.asObservable();
  }

  update(properties: Properties): void {
    this._properties.next(properties);
  }

  reset(): void {
    this._properties.next({});
  }
}

@NgModule({
  imports: [HttpClientModule, EnvironmentModule.forRoot()],
  providers: [{ provide: EnvironmentStore, useClass: RxjsEnvironmentStore }, ...PROPERTIES_SOURCE_PROVIDERS],
})
export class RxjsEnvironmentModule {}
