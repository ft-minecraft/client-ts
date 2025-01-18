import { applyCSS } from "../util/dom/applyCSS";
import { initContext } from "./initContext";
import { run } from "./run";
import { Context } from "./types/Context";
import { Scene } from "./types/Scene";
import { SceneFactory } from "./util/sceneFactory";

export async function main<T extends any[]>(
  initialScene: SceneFactory<T>,
  ...args: T
) {
  applyCSS(readFileSync("assets/reset.css"));

  const [canvas, device, canvasContext] = await run(initContext);
  const context: Context = {
    canvas,
    device,
    canvasContext,
    transition,
    run,
  };

  let currentScene = await run(initialScene, context, ...args);
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
