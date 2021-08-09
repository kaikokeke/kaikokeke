import { AbstractType, InjectFlags, InjectionToken, Injector, NgModule, Type } from '@angular/core';

let InternalServiceInjector: Injector;

/**
 * Retrieves an instance from the injector based on the provided token.
 * @param token The injector token.
 * @param notFoundValue Default value if not found.
 * @param flags Injection flags for DI.
 * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
 * @throws When no ServiceInjectorModule imported.
 * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
 */
export function serviceInjector<T>(
  token: Type<T> | InjectionToken<T> | AbstractType<T>,
  notFoundValue?: T,
  flags?: InjectFlags,
): T {
  if (InternalServiceInjector == null) {
    throw new Error(`Import the 'ServiceInjectorModule' module to use serviceInjector()`);
  }

  return InternalServiceInjector.get(token, notFoundValue, flags);
}

/**
 * Instantiate the static service injector.
 */
@NgModule()
export class ServiceInjectorModule {
  constructor(protected readonly injector: Injector) {
    InternalServiceInjector = this.injector;
  }
}
