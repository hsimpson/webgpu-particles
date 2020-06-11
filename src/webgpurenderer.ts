// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

import { mat4 } from 'gl-matrix';
import { createBuffer } from './webgpuhelpers';
import Camera from './camera';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUMesh from './webgpumesh';

export default class WebGPURenderer {
  private _canvas: HTMLCanvasElement;
  private _adapter: GPUAdapter;
  private _device: GPUDevice;
  private _queue: GPUQueue;
  private _context: WebGPURenderContext;

  private _meshes: WebGPUMesh[] = [];

  // shader modules
  private _vertexModule: GPUShaderModule;
  private _fragmentModule: GPUShaderModule;

  private _pipeline: GPURenderPipeline;
  private _swapchain: GPUSwapChain;

  private _colorTextureView: GPUTextureView;
  private _depthTextureView: GPUTextureView;

  private readonly _colorTextureFormat: GPUTextureFormat = 'bgra8unorm';
  private readonly _depthTextureFormat: GPUTextureFormat = 'depth24plus-stencil8';

  private _uniformBufferCamera: GPUBuffer;
  private _uniformBindGroupCamera: GPUBindGroup;

  private readonly _sampleCount = 4;

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  private async initialize(): Promise<void> {
    const gpu: GPU = navigator.gpu;
    if (!gpu) {
      throw new Error('No WebGPU support navigator.gpu not available!');
    }

    this._adapter = await gpu.requestAdapter();

    this._device = await this._adapter.requestDevice();

    this._queue = this._device.defaultQueue;

    this._context = new WebGPURenderContext(this._canvas, this._device, this._queue);
  }

  private updateUniformBufferCamera(camera: Camera): void {
    if (camera.needsUpdate) {
      const uboArray = new Float32Array([...camera.viewMatrix, ...camera.perspectiveMatrix]);
      this._queue.writeBuffer(this._uniformBufferCamera, 0, uboArray.buffer);
      camera.needsUpdate = false;
    }
  }

  private async loadShader(path: string): Promise<GPUShaderModule> {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();

    const shaderModule = this._device.createShaderModule({
      code: new Uint32Array(buffer),
    });

    return shaderModule;
  }

  private reCreateSwapChain(): void {
    if (!this._swapchain) {
      const context: GPUCanvasContext = (this._canvas.getContext('gpupresent') as unknown) as GPUCanvasContext;
      const swapChainDesc: GPUSwapChainDescriptor = {
        device: this._device,
        format: this._colorTextureFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      };
      this._swapchain = context.configureSwapChain(swapChainDesc);
    }

    const textureSize: GPUExtent3D = {
      width: this._canvas.width,
      height: this._canvas.height,
      depth: 1,
    };

    const depthTextureDesc: GPUTextureDescriptor = {
      size: textureSize,
      //arrayLayerCount: 1, // FIXME: possible move to GPUTextureViewDescriptor?!
      mipLevelCount: 1,
      sampleCount: this._sampleCount,
      dimension: '2d',
      format: this._depthTextureFormat,
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };

    const depthTexture = this._device.createTexture(depthTextureDesc);
    this._depthTextureView = depthTexture.createView();

    const colorTextureDesc: GPUTextureDescriptor = {
      size: textureSize,
      sampleCount: this._sampleCount,
      format: this._colorTextureFormat,
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT,
    };

    const colorTexture = this._device.createTexture(colorTextureDesc);
    this._colorTextureView = colorTexture.createView();
  }

  private encodeCommands(): void {
    const colorAttachment: GPURenderPassColorAttachmentDescriptor = {
      attachment: null,
      loadValue: { r: 0, g: 0, b: 0, a: 1 },
      storeOp: 'store',
    };

    if (this._sampleCount > 1) {
      colorAttachment.attachment = this._colorTextureView;
      colorAttachment.resolveTarget = this._swapchain.getCurrentTexture().createView();
    } else {
      colorAttachment.attachment = this._swapchain.getCurrentTexture().createView();
    }

    const depthAttachment: GPURenderPassDepthStencilAttachmentDescriptor = {
      attachment: this._depthTextureView,
      depthLoadValue: 1,
      depthStoreOp: 'store',
      stencilLoadValue: 'load',
      stencilStoreOp: 'store',
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthAttachment,
    };

    const commandEncoder = this._device.createCommandEncoder();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
    passEncoder.setPipeline(this._pipeline);
    passEncoder.setViewport(0, 0, this._canvas.width, this._canvas.height, 0, 1);
    passEncoder.setScissorRect(0, 0, this._canvas.width, this._canvas.height);

    passEncoder.setBindGroup(0, this._uniformBindGroupCamera);

    for (const mesh of this._meshes) {
      const geometry = mesh.geometry;
      mesh.updateUniformBuffer(this._context);

      passEncoder.setBindGroup(1, mesh.uniformBindGroup);

      for (let i = 0; i < geometry.vertexBuffers.length; i++) {
        passEncoder.setVertexBuffer(i, geometry.vertexBuffers[i]);
      }
      if (geometry.indexCount > 0) {
        passEncoder.setIndexBuffer(geometry.indexBuffer);
        passEncoder.drawIndexed(geometry.indexCount, 1, 0, 0, 0);
      } else {
        passEncoder.draw(geometry.vertexCount, 1, 0, 0);
      }
    }
    passEncoder.endPass();
    this._queue.submit([commandEncoder.finish()]);
  }

  private async initializeResources(): Promise<void> {
    const tempMat = mat4.create();
    const uboArray = new Float32Array([...tempMat, ...tempMat]);
    this._uniformBufferCamera = createBuffer(this._device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    // create shader modules
    this._vertexModule = await this.loadShader('basic.vert.spv');
    this._fragmentModule = await this.loadShader('basic.frag.spv');

    const depthStencilState: GPUDepthStencilStateDescriptor = {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: this._depthTextureFormat,
    };

    const uniformBindGroupLayoutCamera = this._context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          type: 'uniform-buffer',
        },
      ],
    });

    const uniformBindGroupLayoutMesh = this._context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          type: 'uniform-buffer',
        },
      ],
    });

    for (const mesh of this._meshes) {
      mesh.initalize(this._context, uniformBindGroupLayoutMesh);
    }

    this._uniformBindGroupCamera = this._device.createBindGroup({
      layout: uniformBindGroupLayoutCamera,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this._uniformBufferCamera,
          },
        },
      ],
    });

    const piplineLayoutDesc: GPUPipelineLayoutDescriptor = {
      bindGroupLayouts: [uniformBindGroupLayoutCamera, uniformBindGroupLayoutMesh],
    };
    const layout = this._device.createPipelineLayout(piplineLayoutDesc);

    const vertexStage: GPUProgrammableStageDescriptor = {
      module: this._vertexModule,
      entryPoint: 'main',
    };

    const fragmentStage: GPUProgrammableStageDescriptor = {
      module: this._fragmentModule,
      entryPoint: 'main',
    };

    const colorState: GPUColorStateDescriptor = {
      format: this._colorTextureFormat,
      alphaBlend: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
      },
      colorBlend: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
      },
      writeMask: GPUColorWrite.ALL,
    };

    const rasterizationState: GPURasterizationStateDescriptor = {
      frontFace: 'cw',
      cullMode: 'none',
    };

    const pipelineDesc: GPURenderPipelineDescriptor = {
      layout,
      vertexStage,
      fragmentStage,
      primitiveTopology: 'line-list',
      //primitiveTopology: 'triangle-list',
      colorStates: [colorState],
      depthStencilState,
      // FIXME: this should be managed better then using the 1st geometry
      vertexState: this._meshes[0].geometry.vertexState,
      rasterizationState,
      sampleCount: this._sampleCount,
    };

    this._pipeline = this._device.createRenderPipeline(pipelineDesc);
  }

  public resize(): void {
    this.reCreateSwapChain();
  }

  public render = (camera: Camera): void => {
    this.updateUniformBufferCamera(camera);
    this.encodeCommands();
  };

  public async start(): Promise<void> {
    await this.initialize();
    this.reCreateSwapChain();
    await this.initializeResources();
  }

  public addMesh(mesh: WebGPUMesh): void {
    this._meshes.push(mesh);
  }
}
