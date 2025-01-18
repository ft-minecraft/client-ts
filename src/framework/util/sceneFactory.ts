import { Awaitable } from "../../util/types/Awaitable";
import { Context } from "../types/Context";
import { Scene } from "../types/Scene";

export type SceneFactory<Args extends any[]> = (
  ...args: [context: Context, ...Args]
) => Awaitable<Scene>;

export function sceneFactory<const Args extends any[]>(
  sceneFactory: SceneFactory<Args>
): SceneFactory<Args> {
  return sceneFactory;
}
