import { assert } from "./assert/assert";

type HookStoreItem = HookStoreItemRef | HookStoreItemMemo | HookStoreItemEffect;

type HookStoreItemRef = [type: "ref", value: [any]];
type HookStoreItemMemo = [type: "memo", value: any, deps: any[]];
type HookStoreItemEffect = [
  type: "effect",
  cleanup: (() => unknown) | undefined | void,
  deps: any[]
];

type HookStore = { store?: HookStoreItem[] };
type HookStateItem = [store: HookStore, index: number | undefined];

const states: HookStateItem[] = [];

const defaultHookStore: HookStore = {};

export function start(store = defaultHookStore) {
  assert(
    states.findIndex(([s]) => s === store) === -1,
    "Hook assertion failed: hook already started with given store."
  );
  const isFirst = !store.store;
  if (isFirst) {
    store.store = [];
  }
  states.push([store, isFirst ? undefined : 0]);
}

export function end(store = defaultHookStore) {
  const state = states.pop();
  assert(
    state?.[0] === store,
    "Hook assertion failed: end() called in incorrect order."
  );
  assert(
    state![1] === undefined || state![1] === state![0].store?.length,
    "Hook assertion failed: required hooks not called properly."
  );
}

export function finalize(store = defaultHookStore) {
  assert(
    states.findIndex(([s]) => s === store) === -1,
    "Hook assertion failed: finalize() called before end()."
  );
  store.store?.forEach((item) => {
    if (item[0] === "effect") {
      item[1]?.();
    }
  });
  store.store = undefined;
}

export function useRef<T>(value: T): [T] {
  assert(states.length !== 0, "Hook assertion failed: no active hook store.");

  const state = states[states.length - 1];

  assert(
    state[1] === undefined ||
      (state[0].store?.length !== state[1] &&
        state[0].store?.[state[1]][0] === "ref"),
    "Hook assertion failed: hook called in in incorrect order."
  );

  if (state[1] === undefined) {
    const result = [value] as [T];
    state[0].store!.push(["ref", result]);
    return result;
  } else {
    const item = state[0].store![state[1]] as HookStoreItemRef;
    state[1]++;
    return item[1];
  }
}

function depsChanged(previousDeps: any[], currentDeps: any[]): boolean {
  assert(
    previousDeps.length === currentDeps.length,
    "Hook assertion failed: deps length mismatch"
  );
  return previousDeps.some((deps, i) => currentDeps[i] !== deps);
}

export function useMemo<T>(value: () => T, deps: any[]): T {
  assert(states.length !== 0, "Hook assertion failed: no active hook store.");

  const state = states[states.length - 1];

  assert(
    state[1] === undefined ||
      (state[0].store?.length !== state[1] &&
        state[0].store?.[state[1]][0] === "memo"),
    "Hook assertion failed: hook called in in incorrect order."
  );

  if (state[1] === undefined) {
    const result = value();
    state[0].store!.push(["memo", result, deps]);
    return result;
  } else {
    const item = state[0].store![state[1]] as HookStoreItemMemo;

    const needAction = depsChanged(item[2], deps);
    const result = needAction ? value() : item[1];
    if (needAction) {
      item[1] = result;
      item[2] = deps;
    }
    state[1]++;
    return result;
  }
}

export function useEffect(
  effect: () => (() => unknown) | undefined | void,
  deps: any[]
) {
  assert(states.length !== 0, "Hook assertion failed: no active hook store.");

  const state = states[states.length - 1];

  assert(
    state[1] === undefined ||
      (state[0].store?.length !== state[1] &&
        state[0].store?.[state[1]][0] === "effect"),
    "Hook assertion failed: hook called in in incorrect order."
  );

  if (state[1] === undefined) {
    const cleanup = effect();
    state[0].store!.push(["effect", cleanup, deps]);
  } else {
    const item = state[0].store![state[1]] as HookStoreItemEffect;

    const needAction = depsChanged(item[2], deps);
    if (needAction) {
      item[1]?.();
      item[1] = effect();
      item[2] = deps;
    }
    state[1]++;
  }
}
