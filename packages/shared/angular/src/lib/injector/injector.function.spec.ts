import { Component, Injectable, InjectFlags } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { injector } from './injector.function';
import { InjectorModule } from './injector.module';

@Injectable()
class TestService {}

@Injectable()
class TestService2 {}

@Component({ template: '' })
class TestComponent {
  getToken(): TestService {
    return injector(TestService);
  }
  getNoToken(): TestService2 {
    return injector(TestService2);
  }
  getNotFoundValue(): TestService {
    return injector(TestService2, new TestService());
  }
  getFlags(): TestService {
    return injector(TestService2, undefined, InjectFlags.Optional);
  }
}

describe('injector(token, notFoundValue?, flags?)', () => {
  let fixture: ComponentFixture<TestComponent>;

  describe('without InjectorModule', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ declarations: [TestComponent], providers: [TestService] }).compileComponents();
      fixture = TestBed.createComponent(TestComponent);
    });

    it(`throws 'InjectorModule' module error`, () => {
      const error = `Import the 'InjectorModule' module to use injector()`;
      expect(() => fixture.componentInstance.getToken()).toThrowError(error);
      expect(() => fixture.componentInstance.getNoToken()).toThrowError(error);
      expect(() => fixture.componentInstance.getNotFoundValue()).toThrowError(error);
    });
  });

  describe('with InjectorModule', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [InjectorModule],
        providers: [TestService],
      }).compileComponents();
      fixture = TestBed.createComponent(TestComponent);
    });

    it(`(token) returns the token if is provided`, () => {
      expect(fixture.componentInstance.getToken()).toBeInstanceOf(TestService);
    });

    it(`(token) throws error if token is not provided`, () => {
      const error = 'No provider for TestService2';
      expect(() => fixture.componentInstance.getNoToken()).toThrowError(error);
    });

    it(`(token, notFoundValue) returns the notFoundValue if token is not provided`, () => {
      expect(fixture.componentInstance.getNotFoundValue()).toBeInstanceOf(TestService);
    });

    it(`(token, notFoundValue, flags) uses the flags for token injection`, () => {
      expect(fixture.componentInstance.getFlags()).toBeNull();
    });
  });
});
