import { delayThrow } from '@kaikokeke/common';
import { omit } from 'lodash-es';
import { BehaviorSubject, interval, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { LoaderPropertiesSource, Properties } from '../types';
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
  loadSubject$: ReplaySubject<void> = new ReplaySubject();
  completeAllSubject$: ReplaySubject<void> = new ReplaySubject();
  requiredToLoadSubject$: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set());
  loaderSources: ReadonlyArray<LoaderPropertiesSource>;

  constructor(protected service: EnvironmentService, protected sources?: any) {
    super(service, sources);
  }

  onBeforeLoad() {}
  onAfterLoad() {}
  onAfterError() {}
  onAfterComplete() {}
  onBeforeSourceLoad() {}
  onBeforeSourceAdd() {}
  onAfterSourceAdd() {}
  onAfterSourceError() {}
  onAfterSourceComplete() {}
}

class ObservableSource extends PropertiesSource {
  name = 'ObservableSource';
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
  name = 'PromiseSource';
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
    return throwError('').pipe(delayThrow(5));
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

class ErrorMessageSource extends PropertiesSource {
  load(): Observable<Properties> {
    return throwError(111).pipe(delayThrow(5));
  }
}

const errorMessageRequiredOrderedSource = propertiesSourceFactory(new ErrorMessageSource());
errorMessageRequiredOrderedSource[0].name = 'ErrorMessageRequiredOrderedSource';
errorMessageRequiredOrderedSource[0].requiredToLoad = true;
errorMessageRequiredOrderedSource[0].loadInOrder = true;

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
    jest.spyOn(loader, 'onBeforeLoad').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterLoad').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterError').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterComplete').mockImplementation(() => null);
    jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => null);
    jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => null);
    jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => null);
  });

  afterEach(() => {
    loader = null;
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it(`.loaderSources is set on constructor`, async () => {
    loader = new TestLoader(service, [new ObservableSource(), new PromiseSource()]);
    const source0 = observableSource[0];
    const source1 = promiseSource[0];
    expect(loader.loaderSources).toBeArrayOfSize(2);
    expect(loader.loaderSources[0]).toEqual(expect.objectContaining(omit(source0, 'id')));
    expect(loader.loaderSources[1]).toEqual(expect.objectContaining(omit(source1, 'id')));
    await expect(loader.load()).toResolve();
  });

  it(`.sourcesSubject$ is set on constructor`, async () => {
    loader = new TestLoader(service, [new ObservableSource(), new PromiseSource()]);
    const source0 = loader.loaderSources[0];
    const source1 = loader.loaderSources[1];
    expect(loader['sourcesSubject$'].size).toEqual(2);
    expect([...loader['sourcesSubject$'].keys()]).toEqual([source0.id, source1.id]);
    await expect(loader.load()).toResolve();
  });

  describe('.load()', () => {
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

    it(`returns rejected Promise with message on requiredToLoad source error`, async () => {
      loader.loaderSources = errorMessageRequiredOrderedSource;
      await expect(loader.load()).rejects.toThrowError(
        'The Environment PropertiesSource "ErrorMessageRequiredOrderedSource" failed to load: 111',
      );
    });
  });

  describe('.resolveLoad()', () => {
    const resolveSources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    beforeEach(() => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.resolveLoad());
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

  describe('.rejectLoad()', () => {
    const resolveSources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    beforeEach(() => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.rejectLoad(''));
    });

    it(`forces the load to reject`, async () => {
      loader.loaderSources = resolveSources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toReject();
      expect(service.add).toHaveBeenCalledTimes(1);
    });

    it(`continues loading sources`, () => {
      jest.useFakeTimers();
      loader.loaderSources = resolveSources;
      loader.load().catch(() => null);
      jest.runAllTimers();
      expect(service.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('.completeAllSources()', () => {
    const completeSources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    beforeEach(() => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.completeAllSources());
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

  describe('.completeSource(id)', () => {
    const completeSources = [
      ...observableRequiredOrderedSource,
      ...multipleRequiredOrderedSource,
      ...observableRequiredOrderedSource2,
    ];

    it(`forces the load to resolve`, async () => {
      jest
        .spyOn(loader, 'onAfterSourceComplete')
        .mockImplementation(() => loader.completeSource(multipleRequiredOrderedSource[0].id));
      loader.loaderSources = completeSources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toResolve();
      expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenCalledTimes(2);
    });

    it(`stops the source load`, () => {
      jest
        .spyOn(loader, 'onAfterSourceComplete')
        .mockImplementation(() => loader.completeSource(multipleRequiredOrderedSource[0].id));
      jest.useFakeTimers();
      loader.loaderSources = completeSources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenCalledTimes(2);
    });

    it(`does nothing if the id doesn't exist`, () => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.completeSource(''));
      jest.useFakeTimers();
      loader.loaderSources = completeSources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(2, { multiple: 0 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(3, { multiple: 1 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(4, { multiple: 2 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(5, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenCalledTimes(5);
    });

    it(`doesn't throw error if source subject is not setted`, () => {
      const id = multipleRequiredOrderedSource[0].id;
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.completeSource(id));
      jest.useFakeTimers();
      loader.loaderSources = completeSources;
      (loader as any)['sourcesSubject$'] = new Map();
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenNthCalledWith(2, { observable: 0 }, undefined);
      expect(service.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('.onDestroy()', () => {
    const onDestroySources = [...observableRequiredOrderedSource, ...observableRequiredOrderedSource2];

    it(`forces the load to resolve`, async () => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.onDestroy());
      loader.loaderSources = onDestroySources;
      expect(service.add).not.toHaveBeenCalled();
      await expect(loader.load()).toResolve();
      expect(service.add).toHaveBeenCalledTimes(1);
    });

    it(`stops all ongoing source loads`, () => {
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => loader.onDestroy());
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      jest.runAllTimers();
      expect(service.add).toHaveBeenCalledTimes(1);
    });

    it(`completes the load subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader.loadSubject$.isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader.loadSubject$.isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader.loadSubject$.isStopped).toBeTrue();
    });

    it(`completes the complete sources subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader.completeAllSubject$.isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader.completeAllSubject$.isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader.completeAllSubject$.isStopped).toBeTrue();
    });

    it(`completes the required to load subject`, () => {
      jest.useFakeTimers();
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader['requiredToLoadSubject$'].isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader['requiredToLoadSubject$'].isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader['requiredToLoadSubject$'].isStopped).toBeTrue();
    });

    it(`completes the sources subjects`, () => {
      jest.useFakeTimers();
      const id1 = observableRequiredOrderedSource[0].id;
      const id2 = observableRequiredOrderedSource2[0].id;
      loader.loaderSources = onDestroySources;
      loader.load();
      expect(loader['sourcesSubject$'].get(id1).isStopped).toBeFalse();
      expect(loader['sourcesSubject$'].get(id2).isStopped).toBeFalse();
      jest.advanceTimersByTime(5);
      expect(loader['sourcesSubject$'].get(id1).isStopped).toBeFalse();
      expect(loader['sourcesSubject$'].get(id2).isStopped).toBeFalse();
      loader.onDestroy();
      expect(loader['sourcesSubject$'].get(id1).isStopped).toBeTrue();
      expect(loader['sourcesSubject$'].get(id2).isStopped).toBeTrue();
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
        loader['onAfterSourceAdd'] = () => {
          if (index === 9) {
            loader.resolveLoad();
          } else {
            index++;
          }
        };
        await loader.load().then(() => expect(service.add).toHaveBeenCalledTimes(10));
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
        expect(service.add).toHaveBeenCalledWith({ observable: 0 }, undefined);
        expect(service.add).toHaveBeenCalledWith({ multiple: 0 }, undefined);
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

  describe('Middleware', () => {
    it(`preAddProperties(properties, source) is called with properties and source`, async () => {
      jest.spyOn(loader, 'preAddProperties').mockImplementation((p) => p);
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.preAddProperties).toHaveBeenNthCalledWith(1, { observable: 0 }, loader.loaderSources[0]);
      expect(service.add).toHaveBeenNthCalledWith(1, { observable: 0 }, undefined);
    });

    it(`preAddProperties(properties, source) modifies the properties`, async () => {
      jest.spyOn(loader, 'preAddProperties').mockImplementation(() => ({ middleware: 0 }));
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.preAddProperties).toHaveBeenNthCalledWith(1, { observable: 0 }, loader.loaderSources[0]);
      expect(service.add).toHaveBeenNthCalledWith(1, { middleware: 0 }, undefined);
    });
  });

  describe('Lifecycle Hooks', () => {
    it(`executes load lifecycle hooks in order if no error`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeLoad').mockImplementation(() => console.log('onBeforeLoad'));
      jest.spyOn(loader, 'onAfterComplete').mockImplementation(() => console.log('onAfterComplete'));
      jest.spyOn(loader, 'onAfterLoad').mockImplementation(() => console.log('onAfterLoad'));
      jest.spyOn(loader, 'onAfterError').mockImplementation(() => console.log('onAfterError'));
      await expect(loader.load()).toResolve();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onAfterComplete');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterLoad');
      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it(`executes load lifecycle hooks in order if error`, async () => {
      loader.loaderSources = errorRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeLoad').mockImplementation(() => console.log('onBeforeLoad'));
      jest.spyOn(loader, 'onAfterComplete').mockImplementation(() => console.log('onAfterComplete'));
      jest.spyOn(loader, 'onAfterLoad').mockImplementation(() => console.log('onAfterLoad'));
      jest.spyOn(loader, 'onAfterError').mockImplementation(() => console.log('onAfterError'));
      await expect(loader.load()).toReject();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onAfterComplete');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterError');
      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it(`executes source lifecycle hooks in order if no error`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => console.log('onBeforeSourceLoad'));
      jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => console.log('onBeforeSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => console.log('onAfterSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => console.log('onAfterSourceError'));
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => console.log('onAfterSourceComplete'));
      await expect(loader.load()).toResolve();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeSourceLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onBeforeSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(4, 'onAfterSourceComplete');
      expect(console.log).toHaveBeenCalledTimes(4);
    });

    it(`executes multiple source lifecycle hooks in order if no error`, async () => {
      loader.loaderSources = multipleRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => console.log('onBeforeSourceLoad'));
      jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => console.log('onBeforeSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => console.log('onAfterSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => console.log('onAfterSourceError'));
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => console.log('onAfterSourceComplete'));
      await expect(loader.load()).toResolve();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeSourceLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onBeforeSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(4, 'onBeforeSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(5, 'onAfterSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(6, 'onBeforeSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(7, 'onAfterSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(8, 'onAfterSourceComplete');
      expect(console.log).toHaveBeenCalledTimes(8);
    });

    it(`executes source lifecycle hooks in order if error`, async () => {
      loader.loaderSources = errorRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => console.log('onBeforeSourceLoad'));
      jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => console.log('onBeforeSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => console.log('onAfterSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => console.log('onAfterSourceError'));
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => console.log('onAfterSourceComplete'));
      await expect(loader.load()).toReject();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeSourceLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onAfterSourceError');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterSourceComplete');
      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it(`executes full lifecycle hooks in order if no error`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeLoad').mockImplementation(() => console.log('onBeforeLoad'));
      jest.spyOn(loader, 'onAfterComplete').mockImplementation(() => console.log('onAfterComplete'));
      jest.spyOn(loader, 'onAfterLoad').mockImplementation(() => console.log('onAfterLoad'));
      jest.spyOn(loader, 'onAfterError').mockImplementation(() => console.log('onAfterError'));
      jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => console.log('onBeforeSourceLoad'));
      jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => console.log('onBeforeSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => console.log('onAfterSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => console.log('onAfterSourceError'));
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => console.log('onAfterSourceComplete'));
      await expect(loader.load()).toResolve();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onBeforeSourceLoad');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onBeforeSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(4, 'onAfterSourceAdd');
      expect(console.log).toHaveBeenNthCalledWith(5, 'onAfterComplete');
      expect(console.log).toHaveBeenNthCalledWith(6, 'onAfterSourceComplete');
      expect(console.log).toHaveBeenNthCalledWith(7, 'onAfterLoad');
      expect(console.log).toHaveBeenCalledTimes(7);
    });

    it(`executes full lifecycle hooks in order if error`, async () => {
      loader.loaderSources = errorRequiredOrderedSource;
      jest.spyOn(console, 'log').mockImplementation(() => null);
      jest.spyOn(loader, 'onBeforeLoad').mockImplementation(() => console.log('onBeforeLoad'));
      jest.spyOn(loader, 'onAfterComplete').mockImplementation(() => console.log('onAfterComplete'));
      jest.spyOn(loader, 'onAfterLoad').mockImplementation(() => console.log('onAfterLoad'));
      jest.spyOn(loader, 'onAfterError').mockImplementation(() => console.log('onAfterError'));
      jest.spyOn(loader, 'onBeforeSourceLoad').mockImplementation(() => console.log('onBeforeSourceLoad'));
      jest.spyOn(loader, 'onBeforeSourceAdd').mockImplementation(() => console.log('onBeforeSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceAdd').mockImplementation(() => console.log('onAfterSourceAdd'));
      jest.spyOn(loader, 'onAfterSourceError').mockImplementation(() => console.log('onAfterSourceError'));
      jest.spyOn(loader, 'onAfterSourceComplete').mockImplementation(() => console.log('onAfterSourceComplete'));
      await expect(loader.load()).toReject();
      expect(console.log).toHaveBeenNthCalledWith(1, 'onBeforeLoad');
      expect(console.log).toHaveBeenNthCalledWith(2, 'onBeforeSourceLoad');
      expect(console.log).toHaveBeenNthCalledWith(3, 'onAfterSourceError');
      expect(console.log).toHaveBeenNthCalledWith(4, 'onAfterComplete');
      expect(console.log).toHaveBeenNthCalledWith(5, 'onAfterSourceComplete');
      expect(console.log).toHaveBeenNthCalledWith(6, 'onAfterError');
      expect(console.log).toHaveBeenCalledTimes(6);
    });

    it(`onBeforeLoad() is called without args`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onBeforeLoad).toHaveBeenNthCalledWith(1);
    });

    it(`onAfterLoad() is called without args `, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onAfterLoad).toHaveBeenNthCalledWith(1);
    });

    it(`onAfterError(error) is called with error`, async () => {
      loader.loaderSources = errorRequiredOrderedSource;
      await expect(loader.load()).toReject();
      expect(loader.onAfterError).toHaveBeenNthCalledWith(
        1,
        new Error('The Environment PropertiesSource "ErrorRequiredOrderedSource" failed to load'),
      );
    });

    it(`onAfterComplete() is called without args `, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onAfterComplete).toHaveBeenNthCalledWith(1);
    });

    it(`onBeforeSourceLoad(source) is called with source`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onBeforeSourceLoad).toHaveBeenNthCalledWith(1, loader.loaderSources[0]);
    });

    it(`onBeforeSourceAdd(properties, source) is called with properties and source`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onBeforeSourceAdd).toHaveBeenNthCalledWith(1, { observable: 0 }, loader.loaderSources[0]);
    });

    it(`onAfterSourceAdd(properties, source) is called with properties and source`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onAfterSourceAdd).toHaveBeenNthCalledWith(1, { observable: 0 }, loader.loaderSources[0]);
    });

    it(`onAfterSourceError(error, source) is called with error and source`, async () => {
      loader.loaderSources = errorRequiredOrderedSource;
      await expect(loader.load()).toReject();
      expect(loader.onAfterSourceError).toHaveBeenNthCalledWith(
        1,
        new Error('The Environment PropertiesSource "ErrorRequiredOrderedSource" failed to load'),
        loader.loaderSources[0],
      );
    });

    it(`onAfterSourceComplete(source) is called with source`, async () => {
      loader.loaderSources = observableRequiredOrderedSource;
      await expect(loader.load()).toResolve();
      expect(loader.onAfterSourceComplete).toHaveBeenNthCalledWith(1, loader.loaderSources[0]);
    });
  });
});
