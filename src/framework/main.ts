import { applyCSS } from "../util/dom/applyCSS";
import { initContext } from "./initContext";
import { run } from "./run";
import { Scene, SceneFactory } from "./types/Scene";

export async function main<T extends any[]>(
  initialScene: SceneFactory<T>,
  ...args: T
) {
  applyCSS(readFileSync("assets/reset.css"));

  const [canvas, device, context] = await run(initContext);

  let currentScene = await run(
    initialScene,
    canvas,
    device,
    context,
    transition,
    ...args
  );
  let nextScene: Scene | undefined;

  function transition(scene: Scene) {
    if (nextScene) {
      nextScene.dispose();
    }
    nextScene = scene;
  }

  function tick() {
    if (nextScene) {
      currentScene.dispose();
      currentScene = nextScene;
      nextScene = undefined;
      currentScene.onStart?.();
    }
    currentScene.render();
    requestAnimationFrame(() => run(tick));
  }

  run(() => currentScene.onStart?.());
  run(tick);
}
