import { mergeDeep } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { isPath, Path, Properties, PropertiesSource, PropertyStore } from '../types';

/**
 * Sets properties in the environment store.
 */
export abstract class EnvironmentService {
  constructor(protected readonly store: PropertyStore, protected readonly sources?: PropertiesSource[]) {}

  /**
   * Loads the environment properties from sources.
   * @returns A promise to report the loading of properties.
   */
  async load(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Loads the environment properties for lazy loaded modules.
   * @returns A promise to report the loading of properties.
   */
  async loadChild(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Creates a new property and sets the value. If the property exists, it's ignored.
   * @param path The path where the property will be created.
   * @param value The value of the property.
   */
  create<V>(path: Path, value: V): void {
    if (isPath(path)) {
      const state: Properties = this.store.getProperties();

      if (get(state, path) === undefined) {
        const newState: Properties = set(state, path, value);

        this.store.updateProperties(newState);
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
      const state: Properties = this.store.getProperties();

      if (get(state, path) !== undefined) {
        const newState: Properties = set(state, path, value);

        this.store.updateProperties(newState);
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
      const newState: Properties = set(this.store.getProperties(), path, value);

      this.store.updateProperties(newState);
    }
  }

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  merge(properties: Properties, path?: Path): void {
    const newState: Properties = mergeDeep(
      this.store.getProperties(),
      this.propertiesAtPath(properties, path)
    ) as Properties;

    this.store.updateProperties(newState);
  }

  /**
   * Upserts a set of properties in the environment store using the overwrite strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined, the environment root will be used.
   */
  overwrite(properties: Properties, path?: Path): void {
    const newState: Properties = { ...this.store.getProperties(), ...this.propertiesAtPath(properties, path) };

    this.store.updateProperties(newState);
  }

  protected propertiesAtPath(properties: Properties, path?: Path): Properties {
    return path == null ? properties : this.valueAtPath(path, properties);
  }

  protected valueAtPath<V>(path: Path, value: V): Properties {
    return isPath(path) ? set({}, path, value) : value;
  }
}
