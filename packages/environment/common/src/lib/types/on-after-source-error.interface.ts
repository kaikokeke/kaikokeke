export interface OnAfterSourceError {
  onAfterSourceError(loadIndex: number, loadName: string, error: Error): void;
}
