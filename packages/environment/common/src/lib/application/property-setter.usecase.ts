import { Path, Properties } from '../types';

/**
 * Sets properties in the environment store.
 */
export interface PropertySetter {
  /**
   * Creates a new property and sets the value. If the property exists, it is ignored.
   * @param path The path where the property will be created.
   * @param value The value of the property.
   */
  create<V>(path: Path, value: V): void;

  /**
   * Updates the value of a property. If the property does not exist it is ignored.
   * @param path The path of the property to update.
   * @param value The value of the property.
   */
  update<V>(path: Path, value: V): void;

  /**
   * Upserts a property value.
   * @param path The path where the properties will be set.
   * @param value The value of the property.
   */
  upsert<V>(path: Path, value: V): void;

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  merge(properties: Properties, path?: Path): void;

  /**
   * Upserts a set of properties in the environment store using the overwrite strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  overwrite(properties: Properties, path?: Path): void;
}
