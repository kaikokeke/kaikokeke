import { Inject, Injectable } from '@angular/core';
import { EnvironmentService, EnvironmentStore } from '@kaikokeke/environment';

@Injectable()
export class AngularEnvironmentService extends EnvironmentService {
  constructor(@Inject(EnvironmentStore) protected readonly store: EnvironmentStore) {
    super(store);
  }
}
