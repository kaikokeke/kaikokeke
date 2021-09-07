import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Injectable, InjectFlags } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { inject } from './inject.function';
import { InjectorModule } from './injector.module';

@Injectable()
class TestService {}

@Injectable()
class TestService2 {}

export abstract class AbstractComponent {
  get http(): HttpClient {
    return inject(HttpClient);
  }
}

function getJson$(): Observable<Object> {
  const http: HttpClient = inject(HttpClient);
  return http.get('environment.json');
}

@Component({ template: '' })
class TestComponent extends AbstractComponent {
  constructor() {
    super();
  }
  getToken(): TestService {
    return inject(TestService);
  }
  getNoToken(): TestService2 {
    return inject(TestService2);
  }
  getNotFoundValue(): TestService {
    return inject(TestService2, new TestService());
  }
  getFlags(): TestService {
    return inject(TestService2, undefined, InjectFlags.Optional);
  }
  getAbstract(): Observable<Object> {
    return this.http.get('environment.json');
  }
  getFunction(): Observable<Object> {
    return getJson$();
  }
}

describe('inject(token, notFoundValue?, flags?)', () => {
  let fixture: ComponentFixture<TestComponent>;
  let http: HttpClient;

  describe('without InjectorModule', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [HttpClientModule],
      }).compileComponents();
      fixture = TestBed.createComponent(TestComponent);
    });

    it(`throws 'InjectorModule' module error`, () => {
      const error = `Import the 'InjectorModule' module to use inject()`;
      expect(() => fixture.componentInstance.getToken()).toThrowError(error);
      expect(() => fixture.componentInstance.getNoToken()).toThrowError(error);
      expect(() => fixture.componentInstance.getNotFoundValue()).toThrowError(error);
      expect(() => fixture.componentInstance.getAbstract()).toThrowError(error);
      expect(() => fixture.componentInstance.getFunction()).toThrowError(error);
    });
  });

  describe('with InjectorModule', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [InjectorModule, HttpClientModule],
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

  describe('examples of use', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [InjectorModule, HttpClientModule],
        providers: [TestService],
      }).compileComponents();
      fixture = TestBed.createComponent(TestComponent);
      http = TestBed.inject(HttpClient);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it(`injects avoiding constructor`, (done) => {
      const value = { a: 0 };
      jest.spyOn(http, 'get').mockReturnValue(of(value));
      fixture.componentInstance.getAbstract().subscribe({
        next: (v: unknown) => {
          expect(v).toEqual(value);
          done();
        },
      });
    });

    it(`injects in a function`, (done) => {
      const value = { a: 1 };
      jest.spyOn(http, 'get').mockReturnValue(of(value));
      fixture.componentInstance.getFunction().subscribe({
        next: (v: unknown) => {
          expect(v).toEqual(value);
          done();
        },
      });
    });
  });
});
