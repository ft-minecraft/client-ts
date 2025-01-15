import { mat4, vec3 } from "wgpu-matrix";
import {
  cubeIndexArray,
  cubeIndexCount,
  cubePositionOffset,
  cubeUVOffset,
  cubeVertexArray,
  cubeVertexSize,
} from "./cube";
import { nonNullable } from "./util/assert/nonNullable";
import { applyCSS } from "./util/dom/applyCSS";
import { end, start, useEffect, useMemo } from "./util/hooks";

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
  context.configure({
    device,
    format,
    alphaMode: "opaque",
  });

  const shaderCode = readFileSync("assets/shader.wgsl");
  const shader = device.createShaderModule({
    code: shaderCode,
  });
  const indicesBuffer = device.createBuffer({
    size: cubeIndexArray.byteLength,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
  });
  new Uint16Array(indicesBuffer.getMappedRange()).set(cubeIndexArray);
  indicesBuffer.unmap();
  const verticesBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
  verticesBuffer.unmap();
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shader,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: cubeVertexSize,
          attributes: [
            {
              shaderLocation: 0,
              offset: cubePositionOffset,
              format: "float32x4",
            },
            {
              shaderLocation: 1,
              offset: cubeUVOffset,
              format: "float32x2",
            },
          ],
        },
      ],
    },
    fragment: {
      module: shader,
      entryPoint: "fs_main",
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
  });
  const uniformBufferSize = 4 * 16;
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  function render() {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * pixelRatio;
    const height = canvas.clientHeight * pixelRatio;
    start();

    useEffect(() => {
      canvas.width = width;
      canvas.height = height;
    }, [width, height]);
    const depthTexture = useMemo(
      () =>
        device.createTexture({
          size: [width, height],
          format: "depth24plus",
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }),
      [width, height]
    );
    const aspectRatio = width / height;
    const projectionMatrix = mat4.perspective(
      (2 * Math.PI) / 5,
      aspectRatio,
      1,
      100.0
    );
    const transformationMatrix = getTransformationMatrix(projectionMatrix);
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      transformationMatrix.buffer,
      transformationMatrix.byteOffset,
      transformationMatrix.byteLength
    );
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: [0.5, 0.5, 0.5, 1.0],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),

        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setIndexBuffer(indicesBuffer, "uint16");
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.drawIndexed(cubeIndexCount);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    end();

    requestAnimationFrame(render);
  }

  render();
}

window.addEventListener("load", async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
      document.body.dataset.errorMessage = e.message;
      applyCSS(readFileSync("assets/failed.css"));
    }
  }
});

function getTransformationMatrix(projectionMatrix: Float32Array) {
  const viewMatrix = mat4.identity();
  mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix);
  const now = Date.now() / 1000;
  mat4.rotate(
    viewMatrix,
    vec3.fromValues(Math.sin(now), Math.cos(now), 0),
    1,
    viewMatrix
  );

  const modelViewProjectionMatrix = mat4.create();
  mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

  return modelViewProjectionMatrix;
}
