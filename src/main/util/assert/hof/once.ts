import { assert } from "../assert";

export function once<Result, Args extends []>(
  func: (...args: Args) => Result
): (...args: Args) => Result {
  let called = false;

  return (...args) => {
    assert(!called, "once(...) called twice.");
    return func(...args);
  };
}
