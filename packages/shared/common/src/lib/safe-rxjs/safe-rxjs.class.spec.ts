import { marbles } from 'rxjs-marbles/jest';

import { SafeSubscription } from '../safe-subscription';
import { SafeRxJS } from './safe-rxjs.class';

describe('SafeRxJS', () => {
  let safeRxJS: SafeRxJS;

  beforeEach(() => {
    safeRxJS = new SafeRxJS();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`safeSubscription is a SafeSubscription`, () => {
    expect(safeRxJS.safeSubscription).toBeInstanceOf(SafeSubscription);
  });

  it(
    `takeOne() unsubscribes on first emit`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-----x');
      m.expect(m.cold('---x---x-').pipe(safeRxJS.takeOne())).toBeObservable('---(x|)');
    })
  );

  it(
    `takeOne() unsubscribes on _onDestroy$ emit`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-----x');
      m.expect(m.cold('-------x-').pipe(safeRxJS.takeOne())).toBeObservable('-----|');
    })
  );

  it(
    `takeCount(count) unsubscribes on count emits`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-------x');
      m.expect(m.cold('-x-x-x-').pipe(safeRxJS.takeCount(2))).toBeObservable('-x-(x|)');
    })
  );

  it(
    `takeCount(count) unsubscribes on _onDestroy$ emit`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('-------x');
      m.expect(m.cold('--x------x-').pipe(safeRxJS.takeCount(2))).toBeObservable('--x----|');
    })
  );

  it(
    `takeUntilDestroy() unsubscribes on _onDestroy$ emit`,
    marbles((m) => {
      (safeRxJS as any)['_onDestroy$'] = m.cold('---------x');
      m.expect(m.cold('-x-x-x-x-x-').pipe(safeRxJS.takeUntilDestroy())).toBeObservable('-x-x-x-x-|');
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
