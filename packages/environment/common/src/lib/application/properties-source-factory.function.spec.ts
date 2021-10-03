import { ObservableInput } from 'rxjs';
import { validate } from 'uuid';

import { LoaderPropertiesSource, Properties } from '../types';
import { propertiesSourceFactory } from './properties-source-factory.function';
import { PropertiesSource } from './properties-source.gateway';

class ExtendsPropertiesSource extends PropertiesSource {
  name = 'ExtendsPropertiesSource';
  load(): ObservableInput<Properties> {
    throw new Error('Method not implemented.');
  }
}

class ImplementsPropertiesSource implements PropertiesSource {
  name = 'ImplementsPropertiesSource';
  load(): ObservableInput<Properties> {
    throw new Error('Method not implemented.');
  }
}

describe('propertiesSourceFactory()', () => {
  it(`() returns empty array`, () => {
    expect(propertiesSourceFactory()).toEqual([]);
    expect(propertiesSourceFactory(undefined)).toEqual([]);
  });

  it(`(null) returns empty array`, () => {
    expect(propertiesSourceFactory(null)).toEqual([]);
  });

  it(`(source) returns the complete source form minimal abstract`, () => {
    const source: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(validate(source.id)).toBeTrue();
    expect(source.name).toEqual('ExtendsPropertiesSource');
    expect(source.requiredToLoad).toBeFalse();
    expect(source.loadInOrder).toBeFalse();
    expect(source.mergeProperties).toBeFalse();
    expect(source.ignoreError).toBeFalse();
    expect(source.path).toBeUndefined();
    expect(source.load).toBeFunction();
  });

  it(`(source) returns the complete source form custom abstract`, () => {
    const customSource: PropertiesSource = new ExtendsPropertiesSource();
    customSource.name = 'test';
    customSource.requiredToLoad = true;
    customSource.loadInOrder = true;
    customSource.mergeProperties = true;
    customSource.ignoreError = true;
    customSource.path = 'a';
    const source: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    expect(validate(source.id)).toBeTrue();
    expect(source.name).toEqual('test');
    expect(source.requiredToLoad).toBeTrue();
    expect(source.loadInOrder).toBeTrue();
    expect(source.mergeProperties).toBeTrue();
    expect(source.ignoreError).toBeTrue();
    expect(source.path).toEqual('a');
    expect(source.load).toBeFunction();
  });

  it(`(source) returns the complete source form minimal interface`, () => {
    const source: LoaderPropertiesSource = propertiesSourceFactory(new ImplementsPropertiesSource()).shift();
    expect(validate(source.id)).toBeTrue();
    expect(source.name).toEqual('ImplementsPropertiesSource');
    expect(source.requiredToLoad).toBeFalse();
    expect(source.loadInOrder).toBeFalse();
    expect(source.mergeProperties).toBeFalse();
    expect(source.ignoreError).toBeFalse();
    expect(source.load).toBeFunction();
  });

  it(`(source) returns the complete source form custom interface`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.name = 'test';
    customSource.requiredToLoad = true;
    customSource.loadInOrder = true;
    customSource.mergeProperties = true;
    customSource.ignoreError = true;
    customSource.path = 'a';
    const source: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    expect(validate(source.id)).toBeTrue();
    expect(source.name).toEqual('test');
    expect(source.requiredToLoad).toBeTrue();
    expect(source.loadInOrder).toBeTrue();
    expect(source.mergeProperties).toBeTrue();
    expect(source.ignoreError).toBeTrue();
    expect(source.path).toEqual('a');
    expect(source.load).toBeFunction();
  });

  it(`(source) returns source with .id`, () => {
    const custom: LoaderPropertiesSource = propertiesSourceFactory(new ImplementsPropertiesSource()).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(validate(custom.id)).toBeTrue();
    expect(validate(original.id)).toBeTrue();
    expect(original.id).not.toEqual(custom.id);
  });

  it(`(source) returns source with .name`, () => {
    const custom: LoaderPropertiesSource = propertiesSourceFactory(new ImplementsPropertiesSource()).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.name).toEqual('ImplementsPropertiesSource');
    expect(original.name).toEqual('ExtendsPropertiesSource');
  });

  it(`(source) returns source with .requiredToLoad`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.requiredToLoad = true;
    const custom: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.requiredToLoad).toBeTrue();
    expect(original.requiredToLoad).toBeFalse();
  });

  it(`(source) returns source with .loadInOrder`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.loadInOrder = true;
    const custom: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.loadInOrder).toBeTrue();
    expect(original.loadInOrder).toBeFalse();
  });

  it(`(source) returns source with .mergeProperties`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.mergeProperties = true;
    const custom: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.mergeProperties).toBeTrue();
    expect(original.mergeProperties).toBeFalse();
  });

  it(`(source) returns source with .ignoreError`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.ignoreError = true;
    const custom: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.ignoreError).toBeTrue();
    expect(original.ignoreError).toBeFalse();
  });

  it(`(source) returns source with .path`, () => {
    const customSource: PropertiesSource = new ImplementsPropertiesSource();
    customSource.path = 'a';
    const custom: LoaderPropertiesSource = propertiesSourceFactory(customSource).shift();
    const original: LoaderPropertiesSource = propertiesSourceFactory(new ExtendsPropertiesSource()).shift();
    expect(custom.path).toEqual('a');
    expect(original.path).toBeUndefined();
  });

  it(`(sources[]) returns all as complete sources`, () => {
    const sources: LoaderPropertiesSource[] = propertiesSourceFactory([
      new ImplementsPropertiesSource(),
      new ExtendsPropertiesSource(),
    ]);
    expect(sources).toBeArrayOfSize(2);
    expect(validate(sources[0].id)).toBeTrue();
    expect(sources[0].name).toEqual('ImplementsPropertiesSource');
    expect(sources[0].requiredToLoad).toBeFalse();
    expect(sources[0].loadInOrder).toBeFalse();
    expect(sources[0].mergeProperties).toBeFalse();
    expect(sources[0].ignoreError).toBeFalse();
    expect(sources[0].path).toBeUndefined();
    expect(sources[0].load).toBeFunction();
    expect(validate(sources[1].id)).toBeTrue();
    expect(sources[1].name).toEqual('ExtendsPropertiesSource');
    expect(sources[1].requiredToLoad).toBeFalse();
    expect(sources[1].loadInOrder).toBeFalse();
    expect(sources[1].mergeProperties).toBeFalse();
    expect(sources[1].ignoreError).toBeFalse();
    expect(sources[1].path).toBeUndefined();
    expect(sources[1].load).toBeFunction();
  });
});
