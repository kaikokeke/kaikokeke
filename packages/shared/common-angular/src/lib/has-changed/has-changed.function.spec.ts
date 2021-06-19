import { SimpleChange } from '@angular/core';

import { hasChanged } from './has-changed.function';

describe('hasChanged(simpleChange)', () => {
  it(`returns true if previousValue != currentValue`, () => {
    expect(hasChanged(new SimpleChange(0, 1, true))).toEqual(true);
    expect(hasChanged(new SimpleChange(0, 1, false))).toEqual(true);
  });

  it(`returns false if previousValue = currentValue`, () => {
    expect(hasChanged(new SimpleChange(0, 0, true))).toEqual(false);
    expect(hasChanged(new SimpleChange(0, 0, false))).toEqual(false);
  });

  it(`uses deep equality`, () => {
    const a1 = [{ a: 0 }, { a: 1 }];
    const a2 = [{ a: 0 }, { a: 1 }];
    const b = [{ a: 0 }, { b: 1 }];
    expect(hasChanged(new SimpleChange(a1, b, false))).toEqual(true);
    expect(hasChanged(new SimpleChange(a1, a2, false))).toEqual(false);
  });

  it(`fake test`, () => {
    expect(true).toEqual(true);
  });
});
