import { Observable } from 'rxjs';

import { Path, Properties } from '../types';

/**
 * An environment properties source definition to get the application properties asynchronously.
 */
export abstract class PropertiesSourceGateway {
  /**
   * The properties source name.
   * Defaults to the class name.
   */
  readonly name: string = this.constructor.name;

  /**
   * Determines if the source should be loaded before the application initializes.
   * Defaults to `false`.
   */
  readonly loadBeforeApp: boolean = false;

  /**
   * Determines if the source should be loaded in the order defined in the array.
   * The ordered sources will wait until the previous ordered source completes to start.
   * Defaults to `false`.
   */
  readonly loadInOrder: boolean = false;

  /**
   * The application will load immediately after loading the source.
   * Defaults to `false`.
   */
  readonly loadImmediately: boolean = false;

  /**
   * Dismiss the loading of all other sources after this source load and loads the application.
   * Defaults to `false`.
   */
  readonly dismissOtherSources: boolean = false;

  /**
   * Recursively merge own and inherited enumerable values into the properties.
   * Defaults to `false`.
   */
  readonly deepMergeValues: boolean = false;

  /**
   * The optional path where the loaded properties are going to be setted in the environment.
   * If a path is not specified, the loaded properties will be set to the root of the environment properties.
   * @see Path
   */
  readonly path?: Path;

  /**
   * Sets whether the environment should be reset before inserting the properties for this source.
   * Defaults to `false`.
   */
  readonly resetEnvironment: boolean = false;

  /**
   * Sets if the source is required.
   *
   * If the source is required, loads during initialization and the application has not loaded yet the
   * application will not load if the source load fails. Set it to `false` to ignore the errors.
   * Defaults to `true`.
   */
  readonly isRequired: boolean = true;

  /**
   * Asynchronously loads environment properties from source.
   */
  abstract load(): Observable<Properties> | Promise<Properties>;
}
