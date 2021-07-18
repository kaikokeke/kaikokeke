import { Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { serviceInjector, ServiceInjectorModule } from './service-injector.module';

@Injectable({ providedIn: 'root' })
class TestService {}

@Component({ template: '' })
class TestComponent {
  testService?: TestService = serviceInjector(TestService);
}

describe('serviceInjector(token, notFoundValue?, flags?)', () => {
  let fixture: ComponentFixture<TestComponent>;

  it(`throws error if no ServiceInjectorModule imported`, () => {
    TestBed.configureTestingModule({ declarations: [TestComponent] }).compileComponents();
    const error = `Import the 'ServiceInjectorModule' module to use serviceInjector()`;

    expect(() => TestBed.createComponent(TestComponent)).toThrowError(error);
  });

  it(`returns the service if ServiceInjectorModule`, () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ServiceInjectorModule],
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);

    expect(fixture.componentInstance.testService).toBeInstanceOf(TestService);
  });
});
