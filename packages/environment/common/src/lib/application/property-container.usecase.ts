import { Observable } from 'rxjs';

import { Path } from '../types';

/**
 * Checks in the environment store contains a property.
 */
export interface PropertyContainer {
  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` as Observable if the value for the given path exists, otherwise `false`.
   */
  containsProperty$(path: Path): Observable<boolean>;

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` if the value for the given path exists, otherwise `false`.
   */
  containsProperty(path: Path): boolean;
}
