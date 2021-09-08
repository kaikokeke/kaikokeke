import { Observable } from 'rxjs';

import { Properties } from '../types';
import { PropertiesSource } from './properties-source.gateway';

class TestPropertiesSource extends PropertiesSource {
  name = 'TestPropertiesSource';
  load(): Observable<Properties> | Promise<Properties> {
    throw new Error('Method not implemented.');
  }
}

describe('PropertiesSource', () => {
  let source: PropertiesSource;

  beforeEach(() => {
    source = new TestPropertiesSource();
  });

  it(`.name is setted with the class name`, () => {
    expect(source.name).toEqual('TestPropertiesSource');
  });

  it(`.requiredToLoad is false by default`, () => {
    expect(source.requiredToLoad).toBeFalse();
  });

  it(`.loadInOrder is false by default`, () => {
    expect(source.loadInOrder).toBeFalse();
  });

  it(`.loadImmediately is false by default`, () => {
    expect(source.loadImmediately).toBeFalse();
  });

  it(`.dismissOtherSources is false by default`, () => {
    expect(source.dismissOtherSources).toBeFalse();
  });

  it(`.deepMergeValues is false by default`, () => {
    expect(source.deepMergeValues).toBeFalse();
  });

  it(`.resetEnvironment is false by default`, () => {
    expect(source.resetEnvironment).toBeFalse();
  });

  it(`.ignoreError is false by default`, () => {
    expect(source.ignoreError).toBeFalse();
  });
});
