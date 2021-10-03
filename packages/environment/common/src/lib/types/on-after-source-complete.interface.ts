import { LoaderPropertiesSource } from './loader-properties-source.type';

export interface OnAfterSourceComplete {
  onAfterSourceComplete(source: LoaderPropertiesSource): void;
}
