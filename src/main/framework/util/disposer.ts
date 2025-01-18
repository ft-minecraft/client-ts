import { assert } from "../../util/assert/assert";

export function disposer(): [
  dispose: () => void,
  addItem: (disposable: () => unknown) => void
] {
  const items: (() => unknown)[] = [];
  let alreadyCalled = false;

  function dispose() {
    assert(!alreadyCalled, "dispose() called twice");
    items.forEach((item) => item());
  }

  function addItem(disposable: () => unknown) {
    assert(!alreadyCalled, "addItem() called after dispose() call");
    items.push(disposable);
  }

  return [dispose, addItem];
}
