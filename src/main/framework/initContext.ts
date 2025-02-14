import { nonNullable } from "../util/assert/nonNullable";

export type InitContextResult = [
  canvas: HTMLCanvasElement,
  device: GPUDevice,
  canvasContext: GPUCanvasContext
];

export async function initContext(): Promise<InitContextResult> {
  if (!navigator.gpu) {
    throw new Error("Your browser does not support WebGPU.");
  }

  const canvas = document.createElement("canvas");
  document.body.insertBefore(canvas, null);
  const adapter = nonNullable(
    await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    }),
    "Failed to get GPU adapter."
  );

  const device = await adapter.requestDevice();
  const canvasContext = nonNullable(
    canvas.getContext("webgpu"),
    "Failed to get webgpu context."
  );

  return [canvas, device, canvasContext];
}
