import { CanActivate, Router, UrlTree } from '@angular/router';
import { inject } from '@kaikokeke/angular';
import { AtLeastOne } from '@kaikokeke/common';
import { EnvironmentQuery, Path } from '@kaikokeke/environment';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, filter, timeout } from 'rxjs/operators';

export abstract class PropertiesGuard implements CanActivate {
  protected abstract neededPaths: AtLeastOne<Path>;
  protected dueTime?: number | Date;
  protected urlOnError?: string | UrlTree;

  constructor(protected readonly environmentQuery: EnvironmentQuery, protected readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (typeof this.urlOnError === 'string') {
      this.urlOnError = this.router.parseUrl(this.urlOnError);
    }

    return this.environmentQuery.containsAll$(...this.neededPaths).pipe(
      filter((contains: boolean) => contains),
      guardTimeoutOperator(this.dueTime, this.urlOnError),
    );
  }
}

export function guardTimeoutOperator(
  dueTime?: number | Date,
  urlTree?: UrlTree,
): OperatorFunction<boolean, boolean | UrlTree> {
  return (observable: Observable<boolean | UrlTree>) => {
    return dueTime != null
      ? observable.pipe(
          timeout(dueTime),
          catchError(() => of(urlTree ?? false)),
        )
      : observable;
  };
}

export abstract class KPropertiesGuard extends PropertiesGuard {
  constructor() {
    super(inject(EnvironmentQuery), inject(Router));
  }
}
