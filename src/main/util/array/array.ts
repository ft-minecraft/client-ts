export function array<T>(length: number, value: (index: number) => T): T[] {
  return Array.from({ length }, (_, i) => value(i));
}
