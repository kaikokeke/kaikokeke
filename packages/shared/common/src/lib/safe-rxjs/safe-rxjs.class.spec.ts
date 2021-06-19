import { cases, marbles } from 'rxjs-marbles/jest';

import { SafeSubscription } from '../safe-subscription';
import { SafeRxJS } from './safe-rxjs.class';

describe('SafeRxJS', () => {
  let safeRxJS: SafeRxJS;

  beforeEach(() => {
    safeRxJS = new SafeRxJS();
  });

  it(`safeSubscription is a SafeSubscription`, () => {
    expect(safeRxJS.safeSubscription).toBeInstanceOf(SafeSubscription);
  });

  cases(
    `takeOne()`,
    (m, c) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-----x');
      const source = m.cold(c.source);
      const destination = source.pipe(safeRxJS['takeOne']());
      m.expect(destination).toBeObservable(c.expected);
    },
    {
      'unsubscribes on first emit': {
        source: '---x---x-',
        expected: '---(x|)',
      },
      'unsubscribes on _onDestroy$ emit': {
        source: '-------x-',
        expected: '-----|',
      },
    }
  );

  cases(
    `takeCount(count)`,
    (m, c) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-------x');
      const source = m.cold(c.source);
      const destination = source.pipe(safeRxJS['takeCount'](2));
      m.expect(destination).toBeObservable(c.expected);
    },
    {
      'unsubscribes after count emits': {
        source: '-x-x-x-',
        expected: '-x-(x|)',
      },
      'unsubscribes on _onDestroy$ emit': {
        source: '--x------x-',
        expected: '--x----|',
      },
    }
  );

  it(
    `takeUntilDestroy() unsubscribes on _onDestroy$ emit`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('---------x');
      const source = m.cold('-x-x-x-x-x-');
      const expected = '-x-x-x-x-|';
      const destination = source.pipe(safeRxJS['takeUntilDestroy']());
      m.expect(destination).toBeObservable(expected);
    })
  );

  it(`onDestroy() emits _onDestroy$`, () => {
    jest.spyOn(safeRxJS['_onDestroy$'], 'next');
    expect(safeRxJS['_onDestroy$'].next).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS['_onDestroy$'].next).toHaveBeenCalledTimes(1);
  });

  it(`onDestroy() completes _onDestroy$`, () => {
    jest.spyOn(safeRxJS['_onDestroy$'], 'complete');
    expect(safeRxJS['_onDestroy$'].complete).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS['_onDestroy$'].complete).toHaveBeenCalledTimes(1);
  });

  it(`onDestroy() unsubscribes all safeSubscription SafeSubscription`, () => {
    jest.spyOn(safeRxJS.safeSubscription, 'unsubscribe');
    expect(safeRxJS.safeSubscription.unsubscribe).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS.safeSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(safeRxJS.safeSubscription.unsubscribe).toHaveBeenCalledWith();
  });
});
