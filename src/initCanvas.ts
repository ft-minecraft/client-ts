import { nonNullable } from "./util/assert/nonNullable";

export async function initCanvas() {
  if (!navigator.gpu) {
    throw new Error("Your browser does not support WebGPU.");
  }

  const canvas = document.createElement("canvas");
  document.body.insertBefore(canvas, null);
  const adapter = nonNullable(
    await navigator.gpu.requestAdapter(),
    "Failed to get GPU adapter."
  );

  const device = await adapter.requestDevice();
  const context = nonNullable(
    canvas.getContext("webgpu"),
    "Failed to get webgpu context."
  );

  return [canvas, device, context] as const;
}
