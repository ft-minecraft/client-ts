export function nonNullable<T>(input: T, message: string): NonNullable<T> {
  if (input === null || input === undefined) {
    throw new Error(message);
  }
  return input;
}
