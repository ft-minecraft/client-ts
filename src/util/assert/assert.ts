export function assert(input: boolean, message: string): asserts input is true {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  if (!input) {
    throw new Error(message);
  }
}
