import { Component } from '@angular/core';
import { injector } from '@kaikokeke/angular';
import { EnvironmentQuery } from '@kaikokeke/environment';

@Component({
  selector: 'k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular';
  env: EnvironmentQuery = injector(EnvironmentQuery);
}
