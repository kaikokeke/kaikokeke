import { InjectionToken } from '@angular/core';
import { EnvironmentConfig } from '@kaikokeke/environment';

export const ENVIRONMENT_CONFIG: InjectionToken<Partial<EnvironmentConfig>> = new InjectionToken<
  Partial<EnvironmentConfig>
>('Partial configuration parameters for the Environment module');
