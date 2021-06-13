/* eslint-disable @typescript-eslint/ban-types */
import { AbstractType, InjectFlags, InjectionToken, Type } from '@angular/core';

import { serviceInjector } from './service-injector.module';

/**
 * Sets an instance from the injector based on the provided token.
 * @param token The injector token.
 * @param notFoundValue Default value if not found.
 * @param flags Injection flags for DI.
 * @throws If no ServiceInjectorModule imported, the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
 */
export function Autowired<T>(
  token: Type<T> | InjectionToken<T> | AbstractType<T>,
  notFoundValue?: T,
  flags?: InjectFlags
): (target: object, propertyKey: string) => void {
  return (target: object, propertyKey: PropertyKey) => {
    Object.defineProperty(target, propertyKey, {
      writable: false,
      value: serviceInjector(token, notFoundValue, flags),
    });
  };
}
