import { ObservableInput } from 'rxjs';
import { v4 } from 'uuid';

import { Path, Properties } from '../types';

/**
 * An environment properties source definition to get the application properties asynchronously.
 */
export abstract class PropertiesSource {
  /**
   * The unique random id for each class instance.
   * @see RFC4122 v4
   */
  readonly _sourceId: string = v4();

  /**
   * The properties source name.
   * Defaults to the class name.
   */
  sourceName: string = this.constructor.name;

  /**
   * Loads the source values before the application or submodule load.
   * Defaults to `false`.
   */
  requiredToLoad = false;

  /**
   * Loads the source in the order defined in the array.
   * The ordered sources will wait until the previous ordered source completes to start.
   * Defaults to `false`.
   */
  loadInOrder = false;

  /**
   * The application or submodule will load immediately after loading the source.
   * Defaults to `false`.
   */
  loadImmediately = false;

  /**
   * Dismiss the loading of all other sources after this source load and loads the application or submodule.
   * Defaults to `false`.
   */
  dismissOtherSources = false;

  /**
   * The source recursively merge own and inherited enumerable values into the properties.
   * Defaults to `false`.
   */
  deepMergeValues = false;

  /**
   * Ignores the errors from the source load.
   * The application or submodule load will not occur if the source load throws an error.
   * Defaults to `false`.
   */
  ignoreError = false;

  /**
   * The optional path where the loaded properties are going to be setted in the environment.
   * If a path is not specified, the loaded properties will be set to the root of the environment properties.
   * @see Path
   */
  path?: Path;

  /**
   * Asynchronously loads environment properties from source.
   */
  abstract load(): ObservableInput<Properties>;

  /**
   * Actions to be executed before load the properties in the environment.
   * @param properties The loaded environment properties from source.
   */
  onBeforeLoad(properties: Properties): void {
    // Override to provide functionality.
  }

  /**
   * Actions to be executed after load the properties in the environment.
   * @param properties The loaded environment properties from source.
   */
  onAfterLoad(properties: Properties): void {
    // Override to provide functionality.
  }

  /**
   * Actions to be executed after a source error before the application load.
   * @param error The returned source error.
   */
  onError(error: Error): void {
    // Override to provide functionality.
  }

  /**
   * Actions to be executed after an ignored source error or any error after the application load.
   * @param error The returned source error.
   */
  onSoftError(error: Error): void {
    // Override to provide functionality.
  }
}
