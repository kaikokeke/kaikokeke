import { LoaderPropertiesSource } from './loader-properties-source.type';

export interface OnBeforeSourceLoad {
  onBeforeSourceLoad(source: LoaderPropertiesSource): void;
}
