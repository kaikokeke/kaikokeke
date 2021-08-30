import { interval, Observable, of, throwError } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { Properties } from '../types';
import { EnvironmentLoaderGateway } from './environment-loader.gateway';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';
import { PropertiesSourceGateway } from './properties-source.gateway';

class TestStore extends EnvironmentStoreGateway {
  getAll$(): Observable<Properties> {
    return of({});
  }
  getAll(): Properties {
    return {};
  }
  update(properties: Properties): void {}
  reset(): void {}
}

class TestEnvironmentService extends EnvironmentServiceGateway {
  constructor(protected store: EnvironmentStoreGateway) {
    super(store);
  }
}

class TestLoaderService extends EnvironmentLoaderGateway {
  constructor(protected service: EnvironmentServiceGateway) {
    super(service, []);
  }
}

class RequiredOrderedSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ io: 0 }).pipe(delay(10));
  }
}

class RequiredOrderedSource2 extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ io2: 0 }).pipe(delay(10));
  }
}

class NoRequiredOrderedSource extends PropertiesSourceGateway {
  requiredToLoad = false;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ nio: 0 }).pipe(delay(10));
  }
}

class NoRequiredOrderedSource2 extends PropertiesSourceGateway {
  requiredToLoad = false;
  loadInOrder = true;
  load(): Observable<Properties> {
    return of({ nio2: 0 }).pipe(delay(10));
  }
}

class RequiredUnorderedSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = false;
  load(): Observable<Properties> {
    return of({ iu: 0 }).pipe(delay(10));
  }
}

class RequiredUnorderedSource2 extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = false;
  load(): Observable<Properties> {
    return of({ iu: 0 }).pipe(delay(10));
  }
}

class NoRequiredUnorderedSource extends PropertiesSourceGateway {
  requiredToLoad = false;
  loadInOrder = false;
  load(): Observable<Properties> {
    return of({ niu: 0 }).pipe(delay(10));
  }
}

class NoRequiredUnorderedSource2 extends PropertiesSourceGateway {
  requiredToLoad = false;
  loadInOrder = false;
  load(): Observable<Properties> {
    return of({ niu: 0 }).pipe(delay(10));
  }
}

class RequiredOrderedMultipleCompletesSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return interval(10).pipe(
      map((n) => ({ a: n })),
      take(3),
    );
  }
}

class LoadImmediatelySource extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = true;
  loadImmediately = true;
  load(): Observable<Properties> {
    return of({ li: 0 }).pipe(delay(10));
  }
}

class DismissOtherSourcesSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  loadInOrder = true;
  dismissOtherSources = true;
  load(): Observable<Properties> {
    return of({ dos: 0 }).pipe(delay(1));
  }
}

class MergeSource extends PropertiesSourceGateway {
  deepMergeValues = false;
  load(): Observable<Properties> {
    return of({ mv: 0 }).pipe(delay(10));
  }
}

class DeepMergeSource extends PropertiesSourceGateway {
  deepMergeValues = true;
  load(): Observable<Properties> {
    return of({ dmv: 0 }).pipe(delay(10));
  }
}

class PathMergeSource extends PropertiesSourceGateway {
  deepMergeValues = false;
  path = 'a';
  load(): Observable<Properties> {
    return of({ pmv: 0 }).pipe(delay(10));
  }
}

class PathDeepMergeSource extends PropertiesSourceGateway {
  deepMergeValues = true;
  path = 'a';
  load(): Observable<Properties> {
    return of({ pdmv: 0 }).pipe(delay(10));
  }
}

class ResetEnvironmentSource extends PropertiesSourceGateway {
  resetEnvironment = true;
  load(): Observable<Properties> {
    return of({ pdmv: 0 }).pipe(delay(10));
  }
}

class ErrorNoMessageSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  ignoreError = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error()).pipe(delay(10));
  }
}

class NoIgnoreRequiredErrorSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  ignoreError = false;
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class IgnoreRequiredErrorSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  ignoreError = true;
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class NoIgnoreNoRequiredErrorSource extends PropertiesSourceGateway {
  requiredToLoad = false;
  ignoreError = false;
  loadInOrder = true;
  load(): Observable<Properties> {
    return throwError(new Error('error')).pipe(delay(10));
  }
}

class PromiseSource extends PropertiesSourceGateway {
  requiredToLoad = true;
  async load(): Promise<Properties> {
    return Promise.resolve({ p: 0 });
  }
}

const orderedSources = [
  new RequiredOrderedSource(),
  new NoRequiredOrderedSource(),
  new RequiredOrderedSource2(),
  new NoRequiredOrderedSource2(),
];

const unorderedSources = [
  new RequiredUnorderedSource(),
  new NoRequiredUnorderedSource(),
  new RequiredUnorderedSource2(),
  new NoRequiredUnorderedSource2(),
];

const noRequiredSources = [new NoRequiredOrderedSource(), new NoRequiredOrderedSource2()];

const mixedOrderSources = [
  new RequiredOrderedSource(),
  new NoRequiredOrderedSource(),
  new RequiredUnorderedSource2(),
  new NoRequiredUnorderedSource2(),
];

const multipleSources = [new RequiredOrderedMultipleCompletesSource(), new RequiredOrderedSource()];

const loadImmediatellySources = [
  new RequiredOrderedSource(),
  new LoadImmediatelySource(),
  new RequiredOrderedSource2(),
];

const dismissOtherSourcesSources = [
  new DismissOtherSourcesSource(),
  new RequiredOrderedSource(),
  new NoRequiredUnorderedSource(),
  new RequiredOrderedSource2(),
];

const errorNoIgnoreRequired = [
  new RequiredOrderedSource(),
  new NoIgnoreRequiredErrorSource(),
  new RequiredOrderedSource2(),
];

const errorIgnoreRequired = [
  new RequiredOrderedSource(),
  new IgnoreRequiredErrorSource(),
  new RequiredOrderedSource2(),
];

const errorNoIgnoreNoRequired = [
  new RequiredOrderedSource(),
  new NoIgnoreNoRequiredErrorSource(),
  new RequiredOrderedSource2(),
];

describe('EnvironmentLoaderGateway', () => {
  let service: EnvironmentServiceGateway;
  let loader: EnvironmentLoaderGateway;

  beforeEach(() => {
    service = new TestEnvironmentService(new TestStore());
    loader = new TestLoaderService(service);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(service, 'merge');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('load()', () => {
    // no sources

    it(`returns resolved Promise immedialely if no sources`, () => {
      (loader as unknown)['sources'] = [];
      return loader.load().then(() => {
        expect(service.merge).not.toHaveBeenCalled();
      });
    });

    it(`loads nothing if no sources`, () => {
      (loader as unknown)['sources'] = [];
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    // PropertiesSourceGateway.requiredToLoad

    it(`returns resolved Promise when all sources with requiredToLoad loads`, () => {
      (loader as unknown)['sources'] = orderedSources;
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { nio: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(3, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
      });
    });

    it(`returns resolved Promise immedialely if no sources with requiredToLoad`, () => {
      (loader as unknown)['sources'] = noRequiredSources;
      return loader.load().then(() => {
        expect(service.merge).not.toHaveBeenCalled();
      });
    });

    it(`loads all sources ignoring requiredToLoad`, () => {
      (loader as unknown)['sources'] = mixedOrderSources;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    // PropertiesSourceGateway.loadInOrder

    it(`loads all sources in order if loadInOrder`, () => {
      (loader as unknown)['sources'] = orderedSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { nio: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { io2: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { nio2: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(4);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources at once if no loadInOrder`, () => {
      (loader as unknown)['sources'] = unorderedSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenCalledWith({ iu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ niu: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources mixing loadInOrder and no loadInOrder values`, () => {
      (loader as unknown)['sources'] = mixedOrderSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenCalledWith({ iu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ niu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ io: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { nio: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources with loadInOrder if one is multiple and completes`, () => {
      (loader as unknown)['sources'] = multipleSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { a: 1 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { a: 2 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { io: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    // PropertiesSourceGateway.loadImmediately

    it(`returns resolved Promise just after loadImmediately source load `, () => {
      (loader as unknown)['sources'] = loadImmediatellySources;
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { li: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`loads all sources if loadImmediately`, () => {
      (loader as unknown)['sources'] = loadImmediatellySources;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // PropertiesSourceGateway.dismissOtherSources

    it(`returns resolved Promise just after dismissOtherSources source load `, () => {
      (loader as unknown)['sources'] = dismissOtherSourcesSources;
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { dos: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    it(`loads sources until source with dismissOtherSources`, () => {
      (loader as unknown)['sources'] = dismissOtherSourcesSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(5);
      expect(service.merge).toHaveBeenNthCalledWith(1, { dos: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.deepMergeValues

    it(`loads sources using merge strategy if no deepMergeValues`, () => {
      (loader as unknown)['sources'] = [new MergeSource()];
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(service.merge).toHaveBeenNthCalledWith(1, { mv: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads sources using deep merge strategy if deepMergeValues`, () => {
      jest.spyOn(service, 'deepMerge');
      (loader as unknown)['sources'] = [new DeepMergeSource()];
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(service.deepMerge).toHaveBeenNthCalledWith(1, { dmv: 0 }, undefined);
      jest.runAllTimers();
      expect(service.deepMerge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.path

    it(`loads sources using merge strategy and path`, () => {
      (loader as unknown)['sources'] = [new PathMergeSource()];
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(service.merge).toHaveBeenNthCalledWith(1, { pmv: 0 }, 'a');
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads sources using deep merge strategy and path`, () => {
      jest.spyOn(service, 'deepMerge');
      (loader as unknown)['sources'] = [new PathDeepMergeSource()];
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(service.deepMerge).toHaveBeenNthCalledWith(1, { pdmv: 0 }, 'a');
      jest.runAllTimers();
      expect(service.deepMerge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.resetEnvironment

    it(`loads sources resetting the environment if resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      (loader as unknown)['sources'] = [new ResetEnvironmentSource()];
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).toHaveBeenCalled();
    });

    it(`loads sources without resetting the environment if no resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      (loader as unknown)['sources'] = [new RequiredOrderedSource()];
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.reset).not.toHaveBeenCalled();
    });

    // On error

    it(`returns rejected Promise if source error, requiredToLoad, no ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorNoIgnoreRequired;
      return loader.load().catch((error) => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        expect(error.message).toEqual(
          `Required Environment PropertiesSource "NoIgnoreRequiredErrorSource" failed to load: error`,
        );
      });
    });

    it(`returns resolved Promise if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorNoIgnoreNoRequired;
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`returns resolved Promise if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorIgnoreRequired;
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`returns resolved Promise if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      (loader as unknown)['sources'] = [new LoadImmediatelySource(), ...errorNoIgnoreRequired];
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { li: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    it(`loads sources until source error if requiredToLoad, no ignoreError and app not loaded`, async () => {
      (loader as unknown)['sources'] = errorNoIgnoreRequired;
      await expect(loader.load()).toReject();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads all sources if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorNoIgnoreNoRequired;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(2);
    });

    it(`loads all sources if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorIgnoreRequired;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(2);
    });

    it(`loads all sources if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      (loader as unknown)['sources'] = [new LoadImmediatelySource(), ...errorNoIgnoreRequired];
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // console.error

    it(`doesn't display console error if source error, requiredToLoad, no ignoreError and app not loaded`, async () => {
      (loader as unknown)['sources'] = errorNoIgnoreRequired;
      await expect(loader.load()).toReject();
      expect(console.error).not.toHaveBeenCalled();
    });

    it(`displays console.error if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorNoIgnoreNoRequired;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "NoIgnoreNoRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      (loader as unknown)['sources'] = errorIgnoreRequired;
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "IgnoreRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      (loader as unknown)['sources'] = [new LoadImmediatelySource(), ...errorNoIgnoreRequired];
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "NoIgnoreRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error without error message`, () => {
      (loader as unknown)['sources'] = [new ErrorNoMessageSource()];
      jest.useFakeTimers();
      loader.load();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "ErrorNoMessageSource" failed to load`,
      );
    });

    // Load Promise

    it(`works if source load returns a Promise`, () => {
      (loader as unknown)['sources'] = [new PromiseSource()];
      return loader.load().then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { p: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('loadSubmodule(sources)', () => {
    // no sources

    it(`returns resolved Promise immedialely if no sources`, () => {
      return loader.loadSubmodule([]).then(() => {
        expect(service.merge).not.toHaveBeenCalled();
      });
    });

    it(`loads nothing if no sources`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([]);
      jest.runAllTimers();
      expect(service.merge).not.toHaveBeenCalled();
    });

    // PropertiesSourceGateway.requiredToLoad

    it(`returns resolved Promise when all sources with requiredToLoad loads`, () => {
      return loader.loadSubmodule(orderedSources).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { nio: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(3, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(3);
      });
    });

    it(`returns resolved Promise immedialely if no sources with requiredToLoad`, () => {
      return loader.loadSubmodule(noRequiredSources).then(() => {
        expect(service.merge).not.toHaveBeenCalled();
      });
    });

    it(`loads all sources ignoring requiredToLoad`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(mixedOrderSources);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    // PropertiesSourceGateway.loadInOrder

    it(`loads all sources in order if loadInOrder`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(orderedSources);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { nio: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { io2: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { nio2: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(4);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources at once if no loadInOrder`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(unorderedSources);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenCalledWith({ iu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ niu: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources mixing loadInOrder and no loadInOrder values`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(mixedOrderSources);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenCalledWith({ iu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ niu: 0 }, undefined);
      expect(service.merge).toHaveBeenCalledWith({ io: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { nio: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    it(`loads all sources with loadInOrder if one is multiple and completes`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(multipleSources);
      jest.advanceTimersByTime(9);
      expect(service.merge).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(1, { a: 0 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(2, { a: 1 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(3, { a: 2 }, undefined);
      jest.advanceTimersByTime(9);
      expect(service.merge).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1);
      expect(service.merge).toHaveBeenNthCalledWith(4, { io: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(4);
    });

    // PropertiesSourceGateway.loadImmediately

    it(`returns resolved Promise just after loadImmediately source load `, () => {
      return loader.loadSubmodule(loadImmediatellySources).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { li: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`loads all sources if loadImmediately`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(loadImmediatellySources);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // PropertiesSourceGateway.dismissOtherSources

    it(`returns resolved Promise just after dismissOtherSources source load `, () => {
      return loader.loadSubmodule(dismissOtherSourcesSources).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { dos: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    it(`loads sources until source with dismissOtherSources`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(dismissOtherSourcesSources);
      jest.advanceTimersByTime(5);
      expect(service.merge).toHaveBeenNthCalledWith(1, { dos: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.deepMergeValues

    it(`loads sources using merge strategy if no deepMergeValues`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([new MergeSource()]);
      jest.advanceTimersByTime(10);
      expect(service.merge).toHaveBeenNthCalledWith(1, { mv: 0 }, undefined);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads sources using deep merge strategy if deepMergeValues`, () => {
      jest.spyOn(service, 'deepMerge');
      jest.useFakeTimers();
      loader.loadSubmodule([new DeepMergeSource()]);
      jest.advanceTimersByTime(10);
      expect(service.deepMerge).toHaveBeenNthCalledWith(1, { dmv: 0 }, undefined);
      jest.runAllTimers();
      expect(service.deepMerge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.path

    it(`loads sources using merge strategy and path`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([new PathMergeSource()]);
      jest.advanceTimersByTime(10);
      expect(service.merge).toHaveBeenNthCalledWith(1, { pmv: 0 }, 'a');
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads sources using deep merge strategy and path`, () => {
      jest.spyOn(service, 'deepMerge');
      jest.useFakeTimers();
      loader.loadSubmodule([new PathDeepMergeSource()]);
      jest.advanceTimersByTime(10);
      expect(service.deepMerge).toHaveBeenNthCalledWith(1, { pdmv: 0 }, 'a');
      jest.runAllTimers();
      expect(service.deepMerge).toHaveBeenCalledTimes(1);
    });

    // PropertiesSourceGateway.resetEnvironment

    it(`loads sources resetting the environment if resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      jest.useFakeTimers();
      loader.loadSubmodule([new ResetEnvironmentSource()]);
      jest.advanceTimersByTime(9);
      expect(service.reset).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(service.reset).toHaveBeenCalled();
    });

    it(`loads sources without resetting the environment if no resetEnvironment`, () => {
      jest.spyOn(service, 'reset');
      jest.useFakeTimers();
      loader.loadSubmodule([new RequiredOrderedSource()]);
      jest.runAllTimers();
      expect(service.reset).not.toHaveBeenCalled();
    });

    // On error

    it(`returns rejected Promise if source error, requiredToLoad, no ignoreError and app not loaded`, () => {
      return loader.loadSubmodule(errorNoIgnoreRequired).catch((error) => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
        expect(error.message).toEqual(
          `Required Environment PropertiesSource "NoIgnoreRequiredErrorSource" failed to load: error`,
        );
      });
    });

    it(`returns resolved Promise if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      return loader.loadSubmodule(errorNoIgnoreNoRequired).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`returns resolved Promise if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      return loader.loadSubmodule(errorIgnoreRequired).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { io: 0 }, undefined);
        expect(service.merge).toHaveBeenNthCalledWith(2, { io2: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(2);
      });
    });

    it(`returns resolved Promise if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      return loader.loadSubmodule([new LoadImmediatelySource(), ...errorNoIgnoreRequired]).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { li: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });

    it(`loads sources until source error if requiredToLoad, no ignoreError and app not loaded`, async () => {
      await expect(loader.loadSubmodule(errorNoIgnoreRequired)).toReject();
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`loads all sources if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(errorNoIgnoreNoRequired);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(2);
    });

    it(`loads all sources if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(errorIgnoreRequired);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(2);
    });

    it(`loads all sources if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([new LoadImmediatelySource(), ...errorNoIgnoreRequired]);
      jest.runAllTimers();
      expect(service.merge).toHaveBeenCalledTimes(3);
    });

    // console.error

    it(`doesn't display console error if source error, requiredToLoad, no ignoreError and app not loaded`, async () => {
      await expect(loader.loadSubmodule(errorNoIgnoreRequired)).toReject();
      expect(console.error).not.toHaveBeenCalled();
    });

    it(`displays console.error if source error, no requiredToLoad, no ignoreError and app not loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(errorNoIgnoreNoRequired);
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "NoIgnoreNoRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error if source error, requiredToLoad, ignoreError and app not loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule(errorIgnoreRequired);
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "IgnoreRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error if source error, requiredToLoad, no ignoreError and app loaded`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([new LoadImmediatelySource(), ...errorNoIgnoreRequired]).catch();
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "NoIgnoreRequiredErrorSource" failed to load: error`,
      );
    });

    it(`displays console.error without error message`, () => {
      jest.useFakeTimers();
      loader.loadSubmodule([new ErrorNoMessageSource()]);
      jest.runAllTimers();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        `Required Environment PropertiesSource "ErrorNoMessageSource" failed to load`,
      );
    });

    // Load Promise

    it(`works if source load returns a Promise`, () => {
      return loader.loadSubmodule([new PromiseSource()]).then(() => {
        expect(service.merge).toHaveBeenNthCalledWith(1, { p: 0 }, undefined);
        expect(service.merge).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('onDestroy()', () => {
    it(`destroys all loads`, () => {
      (loader as unknown)['sources'] = orderedSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(service.merge).toHaveBeenCalledTimes(1);
      expect(loader['destroy$List'][0].isStopped).toEqual(false);
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['destroy$List'][0].isStopped).toEqual(true);
      expect(service.merge).toHaveBeenCalledTimes(1);
    });

    it(`completes the app load`, () => {
      (loader as unknown)['sources'] = orderedSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(loader['load$List'][0].isStopped).toEqual(false);
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['load$List'][0].isStopped).toEqual(true);
    });

    it(`completes the required to load sources`, () => {
      (loader as unknown)['sources'] = orderedSources;
      jest.useFakeTimers();
      loader.load();
      jest.advanceTimersByTime(10);
      expect(loader['requiredToLoad$List'][0].isStopped).toEqual(false);
      loader.onDestroy();
      jest.runAllTimers();
      expect(loader['requiredToLoad$List'][0].isStopped).toEqual(true);
    });
  });
});
