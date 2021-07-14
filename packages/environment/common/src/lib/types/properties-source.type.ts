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
   * The path where the properties are set.
   */
  path?: Path;

  /**
   * Set it to false to ignore errors in the load. Defaults to `true`.
   */
  required = true;

  /**
   * The load type used by this source. Defaults to `INITIALIZATION`.
   */
  loadType: LoadType = LoadType.INITIALIZATION;

  /**
   * The strategy to use to merge the values returned by the source. Defaults to `MERGE`.
   */
  mergeStrategy: MergeStrategy = MergeStrategy.MERGE;

  /**
   * Loads environment properties from source asynchronously.
   */
  abstract load(): Observable<Properties> | Promise<Properties>;
}
