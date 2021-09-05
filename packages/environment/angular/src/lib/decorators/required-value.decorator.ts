import { serviceInjector } from '@kaikokeke/angular';
import { EnvironmentQuery, Path, Property } from '@kaikokeke/environment';

/**
 * Gets the distinct required environment property at path as mutable and sets it in the property.
 * @param key The property path to set.
 * @param defaultValue The value to return if the path cannot be resolved.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function RequiredValue$<D extends Property>(
  key: Path,
  defaultValue: D,
): (target: unknown, propertyKey: string) => void {
  return (target: unknown, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getRequiredProperty$(key, defaultValue),
    });
  };
}

/**
 * Gets the distinct required environment property at path as mutable and sets it in the property.
 * @param key The property path to set.
 * @param defaultValue The value to return if the path cannot be resolved.
 * @throws If no `ServiceInjectorModule` imported.
 */
export function RequiredValue<D extends Property>(
  key: Path,
  defaultValue: D,
): (target: unknown, propertyKey: string) => void {
  return (target: unknown, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: serviceInjector(EnvironmentQuery).getRequiredProperty(key, defaultValue),
    });
  };
}
