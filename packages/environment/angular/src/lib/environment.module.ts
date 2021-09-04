import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { EnvironmentConfig, EnvironmentLoader, EnvironmentQuery, EnvironmentService } from '@kaikokeke/environment';

import { EnvironmentAngularLoader } from './environment-angular.loader';
import { EnvironmentAngularQuery } from './environment-angular.query';
import { EnvironmentAngularService } from './environment-angular.service';
import { ENVIRONMENT_CONFIG } from './environment-config.token';

export function environmentModuleForRoot(loader: EnvironmentLoader): () => Promise<void> {
  return () => loader.load();
}

@NgModule({
  providers: [
    { provide: EnvironmentService, useClass: EnvironmentAngularService },
    { provide: EnvironmentLoader, useClass: EnvironmentAngularLoader },
    { provide: EnvironmentQuery, useClass: EnvironmentAngularQuery },
  ],
})
export class EnvironmentModule {
  static forRoot(config?: Partial<EnvironmentConfig>): ModuleWithProviders<EnvironmentModule> {
    return {
      ngModule: EnvironmentModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: environmentModuleForRoot,
          deps: [EnvironmentLoader],
          multi: true,
        },
        config ? { provide: ENVIRONMENT_CONFIG, useValue: config } : [],
      ],
    };
  }
}
