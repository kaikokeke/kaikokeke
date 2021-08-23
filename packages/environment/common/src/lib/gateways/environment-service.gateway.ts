import { mergeDeep } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { EnvironmentStoreGateway } from '../gateways';
import { isPath, Path, Properties } from '../types';

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
  create<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const state: Properties = this.store.getAll();

      if (get(state, path) === undefined) {
        const newState: Properties = set(state, path, value);

        this.store.update(newState);
      }
    }
  }

  /**
   * Updates the value of a property. If the property does not exist it's ignored.
   * @param path The path of the property to update.
   * @param value The value of the property.
   */
  update<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const state: Properties = this.store.getAll();

      if (get(state, path) !== undefined) {
        const newState: Properties = set(state, path, value);

        this.store.update(newState);
      }
    }
  }

  /**
   * Upserts a property value.
   * @param path The path where the properties will be set.
   * @param value The value of the property.
   */
  upsert<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const newState: Properties = set(this.store.getAll(), path, value);

      this.store.update(newState);
    }
  }

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  merge(properties: Properties, path?: Path): void {
    const newState: Properties = { ...this.store.getAll(), ...this.propertiesAtPath(properties, path) };

    this.store.update(newState);
  }

  /**
   * Upserts a set of properties in the environment store using the deep merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  deepMerge(properties: Properties, path?: Path): void {
    const newState: Properties = mergeDeep(this.store.getAll(), this.propertiesAtPath(properties, path)) as Properties;

    this.store.update(newState);
  }

  protected propertiesAtPath(properties: Properties, path?: Path): Properties {
    return path == null ? properties : this.valueAtPath(path, properties);
  }

  protected valueAtPath<V>(path: Path, value: V): Properties {
    return isPath(path) ? set({}, path, value) : value;
  }
}
