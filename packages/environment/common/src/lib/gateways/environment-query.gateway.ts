import { get } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Path, Properties } from '../types';
import { EnvironmentStoreGateway } from './environment-store.gateway';

export abstract class EnvironmentQueryGateway {
  constructor(protected readonly store: EnvironmentStoreGateway) {}

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` as Observable if the value for the given path exists, otherwise `false`.
   */
  containsProperty$(path: Path): Observable<boolean> {
    return this.store.getAll$().pipe(
      map((properties: Properties) => get(properties, path) !== undefined),
      distinctUntilChanged(),
    );
  }

  /**
   * Checks whether the given environment property path is available for resolution.
   * @param path The property path to resolve.
   * @returns `true` if the value for the given path exists, otherwise `false`.
   */
  containsProperty(path: Path): boolean {
    return get(this.store.getAll(), path) !== undefined;
  }
}
