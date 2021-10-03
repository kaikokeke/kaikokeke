import { ObservableInput } from 'rxjs';

import { Path, Properties } from '../types';

/**
 * Definition of the source from which to get environment properties asynchronously.
 */
export abstract class PropertiesSource {
  /**
   * The source name.
   */
  name?: string;

  /**
   * Loads the required to load sources properties before the app load.
   */
  requiredToLoad?: boolean;

  /**
   * Loads the source in the declaration order.
   * The ordered sources will wait until the previous ordered source completes to start.
   */
  loadInOrder?: boolean;

  /**
   * Adds properties to the environment using the deep merge strategy.
   */
  mergeProperties?: boolean;

  /**
   * Ignores the errors thrown by the source.
   */
  ignoreError?: boolean;

  /**
   * The path to set the properties in the environment.
   * @see Path
   */
  path?: Path;

  /**
   * Asynchronously loads the environment properties from the source.
   */
  abstract load(): ObservableInput<Properties>;
}
