import { TestBed } from '@angular/core/testing';
import { KaikokekeAngularModule } from '@kaikokeke/angular';

import { AppComponent } from './app.component';
import { RxjsEnvironmentModule } from './environment/rxjs-environment.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaikokekeAngularModule, RxjsEnvironmentModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
