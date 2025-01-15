import { SceneFactory } from "../types/Scene";

export function sceneFactory<const Args extends any[]>(
  sceneFactory: SceneFactory<Args>
): SceneFactory<Args> {
  return sceneFactory;
}
