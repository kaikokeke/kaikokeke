import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { KaikokekeCommonAngularModule } from '@kaikokeke/angular';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AkitaEnvironmentModule } from './environment/environment.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    KaikokekeCommonAngularModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaEnvironmentModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
