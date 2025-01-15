import { Awaitable } from "../../util/types/Awaitable";
import { Context } from "../initContext";

export interface Scene {
  onStart?(): void;
  render(): void;
  dispose(): void;
}

export type SceneFactory<Args extends any[]> = (
  ...args: [...Context, transition: (scene: Scene) => void, ...Args]
) => Awaitable<Scene>;
