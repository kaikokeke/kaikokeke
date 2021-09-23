import { TimeoutError } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { firstNonNil } from './first-non-nil.operator';

describe('firstNonNil', () => {
  it(
    `emits and completes the first not null or undefined value emitted by the source Observable`,
    marbles((m) => {
      const values = { a: null, b: undefined, c: 0 };
      const source = m.cold('-a-b-c-', values);
      const expected = m.cold('-----(c|)', values);
      m.expect(source.pipe(firstNonNil())).toBeObservable(expected);
    }),
  );

  it(
    `emits and completes if due is setted and the Observable emits a value before the given time span`,
    marbles((m) => {
      const values = { a: null, b: undefined, c: 0 };
      const source = m.cold('-a-b-c-', values);
      const expected = m.cold('-----(c|)', values, new TimeoutError());
      m.expect(source.pipe(firstNonNil(10))).toBeObservable(expected);
    }),
  );

  it(
    `throws if due is setted and the Observable does not emit a value in given time span`,
    marbles((m) => {
      const values = { a: null, b: undefined, c: 0 };
      const source = m.cold('-a-b-c-', values);
      const expected = m.cold('---#', values, new TimeoutError());
      m.expect(source.pipe(firstNonNil(3))).toBeObservable(expected);
    }),
  );
});
