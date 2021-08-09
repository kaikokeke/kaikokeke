import { SafeRxJS } from '@kaikokeke/common';
import { isPlainObject } from 'lodash-es';
import { interval, Observable, of, Subject, throwError } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { LoadType, MergeStrategy, Properties } from '../types';
import { EnvironmentLoaderGateway } from './environment-loader.gateway';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';
import { PropertiesSourceGateway } from './properties-source.gateway';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

class DefaultSource extends PropertiesSourceGateway {
  name = 'MaxLoadSource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(10));
  }
}

class InitializationSource extends PropertiesSourceGateway {
  name = 'InitializationSource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(10));
  }
}

class ImmediateSource extends PropertiesSourceGateway {
  name = 'ImmediateSource';
  loadType = LoadType.INITIALIZATION;
  immediate = true;
  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(10));
  }
}

class ErrorSource extends PropertiesSourceGateway {
  name = 'ErrorSource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class ErrorNoRequiredSource extends PropertiesSourceGateway {
  name = 'ErrorNoRequiredSource';
  loadType = LoadType.INITIALIZATION;
  isRequired = false;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class DidmissOtherSourcesSource extends PropertiesSourceGateway {
  name = 'DidmissOtherSourcesSource';
  loadType = LoadType.INITIALIZATION;
  dismissOtherSources = true;
  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(5));
  }
}

class DeferredSource extends PropertiesSourceGateway {
  name = 'DeferredSource';
  loadType = LoadType.DEFERRED;
  load(): Observable<Properties> {
    return of({ d: 0 }).pipe(delay(10));
  }
}

class MultipleInitializationSource extends PropertiesSourceGateway {
  name = 'MultipleInitializationSource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return interval(10).pipe(
      map((n) => ({ a: n })),
      take(3)
    );
  }
}

class LoadInOrderASource extends PropertiesSourceGateway {
  name = 'LoadInOrderASource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(5));
  }
}

class LoadInOrderBSource extends PropertiesSourceGateway {
  name = 'LoadInOrderBSource';
  loadType = LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(4));
  }
}

class LoadInOrderCSource extends PropertiesSourceGateway {
  name = 'LoadInOrderCSource';
  loadType = LoadType.DEFERRED;
  load(): Observable<Properties> {
    return of({ c: 0 }).pipe(delay(3));
  }
}

const loadInOrderSources = [new LoadInOrderCSource(), new LoadInOrderASource(), new LoadInOrderBSource()];

class ObservableSource extends PropertiesSourceGateway {
  name = 'ObservableSource';
  loadType: LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return of({ a: 0 });
  }
}

class PromiseSource extends PropertiesSourceGateway {
  name = 'PromiseSource';
  loadType: LoadType.INITIALIZATION;
  async load(): Promise<Properties> {
    return Promise.resolve({ b: 0 });
  }
}

class ErrorDeferredSource extends PropertiesSourceGateway {
  name = 'ErrorDeferredSource';
  loadType = LoadType.DEFERRED;
  load(): Observable<Properties> {
    return throwError(new Error('test'));
  }
}

class ErrorNotRequiredInitializationSource extends PropertiesSourceGateway {
  name = 'ErrorNotRequiredInitializationSource';
  loadType: LoadType.INITIALIZATION;
  isRequired = false;
  load(): Observable<Properties> {
    return throwError(new Error('error'));
  }
}

class ErrorInitializationSource extends PropertiesSourceGateway {
  name = 'ErrorInitializationSource';
  loadType: LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class ErrorAppLoadedSource extends PropertiesSourceGateway {
  name = 'ErrorAppLoadedSource';
  loadType: LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delay(10));
  }
}

class ErrorWithMessageSource extends PropertiesSourceGateway {
  name = 'ErrorWithMessageSource';
  loadType: LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return throwError(new Error('error'));
  }
}

class ErrorWithoutMessageSource extends PropertiesSourceGateway {
  name = 'ErrorWithoutMessageSource';
  loadType: LoadType.INITIALIZATION;
  load(): Observable<Properties> {
    return throwError(new Error());
  }
}

class ResetSource extends PropertiesSourceGateway {
  name = 'ResetSource';
  resetEnvironment = true;
  load(): Observable<Properties> {
    return of({ r: 0 }).pipe(delay(10));
  }
}

class NoResetSource extends PropertiesSourceGateway {
  name = 'NoResetSource';
  resetEnvironment = false;
  load(): Observable<Properties> {
    return of({ r: 0 }).pipe(delay(10));
  }
}

class MergeSource extends PropertiesSourceGateway {
  name = 'MergeSource';
  mergeStrategy = MergeStrategy.MERGE;
  load(): Observable<Properties> {
    return of({ m: 0 }).pipe(delay(10));
  }
}

class OverwriteSource extends PropertiesSourceGateway {
  name = 'OverwriteSource';
  mergeStrategy = MergeStrategy.OVERWRITE;
  load(): Observable<Properties> {
    return of({ m: 0 }).pipe(delay(10));
  }
}

class PathMergeSource extends PropertiesSourceGateway {
  name = 'PathMergeSource';
  path = 'a';
  mergeStrategy = MergeStrategy.MERGE;
  load(): Observable<Properties> {
    return of({ m: 0 }).pipe(delay(10));
  }
}

class PathOverwriteSource extends PropertiesSourceGateway {
  name = 'PathOverwriteSource';
  path = 'a';
  mergeStrategy = MergeStrategy.OVERWRITE;
  load(): Observable<Properties> {
    return of({ m: 0 }).pipe(delay(10));
  }
}

const dismissOtherSourcesSources = [new DidmissOtherSourcesSource(), new DefaultSource(), new DeferredSource()];

class MultipleDeferedSource extends PropertiesSourceGateway {
  name = 'MultipleDeferedSource';
  loadType = LoadType.DEFERRED;
  load(): Observable<Properties> {
    return interval(10).pipe(
      map((n) => ({ b: n })),
      take(3)
    );
  }
}

describe('EnvironmentLoaderGateway', () => {
  let service: EnvironmentServiceGateway;
  let loader: EnvironmentLoaderGateway;

  beforeEach(() => {
    service = new TestEnvironmentService(new TestStore());
    loader = new TestLoaderService(service);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it(`.rxjs is a SafeRxJS`, () => {
    expect(loader['rxjs']).toBeInstanceOf(SafeRxJS);
  });

  it(`.immediateLoad$ is a Subject`, () => {
    expect(loader['appLoad$']).toBeInstanceOf(Subject);
  });

  it(`.config is setted`, () => {
    expect(loader['config']).toEqual({ interpolation: ['{{', '}}'], loadInOrder: true });
  });

  it(`.dismissOtherSources is false`, () => {
    expect(loader['dismissOtherSources']).toEqual(false);
  });

  it(`.isAppLoaded is false`, () => {
    expect(loader['isLoaded']).toEqual(false);
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
    it(`returns resolved Promise on config.maxLoadTime ms`, () => {
      (loader as unknown)['config'] = { maxLoadTime: 5 };
      (loader as unknown)['sources'] = [new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(4);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when all initialization sources are resolved`, () => {
      (loader as unknown)['sources'] = [new DefaultSource(), new InitializationSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(19);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when an immediate source is resolved`, () => {
      (loader as unknown)['sources'] = [new ImmediateSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns rejected Promise when a INITIALIZATION source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorSource(), new DefaultSource()];
      expect(loader.load()).toReject();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when a non required INITIALIZATION source returns an error`, () => {
      (loader as unknown)['sources'] = [new ErrorNoRequiredSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(9);
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

    it(`returns resolved Promise when a dismissOtherSources INITIALIZATION source returns`, () => {
      (loader as unknown)['sources'] = [new DidmissOtherSourcesSource(), new DefaultSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(4);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when no INITIALIZATION sources`, () => {
      (loader as unknown)['sources'] = [new DeferredSource()];
      expect(loader.load()).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise from multiple emitter INITIALIZATION sources`, () => {
      (loader as unknown)['sources'] = [new MultipleInitializationSource()];
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    // load in order

    it(`resolves the sources in order if config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: true };
      (loader as unknown)['sources'] = loadInOrderSources;
      loader.load();
      jest.advanceTimersByTime(4);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.advanceTimersByTime(3);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      jest.advanceTimersByTime(2);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { c: 0 }, undefined);
    });

    it(`resolves the sources all at once if no config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: false };
      (loader as unknown)['sources'] = loadInOrderSources;
      loader.load();
      jest.advanceTimersByTime(2);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { c: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // works with Promise and Observable

    it(`resolves if source is an Observable`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new ObservableSource()];
      loader.load();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
    });

    it(`resolves if source is a Promise`, async () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new PromiseSource()];
      await loader.load();
      expect(service.merge).toHaveBeenNthCalledWith(1, { b: 0 }, undefined);
    });

    // display errors

    it(`displays a console.error if no INITIALIZATION source`, () => {
      (loader as unknown)['sources'] = [new ErrorDeferredSource()];
      loader.load();
      jest.advanceTimersByTime(1);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorDeferredSource" failed to load: test')
      );
    });

    it(`displays a console.error if source is not required and INITIALIZATION`, () => {
      (loader as unknown)['sources'] = [new ErrorNotRequiredInitializationSource()];
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorNotRequiredInitializationSource" failed to load: error')
      );
    });

    it(`throws error if required and INITIALIZATION`, () => {
      (loader as unknown)['sources'] = [new ErrorInitializationSource()];
      loader.load().catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorInitializationSource" failed to load: error'
        );
        expect(console.error).not.toHaveBeenCalled();
      });
    });

    it(`displays a console.error if required and INITIALIZATION but app loaded`, () => {
      (loader as unknown)['sources'] = [new ImmediateSource(), new ErrorAppLoadedSource()];
      loader.load();
      jest.advanceTimersByTime(20);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorAppLoadedSource" failed to load')
      );
    });

    it(`throws error with message`, () => {
      (loader as unknown)['sources'] = [new ErrorWithMessageSource()];
      loader.load().catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorWithMessageSource" failed to load: error'
        );
      });
    });

    it(`throws error without message`, () => {
      (loader as unknown)['sources'] = [new ErrorWithoutMessageSource()];
      loader.load().catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorWithoutMessageSource" failed to load'
        );
      });
    });

    // actions on app load error

    it(`resolves the non error sources if app loaded`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new ImmediateSource(), new ErrorSource(), new DefaultSource()];
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    it(`do not resolves sources after error if app is not loaded`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new DefaultSource(), new ErrorSource(), new DefaultSource()];
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // reset the store

    it(`resets the source if resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      (loader as unknown)['sources'] = [new ResetSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).toHaveBeenCalledTimes(1);
    });

    it(`doesn't reset the source if no resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      (loader as unknown)['sources'] = [new NoResetSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).not.toHaveBeenCalled();
    });

    // check merge strategy

    it(`uses the MERGE strategy`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new MergeSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { m: 0 }, undefined);
    });

    it(`uses the OVERWRITE strategy`, () => {
      jest.spyOn(service, 'overwrite');
      (loader as unknown)['sources'] = [new OverwriteSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.overwrite).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.overwrite).toHaveBeenNthCalledWith(1, { m: 0 }, undefined);
    });

    // uses the path

    it(`uses the MERGE strategy with path`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new PathMergeSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { m: 0 }, 'a');
    });

    it(`uses the OVERWRITE strategy with path`, () => {
      jest.spyOn(service, 'overwrite');
      (loader as unknown)['sources'] = [new PathOverwriteSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.overwrite).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.overwrite).toHaveBeenNthCalledWith(1, { m: 0 }, 'a');
    });

    // check dismiss other sources

    it(`resolves and dismiss other sources if dismissOtherSources and config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['config'] = { loadInOrder: true };
      (loader as unknown)['sources'] = dismissOtherSourcesSources;
      loader.load();
      jest.advanceTimersByTime(4);
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
      jest.advanceTimersByTime(4);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { d: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // load multiple in initialization and deferred

    it(`resolves only the first emit if source emits multiple and is INITIALIZATION`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new MultipleInitializationSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`resolves all emitted if sources emits multiple and is DEFERRED`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = [new MultipleDeferedSource()];
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { b: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 1 }, undefined);
      expect(service.merge).toHaveBeenNthCalledWith(3, { b: 2 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(3);
    });
  });

  describe('loadModule()', () => {
    it(`returns resolved Promise on config.maxLoadTime ms`, () => {
      expect(loader.loadModule([new DefaultSource()], { maxLoadTime: 5 })).toResolve();
      jest.advanceTimersByTime(4);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when all initialization sources are resolved`, () => {
      expect(loader.loadModule([new DefaultSource(), new InitializationSource()])).toResolve();
      jest.advanceTimersByTime(19);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when an immediate source is resolved`, () => {
      expect(loader.loadModule([new ImmediateSource(), new DefaultSource()])).toResolve();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns rejected Promise when a INITIALIZATION source returns an error`, () => {
      expect(loader.loadModule([new ErrorSource(), new DefaultSource()])).toReject();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when a non required INITIALIZATION source returns an error`, () => {
      expect(loader.loadModule([new ErrorNoRequiredSource(), new DefaultSource()])).toResolve();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when no sources`, () => {
      expect(loader.loadModule([])).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when a dismissOtherSources INITIALIZATION source returns`, () => {
      expect(loader.loadModule([new DidmissOtherSourcesSource(), new DefaultSource()])).toResolve();
      jest.advanceTimersByTime(4);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise when no INITIALIZATION sources`, () => {
      expect(loader.loadModule([new DeferredSource()])).toResolve();
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    it(`returns resolved Promise from multiple emitter INITIALIZATION sources`, () => {
      expect(loader.loadModule([new MultipleInitializationSource()])).toResolve();
      jest.advanceTimersByTime(9);
      expect.assertions(0);
      jest.advanceTimersByTime(1);
      expect.assertions(1);
    });

    // load in order

    it(`resolves the sources in order if config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule(loadInOrderSources, { loadInOrder: true });
      jest.advanceTimersByTime(4);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.advanceTimersByTime(3);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      jest.advanceTimersByTime(2);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { c: 0 }, undefined);
    });

    it(`resolves the sources all at once if no config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule(loadInOrderSources, { loadInOrder: false });
      jest.advanceTimersByTime(2);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { c: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // works with Promise and Observable

    it(`resolves if source is an Observable`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new ObservableSource()]);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
    });

    it(`resolves if source is a Promise`, async () => {
      jest.spyOn(service, 'merge');
      await loader.loadModule([new PromiseSource()]);
      expect(service.merge).toHaveBeenNthCalledWith(1, { b: 0 }, undefined);
    });

    // display errors

    it(`displays a console.error if no INITIALIZATION source`, () => {
      loader.loadModule([new ErrorDeferredSource()]);
      jest.advanceTimersByTime(1);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorDeferredSource" failed to load: test')
      );
    });

    it(`displays a console.error if source is not required and INITIALIZATION`, () => {
      loader.loadModule([new ErrorNotRequiredInitializationSource()]);
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorNotRequiredInitializationSource" failed to load: error')
      );
    });

    it(`throws error if required and INITIALIZATION`, () => {
      loader.loadModule([new ErrorInitializationSource()]).catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorInitializationSource" failed to load: error'
        );
        expect(console.error).not.toHaveBeenCalled();
      });
    });

    it(`displays a console.error if required and INITIALIZATION but app loaded`, () => {
      loader.loadModule([new ImmediateSource(), new ErrorAppLoadedSource()]);
      jest.advanceTimersByTime(20);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        new Error('Required Environment PropertiesSource "ErrorAppLoadedSource" failed to load')
      );
    });

    it(`throws error with message`, () => {
      loader.loadModule([new ErrorWithMessageSource()]).catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorWithMessageSource" failed to load: error'
        );
      });
    });

    it(`throws error without message`, () => {
      loader.loadModule([new ErrorWithoutMessageSource()]).catch((error) => {
        expect(error.message).toEqual(
          'Required Environment PropertiesSource "ErrorWithoutMessageSource" failed to load'
        );
      });
    });

    // actions on app load error

    it(`resolves the non error sources if app loaded`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new ImmediateSource(), new ErrorSource(), new DefaultSource()]);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    it(`do not resolves sources after error if app is not loaded`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new DefaultSource(), new ErrorSource(), new DefaultSource()]);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // reset the store

    it(`resets the source if resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      loader.loadModule([new ResetSource()]);
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).toHaveBeenCalledTimes(1);
    });

    it(`doesn't reset the source if no resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      loader.loadModule([new NoResetSource()]);
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).not.toHaveBeenCalled();
    });

    // check merge strategy

    it(`uses the MERGE strategy`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new MergeSource()]);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { m: 0 }, undefined);
    });

    it(`uses the OVERWRITE strategy`, () => {
      jest.spyOn(service, 'overwrite');
      loader.loadModule([new OverwriteSource()]);
      jest.advanceTimersByTime(9);
      expect(service.overwrite).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.overwrite).toHaveBeenNthCalledWith(1, { m: 0 }, undefined);
    });

    // uses the path

    it(`uses the MERGE strategy with path`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new PathMergeSource()]);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { m: 0 }, 'a');
    });

    it(`uses the OVERWRITE strategy with path`, () => {
      jest.spyOn(service, 'overwrite');
      loader.loadModule([new PathOverwriteSource()]);
      jest.advanceTimersByTime(9);
      expect(service.overwrite).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.overwrite).toHaveBeenNthCalledWith(1, { m: 0 }, 'a');
    });

    // check dismiss other sources

    it(`resolves and dismiss other sources if dismissOtherSources and config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule(dismissOtherSourcesSources, { loadInOrder: true });
      jest.advanceTimersByTime(4);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { d: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`resolves and dismiss other sources if dismissOtherSources and no config.loadInOrder`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule(dismissOtherSourcesSources, { loadInOrder: false });
      jest.advanceTimersByTime(4);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { d: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // load multiple in initialization and deferred

    it(`resolves only the first emit if source emits multiple and is INITIALIZATION`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new MultipleInitializationSource()]);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`resolves all emitted if sources emits multiple and is DEFERRED`, () => {
      jest.spyOn(service, 'merge');
      loader.loadModule([new MultipleDeferedSource()]);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { b: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenNthCalledWith(2, { b: 1 }, undefined);
      expect(service.merge).toHaveBeenNthCalledWith(3, { b: 2 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(3);
    });
  });

  // onDestroy
  describe('onDestroy()', () => {
    it(`emits app loaded`, () => {
      (loader as unknown)['sources'] = loadInOrderSources;
      expect(loader.load()).toResolve();
      jest.advanceTimersByTime(2);
      loader.onDestroy();
      jest.runAllTimers();
      expect.assertions(1);
    });

    it(`disposes all sources`, () => {
      jest.spyOn(service, 'merge');
      (loader as unknown)['sources'] = loadInOrderSources;
      loader.load();
      jest.advanceTimersByTime(5);
      loader.onDestroy();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
    });
  });
});
