import { serviceInjector } from '@kaikokeke/angular';
import { EnvironmentQuery, Path } from '@kaikokeke/environment';

/**
 * Gets the distinct environment property at path as mutable and sets it in the property.
 * @param key The property path to resolve.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function Value$(key: Path): (target: unknown, propertyKey: string) => void {
  return (target: unknown, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getProperty$(key),
    });
  };
}

/**
 * Gets the environment property at path as mutable and sets it in the property.
 * @param key The property path to resolve.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function Value(key: Path): (target: unknown, propertyKey: string) => void {
  return (target: unknown, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getProperty(key),
    });
  };
}
