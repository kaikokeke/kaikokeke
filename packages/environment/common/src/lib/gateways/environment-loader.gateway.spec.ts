/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SafeRxJS } from '@kaikokeke/common';
import { isPlainObject } from 'lodash-es';
import { Observable, of, Subject, throwError } from 'rxjs';
import { fakeSchedulers } from 'rxjs-marbles/jest';
import { delay } from 'rxjs/operators';

import { LoadType, Properties } from '../types';
import { EnvironmentLoaderGateway } from './environment-loader.gateway';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';
import { PropertiesSourceGateway } from './properties-source.gateway';

class TestStore extends EnvironmentStoreGateway {
  getAll(): Properties {
    return {};
  }
  update(properties: Properties): void {}
  reset(): void {}
}

class TestEnvironmentService extends EnvironmentServiceGateway {
  constructor(protected readonly store: EnvironmentStoreGateway) {
    super(store);
  }
}

class TestLoaderService extends EnvironmentLoaderGateway {
  constructor(protected readonly service: EnvironmentServiceGateway) {
    super(service, {}, []);
  }
}

describe('EnvironmentLoaderGateway', () => {
  let service: EnvironmentServiceGateway;
  let loader: EnvironmentLoaderGateway;

  beforeEach(() => {
    service = new TestEnvironmentService(new TestStore());
    loader = new TestLoaderService(service);
  });

  it(`.rxjs is a SafeRxJS`, () => {
    expect(loader['rxjs']).toBeInstanceOf(SafeRxJS);
  });

  it(`.immediateLoad$ is a Subject`, () => {
    expect(loader['immediateLoad$']).toBeInstanceOf(Subject);
  });

  it(`.config is setted`, () => {
    expect(loader['config']).toEqual({ interpolation: ['{{', '}}'], loadInOrder: true });
  });

  it(`.dismissOtherSources is false`, () => {
    expect(loader['dismissOtherSources']).toEqual(false);
  });

  it(`.isApplicationLoaded is false`, () => {
    expect(loader['isApplicationLoaded']).toEqual(false);
  });

  it(`.service is an EnvironmentServiceGateway`, () => {
    expect(loader['service']).toBeInstanceOf(EnvironmentServiceGateway);
  });

  it(`.partialConfig is a plain object`, () => {
    expect(isPlainObject(loader['partialConfig'])).toEqual(true);
  });

  it(`.sources is defined`, () => {
    expect(loader['sources']).toBeDefined();
  });

  describe('load()', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    // load() returns

    class DefaultSource extends PropertiesSourceGateway {
      name = 'MaxLoadSource';
      load(): Observable<Properties> {
        return of({ a: 0 }).pipe(delay(1000));
      }
    }

    it(`load() returns resolved Promise on maxLoadTime ms`, () => {
      (loader as unknown)['config'] = { maxLoadTime: 500 };
      (loader as unknown)['sources'] = [new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(499);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class InitializationSource extends PropertiesSourceGateway {
      name = 'InitializationSource';
      load(): Observable<Properties> {
        return of({ b: 0 }).pipe(delay(1000));
      }
    }

    it(`load() returns resolved Promise when all initialization sources are resolved`, () => {
      (loader as unknown)['sources'] = [new DefaultSource(), new InitializationSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(1999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ImmediateSource extends PropertiesSourceGateway {
      name = 'ImmediateSource';
      immediate = true;
      load(): Observable<Properties> {
        return of({ c: 0 }).pipe(delay(1000));
      }
    }

    it(`load() returns resolved Promise when an immediate source is resolved`, () => {
      (loader as unknown)['sources'] = [new ImmediateSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ErrorSource extends PropertiesSourceGateway {
      name = 'ErrorSource';
      load(): Observable<Properties> {
        return throwError(new Error('error')).pipe(delay(1000));
      }
    }

    it(`load() returns rejected Promise when a source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorSource(), new DefaultSource()];
      expect(loader.load()).toReject();
      jest.advanceTimersByTime(999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ErrorNoRequiredSource extends PropertiesSourceGateway {
      name = 'ErrorNoRequiredSource';
      isRequired = false;
      load(): Observable<Properties> {
        return throwError(new Error('error')).pipe(delay(1000));
      }
    }

    it(`load() returns resolved Promise when a non required source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorNoRequiredSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(1999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`load() returns resolved Promise when no sources`, () => {
      (loader as unknown)['sources'] = [];
      expect(loader.load()).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class DeferredSource extends PropertiesSourceGateway {
      name = 'DeferredSource';
      loadType = LoadType.DEFERRED;
      load(): Observable<Properties> {
        return of({ d: 0 }).pipe(delay(1000));
      }
    }

    it(`load() returns resolved Promise when no INITIALIZATION sources`, () => {
      (loader as unknown)['sources'] = [new DeferredSource()];
      expect(loader.load()).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    // check loadInOrder

    class LoadInOrderASource extends PropertiesSourceGateway {
      name = 'LoadInOrderASource';
      loadType = LoadType.INITIALIZATION;
      load(): Observable<Properties> {
        return of({ a: 0 }).pipe(delay(500));
      }
    }

    class LoadInOrderBSource extends PropertiesSourceGateway {
      name = 'LoadInOrderBSource';
      loadType = LoadType.INITIALIZATION;
      load(): Observable<Properties> {
        return of({ b: 0 }).pipe(delay(400));
      }
    }

    class LoadInOrderCSource extends PropertiesSourceGateway {
      name = 'LoadInOrderCSource';
      loadType = LoadType.DEFERRED;
      load(): Observable<Properties> {
        return of({ c: 0 }).pipe(delay(300));
      }
    }

    it(
      `load() with config loadInOrder true loads the sources in order`,
      fakeSchedulers((advance) => {
        jest.spyOn(service, 'merge');
        (loader as unknown)['config'] = { loadInOrder: true };
        (loader as unknown)['sources'] = [new LoadInOrderASource(), new LoadInOrderBSource(), new LoadInOrderCSource()];
        loader.load();
        advance(500);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        advance(400);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        advance(3000);
        expect(service.merge).toHaveBeenNthCalledWith(3, { c: 0 }, undefined);
      })
    );

    it(
      `load() with config loadInOrder false loads the sources in all at a time`,
      fakeSchedulers((advance) => {
        jest.spyOn(service, 'merge');
        (loader as unknown)['config'] = { loadInOrder: false };
        (loader as unknown)['sources'] = [new LoadInOrderASource(), new LoadInOrderBSource(), new LoadInOrderCSource()];
        loader.load();
        advance(500);
        expect(service.merge).toHaveBeenNthCalledWith(1, { c: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
      })
    );
  });
});
