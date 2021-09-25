import { deepMerge } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { asMutable } from '../helpers';
import { InvalidPathError, isPath, Path, Properties, Property } from '../types';
import { EnvironmentStore } from './environment-store.gateway';

/**
 * Sets properties in the environment store.
 */
export abstract class EnvironmentService {
  /**
   * Sets properties in the environment store.
   * @param store The environment store.
   */
  constructor(protected readonly store: EnvironmentStore) {}

  /**
   * Resets the environment store to the initial state.
   */
  reset(): void {
    this.store.reset();
  }

  /**
   * Creates a new property in the environment and sets the value.
   * If the property exists, it's ignored.
   * @param path The path where the property will be created.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  create(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property === undefined) {
        this.upsertStoreValue(environment, path, value);
      }
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Updates the value of a property in the environment.
   * If the property does not exist it's ignored.
   * @param path The path of the property to update.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  update(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property !== undefined) {
        this.upsertStoreValue(environment, path, value);
      }
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Upserts the value of a property in the environment.
   * @param path The path where the properties will be set.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  upsert(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();

      return this.upsertStoreValue(environment, path, value);
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Deletes a property from the environment.
   * @param path The path of the properties to delete.
   * @throws If the path is invalid.
   */
  delete(path: Path): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();

      return this.upsertStoreValue(environment, path);
    } else {
      throw new InvalidPathError(path);
    }
  }

  protected upsertStoreValue(environment: Properties, path: Path, value?: Property): void {
    const mutableEnvironment: Properties = asMutable(environment);
    const newEnvironment: Properties = set(mutableEnvironment, path, value);

    this.store.update(newEnvironment);
  }

  /**
   * Upserts a set of properties in the environment store using the merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined will use the environment root.
   */
  merge(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const newEnvironment: Properties = isPath(path)
      ? set(mutableEnvionment, path, properties)
      : { ...mutableEnvionment, ...properties };

    this.store.update(newEnvironment);
  }

  /**
   * Upserts a set of properties in the environment store using the deep merge strategy.
   * @param properties The set of properties to upsert.
   * @param path The path where the properties will be set. If it is undefined will use the environment root.
   */
  deepMerge(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const newProperties: Properties = isPath(path) ? set({}, path, properties) : properties;
    const newEnvironment: Properties = deepMerge(mutableEnvionment, newProperties);

    this.store.update(newEnvironment);
  }
}
