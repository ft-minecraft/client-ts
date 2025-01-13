export function assert(input: boolean, message: string): asserts input is true {
  if (!input) {
    throw new Error(message);
  }
}
