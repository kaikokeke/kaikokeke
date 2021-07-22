import { environmentConfigFactory } from './environment-config-factory.function';

const defaultEnvironmentConfig = { interpolation: ['{{', '}}'], loadInOrder: true };

describe('environmentConfigFactory(config?)', () => {
  it(`() returns all the default values`, () => {
    expect(environmentConfigFactory()).toEqual(defaultEnvironmentConfig);
  });

  it(`({}) returns all the default values`, () => {
    expect(environmentConfigFactory({})).toEqual(defaultEnvironmentConfig);
  });

  it(`({ interpolation }) returns custom interpolation`, () => {
    expect(environmentConfigFactory({ interpolation: ['(', ')'] })).toEqual(
      expect.objectContaining({ interpolation: ['(', ')'] })
    );
  });

  it(`({ loadInOrder }) returns custom loadInOrder`, () => {
    expect(environmentConfigFactory({ loadInOrder: false })).toEqual(expect.objectContaining({ loadInOrder: false }));
  });

  it(`({ maxLoadTime }) returns custom maxLoadTime if >= 0`, () => {
    expect(environmentConfigFactory({ maxLoadTime: 0 })).toEqual(expect.objectContaining({ maxLoadTime: 0 }));
    expect(environmentConfigFactory({ maxLoadTime: 1 })).toEqual(expect.objectContaining({ maxLoadTime: 1 }));
  });

  it(`({ maxLoadTime }) returns undefined maxLoadTime if < 0`, () => {
    expect(environmentConfigFactory({ maxLoadTime: -1 })).toEqual(expect.objectContaining({ maxLoadTime: undefined }));
  });
});
