import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, NavigationStart, RouteConfigLoadStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'k-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected readonly router: Router) {
    this.watchRouterLoading();
  }

  protected watchRouterLoading(): void {
    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof RouteConfigLoadStart || event instanceof NavigationStart) {
          this.loading$.next(true);
        } else if (event instanceof NavigationEnd) {
          this.loading$.next(false);
        }
      },
    });
  }
}
