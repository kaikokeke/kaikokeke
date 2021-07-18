import { Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autowired } from './autowired.decorator';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const injectorModule = require('../service-injector/service-injector.module');
jest.spyOn(injectorModule, 'serviceInjector').mockImplementation(() => new TestService());

@Injectable({ providedIn: 'root' })
class TestService {}

@Component({ template: '' })
class TestComponent {
  @Autowired(TestService)
  testService?: TestService;
}

describe('@Autowired(token, notFoundValue?, flags?)', () => {
  let fixture: ComponentFixture<TestComponent>;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it(`returns the service if ServiceInjectorModule`, () => {
    TestBed.configureTestingModule({ declarations: [TestComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);

    expect(fixture.componentInstance.testService).toBeInstanceOf(TestService);
  });
});
