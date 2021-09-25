export interface OnAfterLoadError {
  onAfterLoadError(loadIndex: number, loadName: string, error: Error): void;
}
