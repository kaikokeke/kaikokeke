/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SafeRxJS } from '@kaikokeke/common';
import { isPlainObject } from 'lodash-es';
import { Subject } from 'rxjs';

import { Properties } from '../types';
import { EnvironmentLoaderGateway } from './environment-loader.gateway';
import { EnvironmentServiceGateway } from './environment-service.gateway';
import { EnvironmentStoreGateway } from './environment-store.gateway';

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

  afterEach(() => {
    jest.restoreAllMocks();
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
});
