import { InjectionToken } from '@angular/core';
import { PropertiesSource } from '@kaikokeke/environment';

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSource[]> = new InjectionToken<PropertiesSource[]>(
  'ENVIRONMENT_SOURCES',
);
