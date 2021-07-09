import { environmentConfigFactory } from './environment-config-factory.function';

const defaultEnvironmentConfig = { interpolation: ['{{', '}}'] };

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
});
