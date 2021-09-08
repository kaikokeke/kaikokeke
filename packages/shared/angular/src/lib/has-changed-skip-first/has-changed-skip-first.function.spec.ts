import { SimpleChange } from '@angular/core';

import { hasChangedSkipFirst } from './has-changed-skip-first.function';

describe('hasChangedSkipFirst(simpleChange)', () => {
  it(`returns true if previousValue != currentValue && !firstChange`, () => {
    expect(hasChangedSkipFirst(new SimpleChange(0, 1, false))).toBeTrue();
  });

  it(`returns false if previousValue != currentValue && firstChange`, () => {
    expect(hasChangedSkipFirst(new SimpleChange(0, 1, true))).toBeFalse();
  });

  it(`returns false if previousValue = currentValue`, () => {
    expect(hasChangedSkipFirst(new SimpleChange(0, 0, true))).toBeFalse();
    expect(hasChangedSkipFirst(new SimpleChange(0, 0, false))).toBeFalse();
  });

  it(`uses deep equality`, () => {
    const a1 = [{ a: 0 }, { a: 1 }];
    const a2 = [{ a: 0 }, { a: 1 }];
    const b = [{ a: 0 }, { b: 1 }];
    expect(hasChangedSkipFirst(new SimpleChange(a1, b, false))).toBeTrue();
    expect(hasChangedSkipFirst(new SimpleChange(a1, a2, false))).toBeFalse();
  });
});
