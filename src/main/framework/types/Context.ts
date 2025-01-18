import { Run } from "../run";
import { Scene } from "./Scene";

export interface Context {
  canvas: HTMLCanvasElement;
  device: GPUDevice;
  canvasContext: GPUCanvasContext;
  transition: (scene: Scene) => void;
  run: Run;
}
