import { assignInWith } from 'lodash-es';
import { v4 } from 'uuid';

import { PropertiesSource } from '../application';
import { LoaderPropertiesSource } from '../types';

/**
 * Returns the properties sources with all the default values to be used by the EnvironmentLoader.
 * @param sources The environment properties sources to get the application properties asynchronously.
 * @returns The properties sources with all the default values.
 */
export function propertiesSourceFactory(sources?: PropertiesSource | PropertiesSource[]): LoaderPropertiesSource[] {
  if (sources == null) {
    return [];
  }

  const sourcesArray: PropertiesSource[] = Array.isArray(sources) ? sources : [sources];

  return sourcesArray
    .filter((source: PropertiesSource) => source != null)
    .map((source: PropertiesSource) => loaderPropertiesSourceFactory(source));
}

function loaderPropertiesSourceFactory(source: PropertiesSource): LoaderPropertiesSource {
  const defaultValues: Partial<LoaderPropertiesSource> = {
    id: v4(),
    requiredToLoad: false,
    loadInOrder: false,
    mergeProperties: false,
    ignoreError: false,
  };

  return assignInWith(source, defaultValues, <T>(sourceValue: T | undefined, defaultValue: T) =>
    sourceValue === undefined ? defaultValue : sourceValue,
  ) as LoaderPropertiesSource;
}
