import { interval, Observable, of, throwError } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentLoader } from './environment-loader.gateway';
import { EnvironmentService } from './environment-service.gateway';
import { EnvironmentStore } from './environment-store.gateway';
import { PropertiesSource } from './properties-source.gateway';

class TestStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    return of({});
  }
  getAll(): Properties {
    return {};
  }
  update(properties: Properties): void {}
  reset(): void {}
}

class TestEnvironmentService extends EnvironmentService {
  constructor(protected store: EnvironmentStore) {
    super(store);
  }
}

class TestLoaderService extends EnvironmentLoader {
  constructor(protected service: EnvironmentService) {
    super(service, []);
  }
}

class PromiseSource extends PropertiesSource {
  async load(): Promise<Properties> {
    return Promise.resolve({ p: 0 });
  }
}

class ArraySource extends PropertiesSource {
  load(): Properties[] {
    return [{ arr: 0 }];
  }
}

class Source1 extends PropertiesSource {
  load(): Observable<Properties> {
    return of({ a: 0 }).pipe(delay(5));
  }
}

class Source2 extends PropertiesSource {
  load(): Observable<Properties> {
    return of({ b: 0 }).pipe(delay(5));
  }
}

class InfiniteSource extends PropertiesSource {
  load(): Observable<Properties> {
    return interval(5).pipe(map((n) => ({ i: n })));
  }
}

class MultipleSource extends PropertiesSource {
  load(): Observable<Properties> {
    return interval(5).pipe(
      map((n) => ({ m: n })),
      take(2),
    );
  }
}

class ErrorSource extends PropertiesSource {
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delay(5));
  }
}

class ErrorMessageSource extends PropertiesSource {
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(5));
  }
}

const requiredErrorSource = new ErrorSource();
requiredErrorSource.requiredToLoad = true;

const requiredOrderedErrorSource = new ErrorSource();
requiredOrderedErrorSource.requiredToLoad = true;
requiredOrderedErrorSource.loadInOrder = true;

const requiredOrderedSource1 = new Source1();
requiredOrderedSource1.requiredToLoad = true;
requiredOrderedSource1.loadInOrder = true;

const requiredOrderedSource2 = new Source2();
requiredOrderedSource2.requiredToLoad = true;
requiredOrderedSource2.loadInOrder = true;

const orderedSource1 = new Source1();
orderedSource1.loadInOrder = true;

const immediateOrderedSource1 = new Source1();
immediateOrderedSource1.loadInOrder = true;
immediateOrderedSource1.loadImmediately = true;

describe('EnvironmentLoader', () => {
  let service: EnvironmentService;
  let loader: EnvironmentLoader;

  beforeEach(() => {
    service = new TestEnvironmentService(new TestStore());
    loader = new TestLoaderService(service);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('load()', () => {
    it(`returns resolved Promise if no sources`, async () => {
      (loader as unknown)['sources'] = undefined;
      await expect(loader.load()).toResolve();
      (loader as unknown)['sources'] = null;
      await expect(loader.load()).toResolve();
      (loader as unknown)['sources'] = [];
      await expect(loader.load()).toResolve();
    });

    it(`doesn't add properties if no sources`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [];
      loader.load();
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    it(`execute onLoad() if no sources`, () => {
      jest.spyOn<any, any>(loader, 'onLoad');
      jest.spyOn<any, any>(loader, 'onError');
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [];
      loader.load();
      jest.runAllTimers();
      expect(loader['onLoad']).toHaveBeenCalledTimes(1);
      expect(loader['onError']).not.toHaveBeenCalled();
    });

    it(`returns resolved Promise if source`, async () => {
      (loader as unknown)['sources'] = [new Source1()];
      await expect(loader.load()).toResolve();
    });

    it(`adds properties if source`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [new Source1()];
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`execute onLoad() if source`, () => {
      jest.spyOn<any, any>(loader, 'onLoad');
      jest.spyOn<any, any>(loader, 'onError');
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [new Source1()];
      loader.load();
      jest.runAllTimers();
      expect(loader['onLoad']).toHaveBeenCalledTimes(1);
      expect(loader['onError']).not.toHaveBeenCalled();
    });

    it(`returns resolved Promise if source error and app loaded`, async () => {
      jest.spyOn(requiredOrderedErrorSource, 'onSoftError');
      expect(requiredOrderedErrorSource.onSoftError).not.toHaveBeenCalled();
      (loader as unknown)['sources'] = [immediateOrderedSource1, requiredOrderedErrorSource];
      await expect(loader.load()).toResolve();
      expect(requiredOrderedErrorSource.onSoftError).toHaveBeenCalledTimes(1);
    });

    it(`doesn't add properties if source error`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [requiredErrorSource];
      loader.load().catch(() => null);
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    it(`execute onError(error) if source error`, async () => {
      jest.spyOn<EnvironmentLoader, any>(loader, 'onLoad');
      jest.spyOn<EnvironmentLoader, any>(loader, 'onError');
      (loader as unknown)['sources'] = [requiredErrorSource];
      await loader.load().catch((error) => {
        expect(loader['onLoad']).not.toHaveBeenCalled();
        expect(loader['onError']).toHaveBeenNthCalledWith(1, 0, error);
      });
    });
  });

  describe('loadSubmodule(sources, onLoadFn?, onErrorFn?)', () => {
    it(`returns resolved Promise if no sources`, async () => {
      await expect(loader.loadSubmodule(undefined)).toResolve();
      await expect(loader.loadSubmodule(null)).toResolve();
      await expect(loader.loadSubmodule([])).toResolve();
    });

    it(`doesn't add properties if no sources`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      loader.loadSubmodule([]);
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    it(`execute onLoadFn() if no sources`, () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.useFakeTimers();
      loader.loadSubmodule([]);
      jest.runAllTimers();
      expect(console.log).not.toHaveBeenCalled();
      loader.loadSubmodule(
        new Source1(),
        () => console.log('onLoadFn'),
        () => console.log('onErrorFn'),
      );
      jest.runAllTimers();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onLoadFn');
      expect(console.log).not.toHaveBeenCalledWith('onErrorFn');
    });

    it(`returns resolved Promise if source`, async () => {
      await expect(loader.loadSubmodule(new Source1())).toResolve();
    });

    it(`adds properties if source`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      loader.loadSubmodule(new Source1());
      jest.runAllTimers();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`execute onLoadFn() if source`, () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.useFakeTimers();
      loader.loadSubmodule(new Source1());
      jest.runAllTimers();
      expect(console.log).not.toHaveBeenCalled();
      loader.loadSubmodule(
        new Source1(),
        () => console.log('onLoadFn'),
        () => console.log('onErrorFn'),
      );
      jest.runAllTimers();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onLoadFn');
      expect(console.log).not.toHaveBeenCalledWith('onErrorFn');
    });

    it(`returns resolved Promise if source error and app loaded`, async () => {
      jest.spyOn(requiredOrderedErrorSource, 'onSoftError');
      expect(requiredOrderedErrorSource.onSoftError).not.toHaveBeenCalled();
      await expect(loader.loadSubmodule([immediateOrderedSource1, requiredOrderedErrorSource])).toResolve();
      expect(requiredOrderedErrorSource.onSoftError).toHaveBeenCalledTimes(1);
    });

    it(`doesn't add properties if source error`, () => {
      jest.spyOn(service, 'merge');
      jest.useFakeTimers();
      loader.loadSubmodule(requiredErrorSource).catch(() => null);
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    it(`execute onErrorFn(error) if source error`, async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);
      await loader
        .loadSubmodule(
          requiredErrorSource,
          (index) => console.log('onLoadFn'),
          (index, error) => console.log(error),
        )
        .catch((error) => {
          expect(console.log).toHaveBeenNthCalledWith(1, error);
          expect(console.log).not.toHaveBeenCalledWith('onLoadFn');
        });
    });
  });

  describe('onDestroy()', () => {
    beforeEach(() => {
      jest.spyOn(service, 'merge');
    });

    it(`destroys all loads`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2]);
      jest.advanceTimersByTime(5);
      expect(service.merge).toHaveBeenCalledTimes(1);
      expect(loader['destroy$List'][0].isStopped).toBeFalse();
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['destroy$List'][0].isStopped).toBeTrue();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`completes the app load`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2]);
      jest.advanceTimersByTime(5);
      expect(loader['load$List'][0].isStopped).toBeFalse();
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['load$List'][0].isStopped).toBeTrue();
    });

    it(`completes the required to load sources`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2]);
      jest.advanceTimersByTime(5);
      expect(loader['requiredToLoad$List'][0].isStopped).toBeFalse();
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['requiredToLoad$List'][0].isStopped).toBeTrue();
    });
  });

  describe('PropertiesSource', () => {
    beforeEach(() => {
      jest.spyOn(service, 'merge');
    });

    describe('requiredToLoad', () => {
      const orderedErrorSource = new ErrorSource();
      orderedErrorSource.loadInOrder = true;

      it(`returns resolved Promise after all requiredToLoad`, async () => {
        await loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2, orderedSource1]).then(() => {
          expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
          expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
          expect(service.merge).toHaveBeenCalledTimes(2);
        });
      });

      it(`returns resolved Promise immedialely if no requiredToLoad`, async () => {
        await loader.loadSubmodule(new Source1()).then(() => {
          expect(service.merge).not.toHaveBeenCalled();
        });
      });

      it(`adds properties from all sources ignoring requiredToLoad`, async () => {
        await loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2, new Source1()]).then(() => {
          expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
          expect(service.merge).toHaveBeenNthCalledWith(2, { a: 0 }, undefined);
          expect(service.merge).toHaveBeenNthCalledWith(3, { b: 0 }, undefined);
          expect(service.merge).toHaveBeenCalledTimes(3);
        });
      });

      it(`returns rejected Promise after load error and requiredToLoad`, async () => {
        const error = new Error('Required Environment PropertiesSource "ErrorSource" failed to load');
        await loader
          .loadSubmodule([requiredOrderedSource1, requiredOrderedErrorSource, requiredOrderedSource2])
          .catch((err) => {
            expect(err).toEqual(error);
            expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
            expect(service.merge).toHaveBeenCalledTimes(1);
          });
      });

      it(`returns resolved Promise after load error and no requiredToLoad`, async () => {
        await loader.loadSubmodule([requiredOrderedSource1, orderedErrorSource, requiredOrderedSource2]).then(() => {
          expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
          expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
          expect(service.merge).toHaveBeenCalledTimes(2);
        });
      });

      it(`adds properties ignoring requiredToLoad`, () => {
        jest.useFakeTimers();
        loader
          .loadSubmodule([requiredOrderedSource1, requiredOrderedErrorSource, requiredOrderedSource2])
          .catch(() => null);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledWith({ a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledWith({ b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    describe('loadInOrder', () => {
      const orderedInfiniteSource = new InfiniteSource();
      orderedInfiniteSource.loadInOrder = true;

      const orderedMultipleSource = new MultipleSource();
      orderedMultipleSource.loadInOrder = true;

      it(`adds properties in order if all completes`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([requiredOrderedSource1, requiredOrderedSource2, orderedSource1]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(3);
      });

      it(`adds properties in order ignoring error`, () => {
        jest.useFakeTimers();
        loader
          .loadSubmodule([requiredOrderedSource1, requiredOrderedSource2, requiredOrderedErrorSource, orderedSource1])
          .catch(() => null);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(3);
      });

      it(`adds properties in order with multiple emits and all completes`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([orderedMultipleSource, orderedSource1]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { m: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(2, { m: 1 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(3, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(3);
      });

      it(`doesn't add properties in order if previous doesn't complete`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([orderedInfiniteSource, orderedSource1]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1000);
        expect(service.merge).toHaveBeenCalledWith({ i: 0 }, undefined);
        expect(service.merge).not.toHaveBeenCalledWith({ a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(Math.floor(1000 / 5));
      });

      it(`adds all properties at once if no loadInOrder`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([new Source1(), new Source2()]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenCalledWith({ a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledWith({ b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(2);
      });

      it(`adds properties mixing loadInOrder and no loadInOrder`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([requiredOrderedSource2, new Source1(), new MultipleSource(), orderedSource1]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { m: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(3, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(4, { m: 1 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(5, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(5);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(5);
      });
    });

    describe('loadImmediately', () => {
      const immediateOrderedErrorSource = new ErrorSource();
      immediateOrderedErrorSource.loadImmediately = true;
      immediateOrderedErrorSource.loadInOrder = true;

      it(`returns resolved Promise after loadImmediately`, async () => {
        await loader.loadSubmodule([immediateOrderedSource1, requiredOrderedSource2]).then(() => {
          expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
          expect(service.merge).toHaveBeenCalledTimes(1);
        });
      });

      it(`adds properties ignoring loadImmediately`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([immediateOrderedSource1, requiredOrderedSource2]);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(2);
      });

      it(`returns resolved Promise ignoring loadImmediately if error`, async () => {
        await loader
          .loadSubmodule([requiredOrderedSource1, immediateOrderedErrorSource, requiredOrderedSource2])
          .then(() => {
            expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
            expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
            expect(service.merge).toHaveBeenCalledTimes(2);
          });
      });
    });

    describe('dismissOtherSources', () => {
      const dismissOrderedSource1 = new Source1();
      dismissOrderedSource1.loadInOrder = true;
      dismissOrderedSource1.dismissOtherSources = true;

      const dismissOrderedErrorSource = new ErrorSource();
      dismissOrderedErrorSource.loadInOrder = true;
      dismissOrderedErrorSource.dismissOtherSources = true;

      it(`returns resolved Promise after dismissOtherSources`, async () => {
        await expect(loader.loadSubmodule([dismissOrderedSource1, orderedSource1])).toResolve();
      });

      it(`adds properties until dismissOtherSources`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule([dismissOrderedSource1, orderedSource1]);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise ignoring dismissOtherSources if error`, async () => {
        await loader
          .loadSubmodule([requiredOrderedSource1, dismissOrderedErrorSource, requiredOrderedSource2])
          .then(() => {
            expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
            expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
            expect(service.merge).toHaveBeenCalledTimes(2);
          });
      });
    });

    describe('deepMergeValues', () => {
      const deepSource1 = new Source1();
      deepSource1.deepMergeValues = true;

      it(`ladds properties using merge strategy if no deepMergeValues`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule(new Source1());
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`adds properties using deep merge strategy if deepMergeValues`, () => {
        jest.spyOn(service, 'deepMerge');
        jest.useFakeTimers();
        loader.loadSubmodule(deepSource1);
        expect(service.deepMerge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.deepMerge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        jest.runAllTimers();
        expect(service.deepMerge).toHaveBeenCalledTimes(1);
      });
    });

    describe('ignoreError', () => {
      const ignoreRequiredOrderedErrorSource = new ErrorSource();
      ignoreRequiredOrderedErrorSource.ignoreError = true;
      ignoreRequiredOrderedErrorSource.loadInOrder = true;
      ignoreRequiredOrderedErrorSource.requiredToLoad = true;

      it(`returns resolved Promise if error and ignoreError`, async () => {
        await loader
          .loadSubmodule([requiredOrderedSource1, ignoreRequiredOrderedErrorSource, requiredOrderedSource2])
          .then(() => {
            expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
            expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
            expect(service.merge).toHaveBeenCalledTimes(2);
          });
      });

      it(`adds properties ignoring error`, () => {
        jest.useFakeTimers();
        loader
          .loadSubmodule([requiredOrderedSource1, ignoreRequiredOrderedErrorSource, requiredOrderedSource2])
          .catch(() => null);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    describe('path', () => {
      const pathSource1 = new Source1();
      pathSource1.path = 'a';

      const pathDeepMergeSource1 = new Source1();
      pathDeepMergeSource1.path = 'a';
      pathDeepMergeSource1.deepMergeValues = true;

      it(`adds properties using merge strategy and path`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule(pathSource1);
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, 'a');
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`adds properties using deep merge strategy and path`, () => {
        jest.spyOn(service, 'deepMerge');
        jest.useFakeTimers();
        loader.loadSubmodule(pathDeepMergeSource1);
        expect(service.deepMerge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.deepMerge).toHaveBeenNthCalledWith(1, { a: 0 }, 'a');
        jest.runAllTimers();
        expect(service.deepMerge).toHaveBeenCalledTimes(1);
      });
    });

    describe('load()', () => {
      const requiredErrorMessageSource = new ErrorMessageSource();
      requiredErrorMessageSource.requiredToLoad = true;

      it(`returns resolved Promise from Array source`, async () => {
        await expect(loader.loadSubmodule(new ArraySource())).toResolve();
      });

      it(`adds properties from Array source`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule(new ArraySource());
        jest.runAllTimers();
        expect(service.merge).toHaveBeenNthCalledWith(1, { arr: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise from Observable source`, async () => {
        await expect(loader.loadSubmodule(new Source1())).toResolve();
      });

      it(`adds properties from Observable source`, () => {
        jest.useFakeTimers();
        loader.loadSubmodule(new Source1());
        jest.runAllTimers();
        expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise from Promise source`, async () => {
        await expect(loader.loadSubmodule(new PromiseSource())).toResolve();
      });

      it(`adds properties from Promise source`, async () => {
        await loader.loadSubmodule(new PromiseSource());
        expect(service.merge).toHaveBeenNthCalledWith(1, { p: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`returns rejected Promise without error message`, async () => {
        const error = new Error('Required Environment PropertiesSource "ErrorSource" failed to load');
        await expect(loader.loadSubmodule(requiredErrorSource)).rejects.toEqual(error);
      });

      it(`returns rejected Promise with error message`, async () => {
        const error = new Error('Required Environment PropertiesSource "ErrorMessageSource" failed to load: error');
        await expect(loader.loadSubmodule(requiredErrorMessageSource)).rejects.toEqual(error);
      });
    });

    describe('onBeforeLoad(properties)', () => {
      it(`execute onBeforeLoad(properties) before source load`, () => {
        const source = new Source1();
        jest.spyOn(source, 'onBeforeLoad');
        jest.useFakeTimers();
        loader.loadSubmodule(source);
        jest.runAllTimers();
        expect(source.onBeforeLoad).toHaveBeenNthCalledWith(1, { a: 0 });
        expect(source.onBeforeLoad).toHaveBeenCalledTimes(1);
      });

      it(`doesn't execute onBeforeLoad(properties) if error`, () => {
        const source = new ErrorSource();
        jest.spyOn(source, 'onBeforeLoad');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onBeforeLoad).not.toHaveBeenCalled();
      });
    });

    describe('onAfterLoad(properties)', () => {
      it(`execute onAfterLoad(properties) after source load`, () => {
        const source = new Source1();
        jest.spyOn(source, 'onAfterLoad');
        jest.useFakeTimers();
        loader.loadSubmodule(source);
        jest.runAllTimers();
        expect(source.onAfterLoad).toHaveBeenNthCalledWith(1, { a: 0 });
        expect(source.onAfterLoad).toHaveBeenCalledTimes(1);
      });

      it(`doesn't execute onAfterLoad(properties) if error`, () => {
        const source = new ErrorSource();
        jest.spyOn(source, 'onAfterLoad');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onAfterLoad).not.toHaveBeenCalled();
      });
    });

    describe('onError(error)', () => {
      it(`execute onError(error) after source error that rejects`, () => {
        const error = new Error('Required Environment PropertiesSource "ErrorSource" failed to load');
        const source = requiredErrorSource;
        jest.spyOn(source, 'onError');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onError).toHaveBeenNthCalledWith(1, error);
        expect(source.onError).toHaveBeenCalledTimes(1);
      });

      it(`doesn't execute onError(error) if error that doesn't reject`, () => {
        const source = new ErrorSource();
        jest.spyOn(source, 'onError');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onError).not.toHaveBeenCalled();
      });

      it(`doesn't execute onError(error) if no error`, () => {
        const source = new Source1();
        jest.spyOn(source, 'onError');
        jest.useFakeTimers();
        loader.loadSubmodule(source);
        jest.runAllTimers();
        expect(source.onError).not.toHaveBeenCalled();
      });
    });

    describe('onSoftError(error)', () => {
      it(`execute onSoftError(error) after source error that doesn't reject`, () => {
        const error = new Error('Required Environment PropertiesSource "ErrorSource" failed to load');
        const source = new ErrorSource();
        jest.spyOn(source, 'onSoftError');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onSoftError).toHaveBeenNthCalledWith(1, error);
        expect(source.onSoftError).toHaveBeenCalledTimes(1);
      });

      it(`doesn't execute onSoftError(error) if error that rejects`, () => {
        const source = requiredErrorSource;
        jest.spyOn(source, 'onSoftError');
        jest.useFakeTimers();
        loader.loadSubmodule(source).catch(() => null);
        jest.runAllTimers();
        expect(source.onSoftError).not.toHaveBeenCalled();
      });

      it(`doesn't execute onSoftError(error) if no error`, () => {
        const source = new Source1();
        jest.spyOn(source, 'onSoftError');
        jest.useFakeTimers();
        loader.loadSubmodule(source);
        jest.runAllTimers();
        expect(source.onSoftError).not.toHaveBeenCalled();
      });
    });
  });

  describe('examples of use', () => {
    it(`completes after error`, () => {
      jest.spyOn(service, 'merge');
      jest.spyOn<any, any>(loader, 'onError').mockImplementation((index: number) => loader['onDestroySources'](index));
      jest.useFakeTimers();
      (loader as unknown)['sources'] = [requiredOrderedSource1, requiredOrderedErrorSource, requiredOrderedSource2];
      loader.load().catch(() => null);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(5);
      expect(loader['onError']).toHaveBeenCalled();
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });
  });
});
