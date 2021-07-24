import { Observable } from 'rxjs';

import { LoadType, MergeStrategy, Properties } from '../types';
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

  it(`.name is setted`, () => {
    expect(source).toHaveProperty('name');
  });

  it(`.isRequired is true by default`, () => {
    expect(source.isRequired).toEqual(true);
  });

  it(`.loadType is INITIALIZATION by default`, () => {
    expect(source.loadType).toEqual(LoadType.INITIALIZATION);
  });

  it(`.mergeStrategy is MERGE by default`, () => {
    expect(source.mergeStrategy).toEqual(MergeStrategy.MERGE);
  });

  it(`.dismissOtherSources is false by default`, () => {
    expect(source.dismissOtherSources).toEqual(false);
  });

  it(`.resetEnvironment is false by default`, () => {
    expect(source.resetEnvironment).toEqual(false);
  });

  it(`.immediate is false by default`, () => {
    expect(source.resetEnvironment).toEqual(false);
  });
});
