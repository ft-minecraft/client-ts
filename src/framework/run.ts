import { applyCSS } from "../util/dom/applyCSS";
import { Awaitable } from "../util/types/Awaitable";

export function run<Result, Args extends any[]>(
  func: (...args: Args) => Result,
  ...args: Args
): Result;
export function run<Result, Args extends any[]>(
  func: (...args: Args) => Awaitable<Result>,
  ...args: Args
): Promise<Result>;
export async function run<Result, Args extends any[]>(
  func: (...args: Args) => Awaitable<Result>,
  ...args: Args
): Promise<Result> {
  try {
    return await func(...args);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
      document.body.dataset.errorMessage = e.message;
      applyCSS(readFileSync("assets/failed.css"));
    }
    throw e;
  }
}
