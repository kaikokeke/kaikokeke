import { TestBed } from '@angular/core/testing';

import { InjectorModule } from './injector.module';

describe('InjectorModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InjectorModule],
    });
  });

  it(`.injector returns undefined if no implemented Injector`, () => {
    expect(InjectorModule.injector).toBeUndefined();
  });

  it(`.injector returns the Angular's implemented Injector`, () => {
    TestBed.inject(InjectorModule);
    expect(InjectorModule.injector).toBeDefined();
    expect(InjectorModule.injector).not.toBeNull();
  });
});
