import { of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';
import { map } from 'rxjs/operators';

import { mapAsMutable } from './map-as-mutable.operator';

const obj = Object.freeze({ a: Object.freeze({ b: 0 }), b: '{{ a.b }}' });
const arr: ReadonlyArray<any> = Object.freeze([Object.freeze({ a: 0 }), Object.freeze({ b: 0 })]);

describe('mapAsMutable()', () => {
  it(
    `converts to mutable each object value emitted by the source Observable`,
    marbles((m) => {
      const values = { a: obj, b: arr, c: 'a', d: 0, e: true, f: null };
      const frozen = { a: false, b: false, c: true, d: true, e: true, f: true };
      const source = m.cold('-a-b-c-d-e-', values);
      const expected = m.cold('-a-b-c-d-e-', values);
      const frozenExpected = m.cold('-a-b-c-d-e-', frozen);
      m.expect(source.pipe(mapAsMutable())).toBeObservable(expected);
      m.expect(
        source.pipe(
          mapAsMutable(),
          map((v) => Object.isFrozen(v)),
        ),
      ).toBeObservable(frozenExpected);
    }),
  );

  it(`example of use`, (done) => {
    of(arr)
      .pipe(mapAsMutable())
      .subscribe({
        next: (value) => {
          value[0] = 0;
          value[1].b = 1;
          value.push(1);
          expect(value).toEqual([0, { b: 1 }, 1]);
          done();
        },
      });
  });
});
