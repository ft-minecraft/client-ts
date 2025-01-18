import Alea from "alea";
import { createNoise3D } from "simplex-noise";
import { mat4, vec3 } from "wgpu-matrix";
import {
  cubeIndexArray,
  cubeIndexCount,
  cubePositionOffset,
  cubeUVOffset,
  cubeVertexArray,
  cubeVertexSize,
} from "../../cube";
import { Scene } from "../../framework/types/Scene";
import { sceneFactory } from "../../framework/util/sceneFactory";
import { array } from "../../util/array/array";
import { Hook, useEffect, useMemo } from "../../util/hooks";

const MAP_SIZE = 4;

function generateMap(...seed: string[]) {
  const noise = createNoise3D(Alea(...seed));

  return array(MAP_SIZE * MAP_SIZE * MAP_SIZE, (i) => {
    const x = i % MAP_SIZE;
    const y = ((i - x) / MAP_SIZE) % MAP_SIZE;
    const z = ((i - x) / MAP_SIZE - y) / MAP_SIZE;

    return noise(x, y, z) > 0.0;
  });
}

export const mainScene = sceneFactory<[message: string]>(
  async (context, message): Promise<Scene> => {
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.canvasContext.configure({
      device: context.device,
      format,
      alphaMode: "opaque",
    });
    const shaderCode = readFileSync("assets/shader.wgsl");
    const shader = context.device.createShaderModule({
      code: shaderCode,
    });
    const indicesBuffer = context.device.createBuffer({
      size: cubeIndexArray.byteLength,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });
    new Uint16Array(indicesBuffer.getMappedRange()).set(cubeIndexArray);
    indicesBuffer.unmap();
    const verticesBuffer = context.device.createBuffer({
      size: cubeVertexArray.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
    verticesBuffer.unmap();
    const pipeline = context.device.createRenderPipeline({
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
    const uniformBuffer = context.device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformBindGroup = context.device.createBindGroup({
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

    const hook = Hook();

    function render() {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = context.canvas.clientWidth * pixelRatio;
      const height = context.canvas.clientHeight * pixelRatio;
      hook.start();

      useEffect(() => {
        context.canvas.width = width;
        context.canvas.height = height;
      }, [width, height]);
      const depthTexture = useMemo(
        () =>
          context.device.createTexture({
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
      context.device.queue.writeBuffer(
        uniformBuffer,
        0,
        transformationMatrix.buffer,
        transformationMatrix.byteOffset,
        transformationMatrix.byteLength
      );
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: context.canvasContext.getCurrentTexture().createView(),
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

      const commandEncoder = context.device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniformBindGroup);
      passEncoder.setIndexBuffer(indicesBuffer, "uint16");
      passEncoder.setVertexBuffer(0, verticesBuffer);
      passEncoder.drawIndexed(cubeIndexCount);
      passEncoder.end();
      context.device.queue.submit([commandEncoder.finish()]);

      hook.end();
    }

    function dispose() {
      hook.dispose();
    }

    return { onStart: () => console.log("main scene loaded"), render, dispose };
  }
);

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
