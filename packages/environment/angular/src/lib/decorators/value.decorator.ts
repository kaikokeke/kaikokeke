/* eslint-disable @typescript-eslint/no-explicit-any */
import { serviceInjector } from '@kaikokeke/angular';
import { EnvironmentQuery, Path } from '@kaikokeke/environment';

/**
 * Sets the distinct environment property at path as mutable.
 * @param key The property path to set.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function Value$(key: Path): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getProperty$(key),
    });
  };
}

/**
 * Sets the environment property at path as mutable.
 * @param key The property path to set.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function Value(key: Path): (target: any, propertyKey: string) => void {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getProperty(key),
    });
  };
}
