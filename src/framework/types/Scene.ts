export interface Scene {
  onStart?(): void;
  render(): void;
  dispose(): void;
}
