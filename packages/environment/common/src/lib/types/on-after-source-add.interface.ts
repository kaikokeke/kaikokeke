import { LoaderPropertiesSource } from './loader-properties-source.type';
import { Properties } from './properties.type';

/**
 * A lifecycle hook that is called after a source properties are added to the environment.
 */
export interface OnAfterSourceAdd {
  /**
   * Handles any additional tasks after a source properties are added to the environment.
   * @param properties The properties added to the environment.
   * @param source The loaded source.
   */
  onAfterSourceAdd(properties: Properties, source: LoaderPropertiesSource): void;
}
