import { Inject, Injectable, Optional } from '@angular/core';
import { EnvironmentLoader, EnvironmentService, PropertiesSource } from '@kaikokeke/environment';

import { ENVIRONMENT_SOURCES } from '../tokens';

@Injectable()
export class AngularEnvironmentLoader extends EnvironmentLoader {
  constructor(
    @Inject(EnvironmentService) protected readonly service: EnvironmentService,
    @Optional() @Inject(ENVIRONMENT_SOURCES) protected readonly sources?: PropertiesSource | PropertiesSource[],
  ) {
    super(service, sources);
  }
}