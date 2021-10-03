import { assignInWith } from 'lodash-es';
import { v4 } from 'uuid';

import { LoaderPropertiesSource } from '../types';
import { PropertiesSource } from './properties-source.gateway';

/**
 * Returns the properties sources with all the default values to be used by the EnvironmentLoader.
 * @param sources The environment properties sources to get the application properties asynchronously.
 * @returns The properties sources with all the default values.
 */
export function propertiesSourceFactory(sources?: PropertiesSource | PropertiesSource[]): LoaderPropertiesSource[] {
  if (sources == null) {
    return [];
  }

  return (Array.isArray(sources) ? sources : [sources])
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

  return assignInWith(source, defaultValues, (sourceValue: unknown, defaultValue: unknown) =>
    sourceValue === undefined ? defaultValue : sourceValue,
  ) as LoaderPropertiesSource;
}
