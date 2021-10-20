# Properties Source Factory

Returns the properties sources with all the default values to be used by the EnvironmentLoader.

```ts
export function propertiesSourceFactory(sources?: PropertiesSource | PropertiesSource[]): LoaderPropertiesSource[];
```

Returns the properties sources with all the default values.

```ts
const defaultValues: Partial<LoaderPropertiesSource> = {
  id: uuid.v4(),
  requiredToLoad: false,
  loadInOrder: false,
  mergeProperties: false,
  ignoreError: false,
};
```

## Example of use

```ts
import { propertiesSourceFactory } from '@kaikokeke/environment';

export class SimpleSource implements PropertiesSource {
  requiredToLoad = true;
  load(): Observable<Properties> {
    return of({ a: 0 });
  }
}

const simpleSource: PropertiesSource = new SimpleSource();

propertiesSourceFactory();
// []

propertiesSourceFactory(null);
// []

propertiesSourceFactory([]);
// []

propertiesSourceFactory(simpleSource);
// [{
//    id: '6861f117-5356-467d-999e-44009d738773',
//    requiredToLoad: true,
//    loadInOrder: false,
//    mergeProperties: false,
//    ignoreError: false,
//    load(): Observable<Properties> {
//      return of({ a: 0 });
//    }
// }]
```
