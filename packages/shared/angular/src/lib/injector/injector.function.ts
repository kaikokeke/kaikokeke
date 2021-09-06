import { AbstractType, InjectFlags, InjectionToken, Type } from '@angular/core';

import { InjectorModule } from './injector.module';

/**
 * Retrieves an instance from the injector based on the provided token.
 * @param token The injection token.
 * @param notFoundValue Default value if not found.
 * @param flags Injection flags for DI.
 * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
 * @throws When InjectorModule is not imported.
 * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
 */
export function injector<T>(
  token: Type<T> | InjectionToken<T> | AbstractType<T>,
  notFoundValue?: T,
  flags?: InjectFlags,
): T {
  if (InjectorModule.injector == null) {
    throw new Error(`Import the 'InjectorModule' module to use injector()`);
  }

  return InjectorModule.injector.get(token, notFoundValue, flags);
}
