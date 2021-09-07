import { AbstractType, InjectFlags, InjectionToken, Type } from '@angular/core';

import { InjectorModule } from './injector.module';

/**
 * Retrieves an instance from the Injector based on the provided token.
 * @param token The injection token.
 * @param notFoundValue Default value if not found.
 * @param flags Injection flags for DI.
 * @returns The injected instance if defined, otherwise the `notFoundValue`.
 * @throws When InjectorModule is not imported.
 * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
 */
export function inject<T>(
  token: Type<T> | InjectionToken<T> | AbstractType<T>,
  notFoundValue?: T,
  flags?: InjectFlags,
): T {
  if (InjectorModule.injector == null) {
    throw new Error(`Import the 'InjectorModule' module to use inject()`);
  }

  return InjectorModule.injector.get(token, notFoundValue, flags);
}
