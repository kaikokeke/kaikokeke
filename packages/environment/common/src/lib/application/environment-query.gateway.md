# Environment Query

Gets the properties from the environment.

## Examples of use

```ts
import { EnvironmentQuery, EnvironmentStore } from '@kaikokeke/environment';
import { store } from './custom-environment.store';

class CustomEnvironmentQuery extends EnvironmentQuery {
  constructor(protected readonly store: EnvironmentStore) {
    super(store);
  }
}

export const query: EnvironmentQuery = new CustomEnvironmentQuery(store);
```

### Returns as mutable

If the store uses immutable objects and the coder needs to change the returned values she can use the `asMutable` function or the `mapAsMutable` Observable operator to convert it.

```ts
import { asMutable, mapAsMutable, Property } from '@kaikokeke/environment';
import { Observable } from 'rxjs';
import { query } from './custom-environment.query';

const address$: Observable<Property> = query.get$('user.address').pipe(mapAsMutable());
const address: Property = query.getTyped('user.address', asMutable);
```
