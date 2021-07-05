import { Property } from './property.type';

/**
 * A set of environment properties required to run the application.
 */
export interface Properties {
  [key: string]: Property;
}
