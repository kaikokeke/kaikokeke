import { LoaderPropertiesSource } from './loader-properties-source.type';

export interface OnAfterSourceError {
  onAfterSourceError(error: Error, source: LoaderPropertiesSource): void;
}
