import { Observable } from 'rxjs';

import { LoadType, MergeStrategy, Path, Properties } from '../types';

/**
 * An environment properties source definition to get the application properties asynchronously.
 */
export abstract class PropertiesSourceGateway {
  /**
   * The properties source name.
   */
  abstract readonly name: string;

  /**
   * Sets the load type used by the source.
   *
   * Determines if the properties from the source must be loaded before the application load.
   * Defaults to `INITIALIZATION`.
   * @see LoadType
   */
  loadType: LoadType = LoadType.INITIALIZATION;

  /**
   * Sets if the source is required.
   *
   * If the source is required, the load type is `INITIALIZATION` and the application has not loaded yet the
   * application will not load if the source load fails. Set it to `false` to ignore the errors.
   * Defaults to `true`.
   */
  isRequired = true;

  /**
   * The optional path where the loaded properties are going to be setted in the environment.
   *
   * If a path is not specified, the loaded properties will be set to the root of the environment properties.
   * @see Path
   */
  path?: Path;

  /**
   * Sets the merge strategy used by the source.
   *
   * Determines the strategy to use to merge the properties returned by the source with the existing in the environment.
   * Defaults to `MERGE`.
   * @see MergeStrategy
   */
  mergeStrategy: MergeStrategy = MergeStrategy.MERGE;

  /**
   * Dismiss the loading of all other sources afert this source load.
   * Defaults to `false`.
   */
  dismissOtherSources = false;

  /**
   * Sets whether the environment should be reset before inserting the properties for this source.
   * Defaults to `false`.
   */
  resetEnvironment = false;

  /**
   * The application will load immediately after loading the source.
   * Defaults to `false`.
   */
  immediate = false;

  /**
   * Asynchronously loads environment properties from source.
   */
  abstract load(): Observable<Properties> | Promise<Properties>;
}
