// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

//import { mat4 } from 'gl-matrix';
//import { createBuffer } from './webgpuhelpers';
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

  private _swapchain: GPUSwapChain;

  private _colorTextureView: GPUTextureView;
  private _depthTextureView: GPUTextureView;

  private readonly _colorTextureFormat: GPUTextureFormat = 'bgra8unorm';
  private readonly _depthTextureFormat: GPUTextureFormat = 'depth24plus-stencil8';

  private readonly _sampleCount = 4;

  private _camera: Camera;

  public constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this._canvas = canvas;
    this._camera = camera;
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
    passEncoder.setViewport(0, 0, this._canvas.width, this._canvas.height, 0, 1);
    passEncoder.setScissorRect(0, 0, this._canvas.width, this._canvas.height);

    passEncoder.setBindGroup(0, this._camera.bindGroup);

    for (const mesh of this._meshes) {
      passEncoder.setPipeline(mesh.gpuPipeline);
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
    const uniformBindGroupLayoutMesh = this._context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          type: 'uniform-buffer',
        },
      ],
    });

    this._camera.initalize(this._context);

    const meshInitializers: Promise<void>[] = [];
    for (const mesh of this._meshes) {
      meshInitializers.push(mesh.initalize(this._context, uniformBindGroupLayoutMesh));
    }

    await Promise.all(meshInitializers);
  }

  public resize(): void {
    this.reCreateSwapChain();
  }

  public render = (): void => {
    //this.updateUniformBufferCamera(camera);
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
