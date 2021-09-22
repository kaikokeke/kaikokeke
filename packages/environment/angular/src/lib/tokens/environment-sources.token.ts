import { InjectionToken } from '@angular/core';
import { PropertiesSource } from '@kaikokeke/environment';

export const ENVIRONMENT_SOURCES: InjectionToken<PropertiesSource | PropertiesSource[]> = new InjectionToken<
  PropertiesSource | PropertiesSource[]
>('An environment properties source definition or list or sources to get the application properties asynchronously');
