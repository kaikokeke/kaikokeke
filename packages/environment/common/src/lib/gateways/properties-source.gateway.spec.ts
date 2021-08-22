import { Observable } from 'rxjs';

import { Properties } from '../types';
import { PropertiesSourceGateway } from './properties-source.gateway';

class TestPropertiesSource extends PropertiesSourceGateway {
  name = 'TestPropertiesSource';
  load(): Observable<Properties> | Promise<Properties> {
    throw new Error('Method not implemented.');
  }
}

describe('PropertiesSource', () => {
  let source: PropertiesSourceGateway;

  beforeEach(() => {
    source = new TestPropertiesSource();
  });

  it(`.name is setted with the class name`, () => {
    expect(source.name).toEqual('TestPropertiesSource');
  });

  it(`.loadBeforeApp is false by default`, () => {
    expect(source.loadBeforeApp).toEqual(false);
  });

  it(`.loadInOrder is false by default`, () => {
    expect(source.loadInOrder).toEqual(false);
  });

  it(`.loadImmediately is false by default`, () => {
    expect(source.loadImmediately).toEqual(false);
  });

  it(`.dismissOtherSources is false by default`, () => {
    expect(source.dismissOtherSources).toEqual(false);
  });

  it(`.deepMergeValues is false by default`, () => {
    expect(source.deepMergeValues).toEqual(false);
  });

  it(`.resetEnvironment is false by default`, () => {
    expect(source.resetEnvironment).toEqual(false);
  });

  it(`.isRequired is true by default`, () => {
    expect(source.isRequired).toEqual(true);
  });
});
