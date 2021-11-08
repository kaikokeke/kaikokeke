import { Properties } from './properties.type';
import { Property } from './property.type';

/**
 * The options to get a property.
 */
export interface EnvironmentQueryOptions<T> {
  /**
   * The default value to resolve if no value is found.
   */
  defaultValue?: Property;
  /**
   * The expected type converter function.
   */
  targetType?: (property: Property) => T;
  /**
   * The properties to resolve the interpolation.
   */
  transpile?: Properties;
  /**
   * The start and end markings for interpolation parameters.
   */
  interpolation?: [string, string];
  /**
   * Use the environment properties to transpile the interpolation.
   */
  useEnvironmentToTranspile?: boolean;
}
