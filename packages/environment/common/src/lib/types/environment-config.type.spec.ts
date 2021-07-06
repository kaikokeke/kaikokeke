import { initialEnvironmentConfig } from './environment-config.type';

const defaultEnvironmentConfig = { interpolation: ['{{', '}}'] };

describe('initialEnvironmentConfig(config?)', () => {
  it(`() returns all the default values`, () => {
    expect(initialEnvironmentConfig()).toEqual(defaultEnvironmentConfig);
  });

  it(`({}) returns all the default values`, () => {
    expect(initialEnvironmentConfig({})).toEqual(defaultEnvironmentConfig);
  });

  it(`({ interpolation }) returns custom interpolation`, () => {
    expect(initialEnvironmentConfig({ interpolation: ['(', ')'] })).toEqual(
      expect.objectContaining({ interpolation: ['(', ')'] })
    );
  });
});
