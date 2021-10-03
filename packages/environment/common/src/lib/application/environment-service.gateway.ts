import { deepMerge } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { asMutable } from '../helpers';
import { InvalidPathError, isPath, Path, Properties, Property } from '../types';
import { EnvironmentStore } from './environment-store.gateway';

/**
 * Sets properties in the environment.
 */
export abstract class EnvironmentService {
  /**
   * Sets properties in the environment.
   * @param store The environment store.
   */
  constructor(protected readonly store: EnvironmentStore) {}

  /**
   * Resets the environment to the initial state.
   */
  reset(): void {
    this.store.reset();
  }

  /**
   * Creates a new property in the environment and sets the value.
   * Ignores the action if the property exists.
   * @param path The path of the property to create.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  create(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property === undefined) {
        this._upsertStore(environment, path, value);
      }
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Updates the value of a property in the environment.
   * Ignores the action if the property doesn't exist.
   * @param path The path of the property to update.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  update(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property !== undefined) {
        this._upsertStore(environment, path, value);
      }
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Updates or creates the value of a property in the environment.
   * @param path The path of the property to upsert.
   * @param value The value of the property.
   * @throws If the path is invalid.
   */
  upsert(path: Path, value: Property): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();

      return this._upsertStore(environment, path, value);
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Deletes a property from the environment.
   * @param path The path of the property to delete.
   * @throws If the path is invalid.
   */
  delete(path: Path): void {
    if (isPath(path)) {
      const environment: Properties = this.store.getAll();

      return this._upsertStore(environment, path);
    } else {
      throw new InvalidPathError(path);
    }
  }

  protected _upsertStore(environment: Properties, path: Path, value?: Property): void {
    const mutableEnvironment: Properties = asMutable(environment);
    const newEnvironment: Properties = set(mutableEnvironment, path, value);

    this.store.update(newEnvironment);
  }

  /**
   * Adds properties to the environment.
   * @param properties The properties to add.
   * @param path The path of the properties to add.
   */
  add(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const newEnvironment: Properties = isPath(path)
      ? set(mutableEnvionment, path, properties)
      : { ...mutableEnvionment, ...properties };

    this.store.update(newEnvironment);
  }

  /**
   * Adds properties to the environment using the deep merge strategy.
   * @param properties The properties to merge.
   * @param path The path of the properties to merge.
   */
  merge(properties: Properties, path?: Path): void {
    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const propertiesAtPath: Properties = isPath(path) ? set({}, path, properties) : properties;
    const newEnvironment: Properties = deepMerge(mutableEnvionment, propertiesAtPath);

    this.store.update(newEnvironment);
  }
}
