import { Observable } from 'rxjs';

import { LoadType } from './load-type.enum';
import { MergeStrategy } from './merge-strategy.enum';
import { Path } from './path.type';
import { Properties } from './properties.type';

/**
 * An environment properties source definition to get the application properties asynchronously.
 */
export abstract class PropertiesSource {
  /**
   * The properties source name.
   */
  abstract readonly name: string;

  /**
   * The optional path where the loaded properties are going to be setted in the environment.
   *
   * If a path is not specified, the loaded properties will be set to the root of the environment properties.
   * @see Path
   */
  path?: Path;

  /**
   * Sets if the source is required.
   *
   * If the source is required and the load type is `IMMEDIATE` or `INITIALIZATION` the application will not load
   * if the load fails. Set it to `false` to ignore the errors and load the application.
   * Defaults to `true`.
   */
  isRequired = true;

  /**
   * Sets the load type used by the source.
   *
   * Determines if the properties from the source must be loaded before the application load.
   * Defaults to `INITIALIZATION`.
   * @see LoadType
   */
  loadType: LoadType = LoadType.INITIALIZATION;

  /**
   * Sets the merge strategy used by the source.
   *
   * Determines the strategy to use to merge the properties returned by the source with the existing in the environment.
   * Defaults to `MERGE`.
   * @see MergeStrategy
   */
  mergeStrategy: MergeStrategy = MergeStrategy.MERGE;

  /**
   * Complete all other sources loading on finish.
   */
  completeLoading = false;

  /**
   * Set to `true` to reset the store before set the values.
   */
  resetEnvironment = false;

  /**
   * Loads environment properties from source asynchronously.
   */
  abstract load(): Observable<Properties> | Promise<Properties>;
}
