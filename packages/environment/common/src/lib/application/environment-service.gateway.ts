import { mergeDeep } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { isPath, Path, Properties, Property } from '../types';
import { EnvironmentStoreGateway } from './environment-store.gateway';

/**
 * Sets properties in the environment store.
 */
export abstract class EnvironmentServiceGateway {
  /**
   * Sets properties in the environment store.
   * @param store The environment store.
   */
  constructor(protected readonly store: EnvironmentStoreGateway) {}

  /**
   * Resets the environment store to the initial state.
   */
  reset(): void {
    this.store.reset();
  }

  /**
   * Creates a new property and sets the value. If the property exists, it's ignored.
   * @param path The path where the property will be created.
   * @param value The value of the property.
   */
  create(path: Path, value: Property): void {
    const environment: Properties = this.store.getAll();
    const property: Property | undefined = get(environment, path);

    if (property === undefined) {
      this.upsert(path, value);
    }
  }

  /**
   * Updates the value of a property. If the property does not exist it's ignored.
   * @param path The path of the property to update.
   * @param value The value of the property.
   */
  update(path: Path, value: Property): void {
    const environment: Properties = this.store.getAll();
    const property: Property | undefined = get(environment, path);

    if (property !== undefined) {
      this.upsert(path, value);
    }
  }

  /**
   * Upserts a property value.
   * @param path The path where the properties will be set.
   * @param value The value of the property.
   */
  upsert(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();
      const newEnvironment: Properties = set(environment, path, value);

      this.store.update(newEnvironment);
    }
  }

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  merge(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const newProperties: Properties = this.propertiesAtPath(properties, path);
    const newEnvironment: Properties = { ...environment, ...newProperties };

    this.store.update(newEnvironment);
  }

  /**
   * Upserts a set of properties in the environment store using the deep merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  deepMerge(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const newProperties: Properties = this.propertiesAtPath(properties, path);
    const newEnvironment: Properties = mergeDeep(environment, newProperties) as Properties;

    this.store.update(newEnvironment);
  }

  protected propertiesAtPath(properties: Properties, path?: Path): Properties {
    return isPath(path) ? set({}, path, properties) : properties;
  }
}
