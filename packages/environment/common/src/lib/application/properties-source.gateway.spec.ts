import { ObservableInput } from 'rxjs';

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

  it(`.name is undefined`, () => {
    expect(source.name).toBeUndefined();
  });

  it(`.requiredToLoad is undefined`, () => {
    expect(source.requiredToLoad).toBeUndefined();
  });

  it(`.loadInOrder is undefined`, () => {
    expect(source.loadInOrder).toBeUndefined();
  });

  it(`.mergeProperties is undefined`, () => {
    expect(source.mergeProperties).toBeUndefined();
  });

  it(`.ignoreError is undefined`, () => {
    expect(source.ignoreError).toBeUndefined();
  });

  it(`.path is undefined`, () => {
    expect(source.path).toBeUndefined();
  });

  it(`.load() is a defined method`, () => {
    expect(source.load).toBeFunction();
  });
});
