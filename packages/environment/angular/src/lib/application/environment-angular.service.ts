import { Inject, Injectable } from '@angular/core';
import { EnvironmentService, EnvironmentStore } from '@kaikokeke/environment';

@Injectable()
export class EnvironmentAngularService extends EnvironmentService {
  constructor(@Inject(EnvironmentStore) protected readonly store: EnvironmentStore) {
    super(store);
  }
}
