import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { EnvironmentConfig, EnvironmentLoader, EnvironmentQuery, EnvironmentService } from '@kaikokeke/environment';

import { AngularEnvironmentLoader, AngularEnvironmentQuery, AngularEnvironmentService } from './application';
import { ENVIRONMENT_CONFIG } from './tokens';

export function environmentModuleForRoot(loader: EnvironmentLoader): () => Promise<void> {
  return () => loader.load();
}

@NgModule()
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
        { provide: EnvironmentService, useClass: AngularEnvironmentService },
        { provide: EnvironmentLoader, useClass: AngularEnvironmentLoader },
        { provide: EnvironmentQuery, useClass: AngularEnvironmentQuery },
        config ? { provide: ENVIRONMENT_CONFIG, useValue: config } : [],
      ],
    };
  }
}
