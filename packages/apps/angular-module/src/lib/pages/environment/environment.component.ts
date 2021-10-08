import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnvironmentQuery } from '@kaikokeke/environment';

@Component({
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentComponent {
  constructor(public readonly env: EnvironmentQuery) {}
}
