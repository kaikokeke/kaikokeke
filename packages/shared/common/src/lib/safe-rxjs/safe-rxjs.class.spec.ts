import { Subject } from 'rxjs';
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

  it(`destroy$ is a Subject`, () => {
    expect(safeRxJS.destroy$).toBeInstanceOf(Subject);
  });

  it(`safeSubscription is a SafeSubscription`, () => {
    expect(safeRxJS.safeSubscription).toBeInstanceOf(SafeSubscription);
  });

  it(
    `takeUntilDestroy() unsubscribes on destroy$ emit`,
    marbles((m) => {
      (safeRxJS as any).destroy$ = m.cold('---------x');
      m.expect(m.cold('-x-x-x-x-x-').pipe(safeRxJS.takeUntilDestroy())).toBeObservable('-x-x-x-x-|');
    })
  );

  it(`onDestroy() emits destroy$`, () => {
    jest.spyOn(safeRxJS.destroy$, 'next');
    expect(safeRxJS.destroy$.next).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS.destroy$.next).toHaveBeenCalledTimes(1);
  });

  it(`onDestroy() completes destroy$`, () => {
    jest.spyOn(safeRxJS.destroy$, 'complete');
    expect(safeRxJS.destroy$.complete).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS.destroy$.complete).toHaveBeenCalledTimes(1);
  });

  it(`onDestroy() unsubscribes all safeSubscription SafeSubscription`, () => {
    jest.spyOn(safeRxJS.safeSubscription, 'unsubscribe');
    expect(safeRxJS.safeSubscription.unsubscribe).not.toHaveBeenCalled();
    safeRxJS.onDestroy();
    expect(safeRxJS.safeSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(safeRxJS.safeSubscription.unsubscribe).toHaveBeenCalledWith();
  });
});
