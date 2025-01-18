export function applyCSS(source: string) {
  const style = document.createElement("style");
  style.innerHTML = source;
  document.head.insertBefore(style, null);
}
