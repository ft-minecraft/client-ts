export function nonNullable<T>(input: T, message: string): NonNullable<T> {
  if (process.env.NODE_ENV === "production") {
    return input!; //NOSONAR
  }
  if (input === null || input === undefined) {
    throw new Error(message);
  }
  return input;
}
