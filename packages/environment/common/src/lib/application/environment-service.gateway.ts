import { deepMerge, InvalidPathError, isValidPath, Path } from '@kaikokeke/common';
import { get, set } from 'lodash-es';

import { asMutable } from '../helpers';
import { Properties, Property } from '../types';
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
   * @returns `true` if the property is created, otherwise `false`.
   * @throws If the path is invalid.
   */
  create(path: Path, value: Property): boolean {
    if (isValidPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property === undefined) {
        this._upsertStore(environment, path, value);
        return true;
      }

      return false;
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Updates the value of a property in the environment.
   * Ignores the action if the property doesn't exist.
   * @param path The path of the property to update.
   * @param value The value of the property.
   * @returns `true` if tthe property is updated, otherwise `false`.
   * @throws If the path is invalid.
   */
  update(path: Path, value: Property): boolean {
    if (isValidPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property !== undefined) {
        this._upsertStore(environment, path, value);
        return true;
      }

      return false;
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
    if (isValidPath(path)) {
      const environment: Properties = this.store.getAll();

      return this._upsertStore(environment, path, value);
    } else {
      throw new InvalidPathError(path);
    }
  }

  /**
   * Deletes a property from the environment.
   * @param path The path of the property to delete.
   * @returns `true` if the property is deleted, otherwise `false`.
   * @throws If the path is invalid.
   */
  delete(path: Path): boolean {
    if (isValidPath(path)) {
      const environment: Properties = this.store.getAll();
      const property: Property | undefined = get(environment, path);

      if (property !== undefined) {
        this._upsertStore(environment, path);
        return true;
      }

      return false;
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
   * @throws If the path is invalid.
   */
  add(properties: Properties, path?: Path): void {
    if (path != null && !isValidPath(path)) {
      throw new InvalidPathError(path);
    }

    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const newEnvironment: Properties = isValidPath(path)
      ? set(mutableEnvionment, path, properties)
      : { ...mutableEnvionment, ...properties };

    this.store.update(newEnvironment);
  }

  /**
   * Adds properties to the environment using the deep merge strategy.
   * @param properties The properties to merge.
   * @param path The path of the properties to merge.
   * @throws If the path is invalid.
   */
  merge(properties: Properties, path?: Path): void {
    if (path != null && !isValidPath(path)) {
      throw new InvalidPathError(path);
    }

    const environment: Properties = this.store.getAll();
    const mutableEnvionment: Properties = asMutable(environment);
    const propertiesAtPath: Properties = isValidPath(path) ? set({}, path, properties) : properties;
    const newEnvironment: Properties = deepMerge(mutableEnvionment, propertiesAtPath);

    this.store.update(newEnvironment);
  }
}

class EnvironmentServiceImpl extends EnvironmentService {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

/**
 * Creates an environment service.
 * @param store Manages the environment store.
 * @returns A basic EnvironmentService instance.
 */
export function createEnvironmentService(store: EnvironmentStore): EnvironmentService {
  return new EnvironmentServiceImpl(store);
}
