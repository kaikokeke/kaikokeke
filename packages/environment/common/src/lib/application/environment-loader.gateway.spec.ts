import { delayThrow } from '@kaikokeke/common';
import { BehaviorSubject, interval, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentLoader } from './environment-loader.gateway';
import { EnvironmentService } from './environment-service.gateway';
import { EnvironmentStore } from './environment-store.gateway';
import { propertiesSourceFactory } from './properties-source-factory.function';
import { PropertiesSource } from './properties-source.gateway';

class TestStore extends EnvironmentStore {
  getAll$(): Observable<Properties> {
    throw new Error('Method not implemented.');
  }
  getAll(): Properties {
    throw new Error('Method not implemented.');
  }
  update(properties: Properties): void {
    throw new Error('Method not implemented.');
  }
  reset(): void {
    throw new Error('Method not implemented.');
  }
}

class TestEnvironmentService extends EnvironmentService {
  constructor(protected store: EnvironmentStore) {
    super(store);
  }
}

class TestLoader extends EnvironmentLoader {
  onLoad$: ReplaySubject<void> = new ReplaySubject();
  onCompleteSourcesLoad$: ReplaySubject<void> = new ReplaySubject();
  onRequiredToLoad$: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set());
  loaderSources = propertiesSourceFactory(this.sources);
  constructor(protected service: EnvironmentService) {
    super(service, []);
  }
}

class ObservableSource extends PropertiesSource {
  load(): Observable<Properties> {
    return of({ observable: 0 }).pipe(delay(5));
  }
}

const observableSource = propertiesSourceFactory(new ObservableSource());

const observableOrderedSource = propertiesSourceFactory(new ObservableSource());
observableOrderedSource[0].loadInOrder = true;

const observableRequiredOrderedSource = propertiesSourceFactory(new ObservableSource());
observableRequiredOrderedSource[0].requiredToLoad = true;
observableRequiredOrderedSource[0].loadInOrder = true;

const observableRequiredOrderedSource2 = propertiesSourceFactory(new ObservableSource());
observableRequiredOrderedSource2[0].requiredToLoad = true;
observableRequiredOrderedSource2[0].loadInOrder = true;

const observableMergeSource = propertiesSourceFactory(new ObservableSource());
observableMergeSource[0].mergeProperties = true;

const observablePathSource = propertiesSourceFactory(new ObservableSource());
observablePathSource[0].path = 'a.a';

const observableMergePathSource = propertiesSourceFactory(new ObservableSource());
observableMergePathSource[0].mergeProperties = true;
observableMergePathSource[0].path = 'a.a';

class PromiseSource extends PropertiesSource {
  async load(): Promise<Properties> {
    return Promise.resolve({ promise: 0 });
  }
}

const promiseSource = propertiesSourceFactory(new PromiseSource());

class ArraySource extends PropertiesSource {
  load(): Properties[] {
    return [{ array: 0 }];
  }
}

const arraySource = propertiesSourceFactory(new ArraySource());

class InfiniteSource extends PropertiesSource {
  load(): Observable<Properties> {
    return interval(5).pipe(map((n) => ({ infinite: n })));
  }
}

const infiniteSource = propertiesSourceFactory(new InfiniteSource());

const infiniteRequiredOrderedSource = propertiesSourceFactory(new InfiniteSource());
infiniteRequiredOrderedSource[0].name = 'InfiniteRequiredOrderedSource';
infiniteRequiredOrderedSource[0].requiredToLoad = true;
infiniteRequiredOrderedSource[0].loadInOrder = true;

class MultipleSource extends PropertiesSource {
  load(): Observable<Properties> {
    return interval(5).pipe(
      map((n) => ({ multiple: n })),
      take(3),
    );
  }
}

const multipleSource = propertiesSourceFactory(new MultipleSource());

const multipleRequiredOrderedSource = propertiesSourceFactory(new MultipleSource());
multipleRequiredOrderedSource[0].name = 'MultipleRequiredOrderedSource';
multipleRequiredOrderedSource[0].requiredToLoad = true;
multipleRequiredOrderedSource[0].loadInOrder = true;

class MultipleArraySource extends PropertiesSource {
  load(): Properties[] {
    return [{ a: 0 }, { b: 0 }, { c: 0 }];
  }
}

const multipleArrayRequiredSource = propertiesSourceFactory(new MultipleArraySource());
multipleArrayRequiredSource[0].requiredToLoad = true;

class ErrorSource extends PropertiesSource {
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delayThrow(5));
  }
}

const errorSource = propertiesSourceFactory(new ErrorSource());

const errorRequiredSource = propertiesSourceFactory(new ErrorSource());
errorRequiredSource[0].name = 'ErrorRequiredSource';
errorRequiredSource[0].requiredToLoad = true;

const errorOrderedSource = propertiesSourceFactory(new ErrorSource());
errorOrderedSource[0].name = 'ErrorOrderedSource';
errorOrderedSource[0].loadInOrder = true;

const errorRequiredOrderedSource = propertiesSourceFactory(new ErrorSource());
errorRequiredOrderedSource[0].name = 'ErrorRequiredOrderedSource';
errorRequiredOrderedSource[0].requiredToLoad = true;
errorRequiredOrderedSource[0].loadInOrder = true;

const errorIgnoreRequiredSource = propertiesSourceFactory(new ErrorSource());
errorIgnoreRequiredSource[0].ignoreError = true;
errorIgnoreRequiredSource[0].requiredToLoad = true;

class ErrorWithMessageSource extends PropertiesSource {
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delayThrow(5));
  }
}

const errorWithMessageSource = propertiesSourceFactory(new ErrorWithMessageSource());

class MultipleWithErrorSource extends PropertiesSource {
  load(): Observable<Properties> {
    return interval(5).pipe(
      map((n) => {
        if (n === 1) {
          throw new Error();
        }
        return { multiple: n };
      }),
      take(3),
    );
  }
}

const multipleWithErrorSource = propertiesSourceFactory(new MultipleWithErrorSource());

const multipleWithErrorOrderedSource = propertiesSourceFactory(new MultipleWithErrorSource());
multipleWithErrorOrderedSource[0].loadInOrder = true;

describe('EnvironmentLoader', () => {
  let service: EnvironmentService;
  let loader: TestLoader;

  beforeEach(() => {
    service = new TestEnvironmentService(new TestStore());
    loader = new TestLoader(service);
    jest.spyOn(service, 'add').mockImplementation(() => null);
    jest.spyOn(service, 'merge').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('load()', () => {
    it(`returns resolved Promise if no sources`, async () => {
      loader.loaderSources = [];
      await expect(loader.load()).toResolve();
    });

    it(`returns resolved Promise on sources load`, async () => {
      loader.loaderSources = observableSource;
      await expect(loader.load()).toResolve();
    });

    it(`returns resolved Promise on source error`, async () => {
      loader.loaderSources = errorSource;
      await expect(loader.load()).toResolve();
    });

    it(`returns rejected Promise on requiredToLoad source error`, async () => {
      loader.loaderSources = errorRequiredSource;
      await expect(loader.load()).rejects.toThrowError(
        'The Environment PropertiesSource "ErrorRequiredSource" failed to load',
      );
    });
  });

  describe('resolveLoad()', () => {
    const resolveSources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    beforeEach(() => {
      loader['onAfterSourceComplete'] = () => loader.resolveLoad();
    });

    afterEach(() => {
      loader['onAfterSourceComplete'] = undefined;
    });

    it(`forces the load to resolve`, async () => {
      loader.loaderSources = resolveSources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toResolve();
      expect(service.add).toHaveBeenCalledTimes(1);
    });

    it(`continues loading sources`, () => {
      jest.useFakeTimers();
      loader.loaderSources = resolveSources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('completeSourcesLoad()', () => {
    const completeSources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    beforeEach(() => {
      loader['onAfterSourceComplete'] = () => loader.completeSourcesLoad();
    });

    afterEach(() => {
      loader['onAfterSourceComplete'] = undefined;
    });

    it(`forces the load to resolve`, async () => {
      loader.loaderSources = completeSources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toResolve();
      expect(service.add).toHaveBeenCalledTimes(1);
    });

    it(`stops all ongoing source loads`, () => {
      jest.useFakeTimers();
      loader.loaderSources = completeSources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDestroy()', () => {
    const onDestroySources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    it(`forces the load to resolve`, async () => {
      loader['onAfterSourceComplete'] = () => loader.onDestroy();
      loader.loaderSources = onDestroySources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toResolve();
      expect(service.add).toHaveBeenCalledTimes(1);
      loader['onAfterSourceComplete'] = undefined;
    });

    it(`stops all ongoing source loads`, () => {
      loader['onAfterSourceComplete'] = () => loader.onDestroy();
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenCalledTimes(1);
      loader['onAfterSourceComplete'] = undefined;
    });

    it(`completes the load subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader.onLoad$.isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader.onLoad$.isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader.onLoad$.isStopped).toBeTrue();
    });

    it(`completes the complete sources subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader.onCompleteSourcesLoad$.isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader.onCompleteSourcesLoad$.isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader.onCompleteSourcesLoad$.isStopped).toBeTrue();
    });

    it(`completes the required to load subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader['onRequiredToLoad$'].isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader['onRequiredToLoad$'].isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader['onRequiredToLoad$'].isStopped).toBeTrue();
    });
  });

  describe('PropertiesSource', () => {
    describe('.requiredToLoad', () => {
      it(`returns resolved Promise immedialely if no requiredToLoad`, async () => {
        loader.loaderSources = observableSource;
        await loader.load().then(() => expect(service.add).not.toHaveBeenCalled());
      });

      it(`returns resolved Promise after all requiredToLoad completes`, async () => {
        loader.loaderSources = [
          ...observableRequiredOrderedSource,
          ...observableRequiredOrderedSource2,
          ...observableOrderedSource,
        ];
        await loader.load().then(() => {
          expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenCalledTimes(2);
        });
      });

      it(`returns resolved Promise after multiple emits requiredToLoad completes`, async () => {
        loader.loaderSources = [
          ...observableRequiredOrderedSource,
          ...multipleRequiredOrderedSource,
          ...observableRequiredOrderedSource2,
          ...observableOrderedSource,
        ];
        await loader.load().then(() => {
          expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(2, { multiple: 0 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(3, { multiple: 1 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(4, { multiple: 2 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(5, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenCalledTimes(5);
        });
      });

      it(`doesn't return if infinite requiredToLoad source`, async () => {
        loader.loaderSources = infiniteRequiredOrderedSource;
        let index = 0;
        loader['onAfterSourceEmit'] = () => {
          if (index === 9) {
            loader.resolveLoad();
          } else {
            index++;
          }
        };
        await loader.load().then(() => expect(service.add).toHaveBeenCalledTimes(10));
        loader['onAfterSourceEmit'] = undefined;
      });

      it(`returns resolved Promise after load error`, async () => {
        loader.loaderSources = [
          ...observableRequiredOrderedSource,
          ...errorOrderedSource,
          ...observableRequiredOrderedSource2,
        ];
        await loader.load().then(() => {
          expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenCalledTimes(2);
        });
      });

      it(`returns rejected Promise after requiredToLoad load error`, async () => {
        loader.loaderSources = [
          ...observableRequiredOrderedSource,
          ...errorRequiredOrderedSource,
          ...observableRequiredOrderedSource2,
        ];
        const error = new Error('The Environment PropertiesSource "ErrorRequiredOrderedSource" failed to load');
        await loader.load().catch((err) => {
          expect(err).toEqual(error);
          expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
          expect(service.add).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('.loadInOrder', () => {
      it(`adds properties all at once if no loadInOrder sources`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [...observableSource, ...multipleSource, ...arraySource];
        loader.load();
        expect(service.add).toHaveBeenNthCalledWith(1, { array: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenNthCalledWith(3, { multiple: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(3);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(4, { multiple: 1 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(4);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(5, { multiple: 2 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(5);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(5);
      });

      it(`adds properties in order if loadInOrder and all completes`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [...observableRequiredOrderedSource, ...observableOrderedSource];
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(2);
      });

      it(`adds properties in order if loadInOrder waiting for multiple emit completes`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [
          ...observableRequiredOrderedSource,
          ...multipleRequiredOrderedSource,
          ...observableOrderedSource,
        ];
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { multiple: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(3, { multiple: 1 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(3);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(4, { multiple: 2 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(4);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(5, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(5);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(5);
      });

      it(`adds properties in order if loadInOrder and source never completes, but never load the next ordered source`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [...infiniteRequiredOrderedSource, ...observableOrderedSource];
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { infinite: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { infinite: 1 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(100);
        expect(service.add).toHaveBeenCalledTimes(22);
        expect(service.add).not.toHaveBeenCalledWith({ observable: 0 }, undefined);
      });

      it(`adds properties mixing loadInOrder and no loadInOrder sources`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [
          ...multipleRequiredOrderedSource,
          ...observableOrderedSource,
          ...observableSource,
          ...arraySource,
        ];
        loader.load();
        expect(service.add).toHaveBeenNthCalledWith(1, { array: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenNthCalledWith(3, { multiple: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(3);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(4, { multiple: 1 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(4);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(5, { multiple: 2 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(5);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(6, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(6);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(6);
      });

      it(`adds properties in order ignoring errors`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [...errorOrderedSource, ...observableOrderedSource];
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`adds properties in order ignoring errors and completing multiple sources on error`, () => {
        jest.useFakeTimers();
        loader.loaderSources = [...multipleWithErrorOrderedSource, ...errorOrderedSource, ...observableOrderedSource];
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { multiple: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(2);
      });
    });

    describe('.mergeProperties', () => {
      it(`adds properties if no mergeProperties source`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observableSource;
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`merges properties if mergeProperties source`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observableMergeSource;
        loader.load();
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    describe('.ignoreError', () => {
      it(`returns rejected Promise if requiredToLoad source error and no ignoreError`, async () => {
        loader.loaderSources = errorRequiredSource;
        await expect(loader.load()).toReject();
      });

      it(`returns resolved Promise if requiredToLoad source error and ignoreError`, async () => {
        loader.loaderSources = errorIgnoreRequiredSource;
        await expect(loader.load()).toResolve();
      });
    });

    describe('.path', () => {
      it(`adds properties without path`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observableSource;
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`adds properties with path`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observablePathSource;
        loader.load();
        expect(service.add).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, 'a.a');
        expect(service.add).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`merges properties with mergeProperties and no path`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observableMergeSource;
        loader.load();
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(1);
      });

      it(`merges properties with mergeProperties and path`, () => {
        jest.useFakeTimers();
        loader.loaderSources = observableMergePathSource;
        loader.load();
        expect(service.merge).not.toHaveBeenCalled();
        jest.advanceTimersByTime(5);
        expect(service.merge).toHaveBeenNthCalledWith(1, { observable: 0 }, 'a.a');
        expect(service.merge).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    describe('.load()', () => {
      it(`returns resolved Promise from Observable`, async () => {
        loader.loaderSources = observableRequiredOrderedSource;
        await expect(loader.load()).toResolve();
        expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise from Promise`, async () => {
        loader.loaderSources = promiseSource;
        await expect(loader.load()).toResolve();
        expect(service.add).toHaveBeenNthCalledWith(1, { promise: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise from Array`, async () => {
        loader.loaderSources = arraySource;
        await expect(loader.load()).toResolve();
        expect(service.add).toHaveBeenNthCalledWith(1, { array: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(1);
      });

      it(`returns resolved Promise from multiple Array`, async () => {
        loader.loaderSources = multipleArrayRequiredSource;
        await expect(loader.load()).toResolve();
        expect(service.add).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
        expect(service.add).toHaveBeenNthCalledWith(2, { b: 0 }, undefined);
        expect(service.add).toHaveBeenNthCalledWith(3, { c: 0 }, undefined);
        expect(service.add).toHaveBeenCalledTimes(3);
      });
    });
  });

  //     it(`returns rejected Promise without error message`, async () => {
  //       const error = new Error('The Environment PropertiesSource "ErrorSource" failed to load');
  //       await expect(loader.load('app', requiredErrorSource)).rejects.toEqual(error);
  //     });

  //     it(`returns rejected Promise with error message`, async () => {
  //       const error = new Error('The Environment PropertiesSource "ErrorMessageSource" failed to load: error');
  //       await expect(loader.load('app', requiredErrorMessageSource)).rejects.toEqual(error);
  //     });
  //   });

  // Test lifecycle order
  // Test lifecycle with source with multiple emits
  // Test lifecycle with source with infinite emits
  // Test lifecycle with error
  // Test lifecycle with source with multiple errors
  // Test lifecycle with source with infinite errors

  //   // describe('lifecycle hooks', () => {
  //   //   describe('OnBeforeSourceLoad', () => {
  //   //     it(`execute onBeforeSourceLoad(properties) if exists before source load`, () => {
  //   //       const source = new Source1();
  //   //       source['onBeforeSourceLoad'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onBeforeSourceLoad');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source);
  //   //       jest.runAllTimers();
  //   //       expect(source['onBeforeSourceLoad']).toHaveBeenNthCalledWith(1, { a: 0 });
  //   //       expect(source['onBeforeSourceLoad']).toHaveBeenCalledTimes(1);
  //   //       source['onBeforeSourceLoad'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onBeforeSourceLoad(properties) if exists and error`, () => {
  //   //       const source = new ErrorSource();
  //   //       source['onBeforeSourceLoad'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onBeforeSourceLoad');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onBeforeSourceLoad']).not.toHaveBeenCalled();
  //   //       source['onBeforeSourceLoad'] = undefined;
  //   //     });
  //   //   });

  //   //   describe('OnAfterSourceLoad', () => {
  //   //     it(`execute onAfterSourceLoad(properties) if exists after source load`, () => {
  //   //       const source = new Source1();
  //   //       source['onAfterSourceLoad'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceLoad');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceLoad']).toHaveBeenNthCalledWith(1, { a: 0 });
  //   //       expect(source['onAfterSourceLoad']).toHaveBeenCalledTimes(1);
  //   //       source['onAfterSourceLoad'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onAfterSourceLoad(properties) if exists and error`, () => {
  //   //       const source = new ErrorSource();
  //   //       source['onAfterSourceLoad'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceLoad');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceLoad']).not.toHaveBeenCalled();
  //   //       source['onAfterSourceLoad'] = undefined;
  //   //     });
  //   //   });

  //   //   describe('OnAfterSourceError', () => {
  //   //     it(`execute onAfterSourceError(error) if exists after source error that rejects`, () => {
  //   //       const error = new Error('The Environment PropertiesSource "ErrorSource" failed to load');
  //   //       const source = requiredErrorSource;
  //   //       source['onAfterSourceError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceError']).toHaveBeenNthCalledWith(1, error);
  //   //       expect(source['onAfterSourceError']).toHaveBeenCalledTimes(1);
  //   //       source['onAfterSourceError'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onAfterSourceError(error) if exists and error that doesn't reject`, () => {
  //   //       const source = new ErrorSource();
  //   //       source['onAfterSourceError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceError']).not.toHaveBeenCalled();
  //   //       source['onAfterSourceError'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onAfterSourceError(error) if exists and no error`, () => {
  //   //       const source = new Source1();
  //   //       source['onAfterSourceError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceError']).not.toHaveBeenCalled();
  //   //       source['onAfterSourceError'] = undefined;
  //   //     });
  //   //   });

  //   //   describe('OnAfterSourceSoftError', () => {
  //   //     it(`execute onAfterSourceSoftError(error) if exists after source error that doesn't reject`, () => {
  //   //       const error = new Error('The Environment PropertiesSource "ErrorSource" failed to load');
  //   //       const source = new ErrorSource();
  //   //       source['onAfterSourceSoftError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceSoftError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceSoftError']).toHaveBeenNthCalledWith(1, error);
  //   //       expect(source['onAfterSourceSoftError']).toHaveBeenCalledTimes(1);
  //   //       source['onAfterSourceSoftError'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onAfterSourceSoftError(error) if exists and error that rejects`, () => {
  //   //       const source = requiredErrorSource;
  //   //       source['onAfterSourceSoftError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceSoftError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source).catch(() => null);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceSoftError']).not.toHaveBeenCalled();
  //   //       source['onAfterSourceSoftError'] = undefined;
  //   //     });

  //   //     it(`doesn't execute onAfterSourceSoftError(error) if exists and no error`, () => {
  //   //       const source = new Source1();
  //   //       source['onAfterSourceSoftError'] = () => null;
  //   //       jest.spyOn<any, any>(source, 'onAfterSourceSoftError');
  //   //       jest.useFakeTimers();
  //   //       loader.loadSubmodule('app', source);
  //   //       jest.runAllTimers();
  //   //       expect(source['onAfterSourceSoftError']).not.toHaveBeenCalled();
  //   //       source['onAfterSourceSoftError'] = undefined;
  //   //     });
  //   //   });
  //   // });
  // });

  // describe('examples of use', () => {
  //   // it(`completes after error`, () => {
  //   //   jest.spyOn(service, 'add');
  //   //   loader['onAfterLoadError'] = () => null;
  //   //   jest
  //   //     .spyOn<any, any>(loader, 'onAfterLoadError')
  //   //     .mockImplementation((index: number) => loader['onDestroySources'](index));
  //   //   jest.useFakeTimers();
  //   //   (loader as unknown)['sources'] = [requiredOrderedSource1, requiredOrderedErrorSource, requiredOrderedSource2];
  //   //   loader['load']().catch(() => null);
  //   //   expect(service.merge).not.toHaveBeenCalled();
  //   //   jest.runAllTimers();
  //   //   expect(loader['onAfterLoadError']).toHaveBeenCalled();
  //   //   expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
  //   //   expect(service.merge).toHaveBeenCalledTimes(1);
  //   //   loader['onAfterLoadError'] = undefined;
  //   // });
  // });

  // describe('lifecycle hooks', () => {
  //   // no sources

  //   describe('OnBeforeLoad', () => {
  //     it(`execute onBeforeLoad(index, name) if no sources`, () => {
  //       loader['onBeforeLoad'] = () => null;
  //       jest.spyOn<any, any>(loader, 'onBeforeLoad');
  //       jest.useFakeTimers();
  //       loader.loadSubmodule('app', []);
  //       jest.runAllTimers();
  //       expect(loader['onBeforeLoad']).toHaveBeenNthCalledWith(1, 0, 'app');
  //       expect(loader['onBeforeLoad']).toHaveBeenCalledTimes(1);
  //       loader['onBeforeLoad'] = undefined;
  //     });
  //   });

  //   describe('OnAfterLoad', () => {
  //     it(`execute onAfterLoad(index, name) if no sources`, () => {
  //       loader['onAfterLoad'] = () => null;
  //       jest.spyOn<any, any>(loader, 'onAfterLoad');
  //       jest.useFakeTimers();
  //       loader.loadSubmodule('app', []);
  //       jest.runAllTimers();
  //       expect(loader['onAfterLoad']).toHaveBeenNthCalledWith(1, 0, 'app');
  //       expect(loader['onAfterLoad']).toHaveBeenCalledTimes(1);
  //       loader['onAfterLoad'] = undefined;
  //     });
  //   });

  //   describe('OnAfterLoadError', () => {
  //     it(`doesn't execute onAfterLoadError(index, name, error) if no sources`, () => {
  //       loader['onAfterLoadError'] = () => null;
  //       jest.spyOn<any, any>(loader, 'onAfterLoadError');
  //       jest.useFakeTimers();
  //       loader.loadSubmodule('app', []);
  //       jest.runAllTimers();
  //       expect(loader['onAfterLoadError']).not.toHaveBeenCalled();
  //       loader['onAfterLoadError'] = undefined;
  //     });
  //   });
  // });
});
