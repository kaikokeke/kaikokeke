import { TestBed } from '@angular/core/testing';
import { KaikokekeAngularModule } from '@kaikokeke/angular';

import { AppComponent } from './app.component';
import { AkitaEnvironmentModule } from './environment/akita-environment.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaikokekeAngularModule, AkitaEnvironmentModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
