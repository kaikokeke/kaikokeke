/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SafeRxJS } from '@kaikokeke/common';
import { isPlainObject } from 'lodash-es';
import { Observable, of, Subject, throwError } from 'rxjs';
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
      loadType = LoadType.INITIALIZATION;
      load(): Observable<Properties> {
        return of({ a: 0 }).pipe(delay(1000));
      }
    }

    it(`returns resolved Promise on maxLoadTime ms`, () => {
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
      loadType = LoadType.INITIALIZATION;
      load(): Observable<Properties> {
        return of({ b: 0 }).pipe(delay(1000));
      }
    }

    it(`returns resolved Promise when all initialization sources are resolved`, () => {
      (loader as unknown)['sources'] = [new DefaultSource(), new InitializationSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(1999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ImmediateSource extends PropertiesSourceGateway {
      name = 'ImmediateSource';
      loadType = LoadType.INITIALIZATION;
      immediate = true;
      load(): Observable<Properties> {
        return of({ c: 0 }).pipe(delay(1000));
      }
    }

    it(`returns resolved Promise when an immediate source is resolved`, () => {
      (loader as unknown)['sources'] = [new ImmediateSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ErrorSource extends PropertiesSourceGateway {
      name = 'ErrorSource';
      loadType = LoadType.INITIALIZATION;
      load(): Observable<Properties> {
        return throwError(new Error('error')).pipe(delay(1000));
      }
    }

    it(`returns rejected Promise when a INITIALIZATION source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorSource(), new DefaultSource()];
      expect(loader.load()).toReject();
      jest.advanceTimersByTime(999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class ErrorNoRequiredSource extends PropertiesSourceGateway {
      name = 'ErrorNoRequiredSource';
      loadType = LoadType.INITIALIZATION;
      isRequired = false;
      load(): Observable<Properties> {
        return throwError(new Error('error')).pipe(delay(1000));
      }
    }

    it(`returns resolved Promise when a non required INITIALIZATION source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorNoRequiredSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(1999);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when no sources`, () => {
      (loader as unknown)['sources'] = [];
      expect(loader.load()).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    class DidmissOtherSourcesSource extends PropertiesSourceGateway {
      name = 'DidmissOtherSourcesSource';
      loadType = LoadType.INITIALIZATION;
      dismissOtherSources = true;
      load(): Observable<Properties> {
        return of({ d: 0 }).pipe(delay(500));
      }
    }

    it(`returns resolved Promise when a dismissOtherSources INITIALIZATION source returns`, () => {
      (loader as unknown)['sources'] = [new DidmissOtherSourcesSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(499);
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

    it(`returns resolved Promise when no INITIALIZATION sources`, () => {
      (loader as unknown)['sources'] = [new DeferredSource()];
      expect(loader.load()).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    // load in order

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

    const loadInOrderSources = [new LoadInOrderCSource(), new LoadInOrderASource(), new LoadInOrderBSource()];

    it(`resolves the sources in order if config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: true };
      (loader as unknown)['sources'] = loadInOrderSources;
      loader.load();
      jest.advanceTimersByTime(499);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.advanceTimersByTime(399);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      jest.advanceTimersByTime(299);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { c: 0 }, undefined);
    });

    it(`resolves the sources all at once if no config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: false };
      (loader as unknown)['sources'] = loadInOrderSources;
      loader.load();
      jest.advanceTimersByTime(299);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { c: 0 }, undefined);
      jest.advanceTimersByTime(99);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      jest.advanceTimersByTime(99);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
    });

    // works with Promise and Observable

    class ObservableSource extends PropertiesSourceGateway {
      name = 'ObservableSource';
      load(): Observable<Properties> {
        return of({ a: 0 });
      }
    }

    it(`resolves if source is an Observable`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new ObservableSource()];
      loader.load();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
    });

    class PromiseSource extends PropertiesSourceGateway {
      name = 'PromiseSource';
      async load(): Promise<Properties> {
        return Promise.resolve({ b: 0 });
      }
    }

    it(`resolves if source is a Promise`, async () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new PromiseSource()];
      await loader.load();
      expect(service.merge).toHaveBeenNthCalledWith(1, { b: 0 }, undefined);
    });

    // display errors

    class ErrorDeferredSource extends PropertiesSourceGateway {
      name = 'ErrorDeferredSource';
      loadType = LoadType.DEFERRED;
      load(): Observable<Properties> {
        return throwError(new Error('test'));
      }
    }

    it(`displays a console.error if no INITIALIZATION source`, () => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
      (loader as unknown)['sources'] = [new ErrorDeferredSource()];
      loader.load();
      jest.advanceTimersByTime(1);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorDeferredSource" failed to load: test')
      );
    });

    class ErrorNotRequiredInitializationSource extends PropertiesSourceGateway {
      name = 'ErrorNotRequiredInitializationSource';
      isRequired = false;
      load(): Observable<Properties> {
        return throwError(new Error('error'));
      }
    }

    it(`displays a console.error if source is not required and INITIALIZATION`, () => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
      (loader as unknown)['sources'] = [new ErrorNotRequiredInitializationSource()];
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorNotRequiredInitializationSource" failed to load: error')
      );
    });

    class ErrorInitializationSource extends PropertiesSourceGateway {
      name = 'ErrorInitializationSource';
      load(): Observable<Properties> {
        return throwError(new Error('error')).pipe(delay(1000));
      }
    }

    it(`throws error if required and INITIALIZATION`, (done) => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
      (loader as unknown)['sources'] = [new ErrorInitializationSource()];
      loader.load().catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorInitializationSource" failed to load: error'
        );
        done();
      });
    });

    it(`displays a console.error if required and INITIALIZATION and app loaded`, () => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
      (loader as unknown)['sources'] = [new ImmediateSource(), new ErrorInitializationSource()];
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorInitializationSource" failed to load: error')
      );
    });

    // reset the store

    // check merge strategy

    // check dismiss other sources

    const dismissOtherSourcesSources = [new DidmissOtherSourcesSource(), new DefaultSource(), new DeferredSource()];

    it(`resolves and dismiss other sources if dismissOtherSources and config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: true };
      (loader as unknown)['sources'] = dismissOtherSourcesSources;
      loader.load();
      jest.advanceTimersByTime(499);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { d: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`resolves and dismiss other sources if dismissOtherSources and no config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: false };
      (loader as unknown)['sources'] = dismissOtherSourcesSources;
      loader.load();
      jest.advanceTimersByTime(499);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { d: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });
  });

  // loadChild

  // onDestroy
});
