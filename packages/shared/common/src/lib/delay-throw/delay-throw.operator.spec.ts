import { marbles } from 'rxjs-marbles/jest';

import { delayThrow } from './delay-throw.operator';

describe('delayThrow(dueTime)', () => {
  it(
    `delays the emission of errors from the source Observable by a given timeout or until a given Date`,
    marbles((m) => {
      const source = m.cold('-a-#', { a: 0 }, new Error());
      const expected = m.cold('-a------#', { a: 0 }, new Error());
      m.expect(source.pipe(delayThrow(5))).toBeObservable(expected);
    }),
  );
});
