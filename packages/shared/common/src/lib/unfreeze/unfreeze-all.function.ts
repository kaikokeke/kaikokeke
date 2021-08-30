import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { unfreeze } from './unfreeze.function';

/**
 * Unfreezes the frozen values creating a recursive shallow clone of each value emitted by the source Observable,
 * and emitting the resulting deep cloned values as an Observable. Non-frozen objects are emited as is.
 *
 * This method is loosely based on the structured clone algorithm and supports cloning arrays, array buffers, booleans,
 * date objects, maps, numbers, Object objects, regexes, sets, strings, symbols, and typed arrays.
 * The own enumerable properties of arguments objects are cloned as plain objects.
 * An empty object is returned for uncloneable values such as error objects, functions, DOM nodes, JSON object,
 * Atomics object, Math object, WeakSets, WeakMaps and SharedArrayBuffers.
 * BigInt64Array and BigUint64Array are cloned as plain objects due to limitations of Lodash.
 * @returns An Observable that emits the unfreezed values from the source Observable.
 * @see Observable
 */
export function unfreezeAll<T>(): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> =>
    source.pipe<T>(
      map<T, T>((value: T): T => {
        return unfreeze(value);
      }),
    );
}
