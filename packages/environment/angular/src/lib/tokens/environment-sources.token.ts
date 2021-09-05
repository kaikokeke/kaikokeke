import { InjectionToken } from '@angular/core';
import { PropertiesSource } from '@kaikokeke/environment';

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSource | PropertiesSource[]> = new InjectionToken<
  PropertiesSource | PropertiesSource[]
>('ENVIRONMENT_SOURCES');
