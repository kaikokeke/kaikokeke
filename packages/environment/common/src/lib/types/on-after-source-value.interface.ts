import { Properties } from './properties.type';

export interface OnAfterSourceValue {
  onAfterSourceValue(loadIndex: number, loadName: string, properties: Properties): void;
}
