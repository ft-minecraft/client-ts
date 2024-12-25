import { nonNullable } from "./util/assert/nonNullable";
import { applyCSS } from "./util/dom/applyCSS";

async function main() {
  applyCSS(readFileSync("assets/reset.css"));

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

  const format = navigator.gpu.getPreferredCanvasFormat();

  function render() {
    const shaderCode = readFileSync("assets/shader.wgsl");

    const shaderModule = device.createShaderModule({ code: shaderCode });

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(pipeline);
    renderPass.draw(3);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;

    context.configure({
      device,
      format,
      alphaMode: "opaque",
    });

    render();
  }

  window.addEventListener("resize", resizeCanvas);
  window
    .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener("change", resizeCanvas);

  resizeCanvas();
}

window.addEventListener("load", async () => {
  try {
    await main();
  } catch (e) {
    if (e instanceof Error) {
      document.body.dataset.errorMessage = e.message;
      applyCSS(readFileSync("assets/failed.css"));
    }
  }
});
