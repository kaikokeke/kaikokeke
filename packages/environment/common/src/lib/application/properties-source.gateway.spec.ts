import { ObservableInput } from 'rxjs';
import { validate } from 'uuid';

import { Properties } from '../types';
import { PropertiesSource } from './properties-source.gateway';

class TestPropertiesSource extends PropertiesSource {
  load(): ObservableInput<Properties> {
    throw new Error('Method not implemented.');
  }
}

describe('PropertiesSource', () => {
  let source: PropertiesSource;

  beforeEach(() => {
    source = new TestPropertiesSource();
  });

  it(`._sourceId is setted with an UUID`, () => {
    expect(validate(source._sourceId)).toBeTrue();
  });

  it(`.sourceName is setted with the class name`, () => {
    expect(source.sourceName).toEqual('TestPropertiesSource');
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

  it(`.ignoreError is false by default`, () => {
    expect(source.ignoreError).toBeFalse();
  });

  it(`.load() is a defined method`, () => {
    expect(source.load).toBeFunction();
  });

  it(`.onBeforeLoad() is a defined method`, () => {
    expect(source.onBeforeLoad).toBeFunction();
  });

  it(`.onAfterLoad() is a defined method`, () => {
    expect(source.onAfterLoad).toBeFunction();
  });

  it(`.onError() is a defined method`, () => {
    expect(source.onError).toBeFunction();
  });

  it(`.onSoftError() is a defined method`, () => {
    expect(source.onSoftError).toBeFunction();
  });
});
