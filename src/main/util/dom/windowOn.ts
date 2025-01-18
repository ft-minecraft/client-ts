import { once } from "../assert/hof/once";

export function windowOn<K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  const actualListener = (ev: WindowEventMap[K]) => listener(ev);
  window.addEventListener(type, actualListener, options);
  return once(() => window.removeEventListener(type, actualListener, options));
}
