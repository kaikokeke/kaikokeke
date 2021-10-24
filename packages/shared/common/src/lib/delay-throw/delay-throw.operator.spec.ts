import { marbles } from 'rxjs-marbles/jest';
import { delay } from 'rxjs/operators';

import { delayThrow } from './delay-throw.operator';

describe('delayThrow(dueTime)', () => {
  it(
    `delays the emission of errors from the source Observable`,
    marbles((m) => {
      const source = m.cold('-#', { a: 0 }, new Error());
      const expected = m.cold('------#', { a: 0 }, new Error());
      m.expect(source.pipe(delayThrow(5))).toBeObservable(expected);
    }),
  );

  describe('examples of use', () => {
    it(
      `differences between RxJS delay() and delayThrow()`,
      marbles((m) => {
        const source = m.cold('-a-#', { a: 0 }, new Error());
        const expectedDelay5 = m.cold('---#', { a: 0 }, new Error());
        const expectedDelayThrow5 = m.cold('-a------#', { a: 0 }, new Error());
        const expectedDelay1DelayThrow5 = m.cold('--a-----#', { a: 0 }, new Error());
        const expectedDelay5DelayThrow5 = m.cold('--------#', { a: 0 }, new Error());
        m.expect(source).toBeObservable(source);
        m.expect(source.pipe(delay(5))).toBeObservable(expectedDelay5);
        m.expect(source.pipe(delayThrow(5))).toBeObservable(expectedDelayThrow5);
        m.expect(source.pipe(delay(1), delayThrow(5))).toBeObservable(expectedDelay1DelayThrow5);
        m.expect(source.pipe(delay(5), delayThrow(5))).toBeObservable(expectedDelay5DelayThrow5);
      }),
    );
  });
});
