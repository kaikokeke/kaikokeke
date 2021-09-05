import { Inject, Injectable, Optional } from '@angular/core';
import { EnvironmentConfig, EnvironmentQuery, EnvironmentStore } from '@kaikokeke/environment';

import { ENVIRONMENT_CONFIG } from '../tokens';

@Injectable()
export class EnvironmentAngularQuery extends EnvironmentQuery {
  constructor(
    @Inject(EnvironmentStore) protected readonly store: EnvironmentStore,
    @Optional() @Inject(ENVIRONMENT_CONFIG) protected readonly partialConfig?: Partial<EnvironmentConfig>,
  ) {
    super(store, partialConfig);
  }
}
