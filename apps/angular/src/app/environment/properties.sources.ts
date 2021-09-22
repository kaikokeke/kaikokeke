import { HttpClient } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { firstNonNil } from '@kaikokeke/common';
import { EnvironmentQuery, EnvironmentService, Properties, PropertiesSource } from '@kaikokeke/environment';
import { ENVIRONMENT_SOURCES } from '@kaikokeke/environment-angular';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LocalJsonSource extends PropertiesSource {
  readonly requiredToLoad = true;

  readonly jsonPath = 'assets/environment.json';

  constructor(protected readonly http: HttpClient) {
    super();
  }

  load(): Observable<Properties> {
    return this.http.get<Properties>(this.jsonPath);
  }
}

@Injectable({ providedIn: 'root' })
export class PostSource extends PropertiesSource {
  readonly requiredToLoad = true;
  readonly path = 'post';

  readonly collection = 'posts';
  readonly postId = 1;
  readonly maxWait = 5000;

  constructor(protected readonly http: HttpClient, protected readonly query: EnvironmentQuery) {
    super();
  }

  load(): Observable<Properties> {
    const basePath$: Observable<string> = this.query.getProperty$<string>('basePath').pipe(firstNonNil(this.maxWait));

    return basePath$.pipe(
      switchMap((basePath: string) => this.http.get<Properties>(`${basePath}/${this.collection}/${this.postId}`)),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UserSource extends PropertiesSource {
  readonly requiredToLoad = true;
  readonly deepMergeValues = true;
  readonly path = 'post.user';

  readonly collection = 'users';
  readonly maxWait = 5000;

  constructor(
    protected readonly http: HttpClient,
    protected readonly query: EnvironmentQuery,
    protected readonly service: EnvironmentService,
  ) {
    super();
  }

  load(): Observable<Properties> {
    const basePath$: Observable<string> = this.query.getProperty$<string>('basePath').pipe(firstNonNil(this.maxWait));
    const userId$: Observable<number> = this.query.getProperty$<number>('post.userId').pipe(firstNonNil(this.maxWait));

    return combineLatest([basePath$, userId$]).pipe(
      switchMap(([basePath, userId]: [string, number]) =>
        this.http.get<Properties>(`${basePath}/${this.collection}/${userId}`),
      ),
    );
  }
}

export const PROPERTIES_SOURCE_PROVIDERS: Provider[] = [
  { provide: ENVIRONMENT_SOURCES, useClass: LocalJsonSource, multi: true },
  { provide: ENVIRONMENT_SOURCES, useClass: PostSource, multi: true },
  { provide: ENVIRONMENT_SOURCES, useClass: UserSource, multi: true },
];
