import { Properties } from './properties.type';

export interface OnBeforeSourceValue {
  onBeforeSourceValue(loadIndex: number, loadName: string, properties: Properties): void;
}
