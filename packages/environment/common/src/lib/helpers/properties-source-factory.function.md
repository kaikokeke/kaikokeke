import { assignInWith } from 'lodash-es';
import { v4 } from 'uuid';

# Properties Source Factory

Returns the properties sources with all the default values to be used by the EnvironmentLoader.

```ts
export function propertiesSourceFactory(sources?: PropertiesSource | PropertiesSource[]): LoaderPropertiesSource[];
```

Returns the properties sources with all the default values.
