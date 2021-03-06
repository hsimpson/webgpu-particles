// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

import Camera from './camera';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUMesh from './webgpumesh';
import WebGPUComputePipline from './webgpucomputepipline';

interface WebGPURendererOptions {
  sampleCount?: number;
  colorFormat?: GPUTextureFormat;
  depthFormat?: GPUTextureFormat;
}

export default class WebGPURenderer {
  private _canvas: HTMLCanvasElement;
  private _adapter: GPUAdapter;
  private _device: GPUDevice;
  private _queue: GPUQueue;
  private _context: WebGPURenderContext;

  private _meshes: WebGPUMesh[] = [];

  private _presentationContext: GPUPresentationContext;

  private _colorTextureView: GPUTextureView;
  private _depthTextureView: GPUTextureView;
  private _colorAttachment: GPURenderPassColorAttachment;
  private _depthAttachment: GPURenderPassDepthStencilAttachment;

  private _camera: Camera;

  private _options: WebGPURendererOptions;

  private _computePipeLine: WebGPUComputePipline;

  public constructor(canvas: HTMLCanvasElement, camera: Camera, settings?: WebGPURendererOptions) {
    this._canvas = canvas;
    this._camera = camera;
    const defaultOptions: WebGPURendererOptions = {
      sampleCount: 1,
      colorFormat: 'bgra8unorm',
      depthFormat: 'depth24plus-stencil8',
    };

    this._options = { ...defaultOptions, ...settings };
  }

  public static supportsWebGPU(): boolean {
    if (navigator.gpu) {
      return true;
    }
    return false;
  }

  private async initialize(): Promise<void> {
    const gpu: GPU = navigator.gpu;
    if (!gpu) {
      throw new Error('No WebGPU support navigator.gpu not available!');
    }

    this._adapter = await gpu.requestAdapter();

    this._device = await this._adapter.requestDevice();

    this._queue = this._device.queue;

    this._context = new WebGPURenderContext(this._canvas, this._device, this._queue);

    this._presentationContext = this._canvas.getContext('gpupresent');
    const presentationConfiguration: GPUPresentationConfiguration = {
      device: this._device,
      format: this._options.colorFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };
    this._presentationContext.configure(presentationConfiguration);
  }

  private reCreateSwapChain(): void {
    const textureSize: GPUExtent3D = {
      width: this._canvas.width,
      height: this._canvas.height,
      depthOrArrayLayers: 1,
    };

    const depthTextureDesc: GPUTextureDescriptor = {
      size: textureSize,
      //arrayLayerCount: 1, // FIXME: possible move to GPUTextureViewDescriptor?!
      mipLevelCount: 1,
      sampleCount: this._options.sampleCount,
      dimension: '2d',
      format: this._options.depthFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };

    const depthTexture = this._device.createTexture(depthTextureDesc);
    this._depthTextureView = depthTexture.createView();

    const colorTextureDesc: GPUTextureDescriptor = {
      size: textureSize,
      sampleCount: this._options.sampleCount,
      format: this._options.colorFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    };

    const colorTexture = this._device.createTexture(colorTextureDesc);
    this._colorTextureView = colorTexture.createView();

    this._colorAttachment = {
      view: null,
      loadValue: { r: 0, g: 0, b: 0, a: 1 },
      storeOp: 'store',
    };

    this._depthAttachment = {
      view: this._depthTextureView,
      depthLoadValue: 1,
      depthStoreOp: 'store',
      stencilLoadValue: 'load',
      stencilStoreOp: 'store',
    };
  }

  private async initializeResources(): Promise<void> {
    this._camera.initalize(this._context);

    const meshInitializers: Promise<void>[] = [];
    for (const mesh of this._meshes) {
      meshInitializers.push(mesh.initalize(this._context, this._camera));
    }

    await Promise.all(meshInitializers);

    if (this._computePipeLine) {
      await this._computePipeLine.initialize(this._context);
    }
  }

  private computePass(deltaTime: number): void {
    const commandEncoder = this._device.createCommandEncoder();

    this._computePipeLine.deltaTime(deltaTime);
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this._computePipeLine.gpuPipeline);
    passEncoder.setBindGroup(0, this._computePipeLine.bindGroup);
    // passEncoder.dispatch(this._computePipeLine.particleCount, 1, 1);
    passEncoder.dispatch(Math.ceil(this._computePipeLine.particleCount / 64));
    passEncoder.endPass();

    this._queue.submit([commandEncoder.finish()]);
  }

  private renderPass(): void {
    if (this._options.sampleCount > 1) {
      this._colorAttachment.view = this._colorTextureView;
      this._colorAttachment.resolveTarget = this._presentationContext.getCurrentTexture().createView();
    } else {
      this._colorAttachment.view = this._presentationContext.getCurrentTexture().createView();
    }

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [this._colorAttachment],
      depthStencilAttachment: this._depthAttachment,
    };

    const commandEncoder = this._device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);

    for (const mesh of this._meshes) {
      const geometry = mesh.geometry;
      passEncoder.setPipeline(mesh.gpuPipeline);

      passEncoder.setBindGroup(0, mesh.bindGroup);

      for (let i = 0; i < geometry.vertexBuffers.length; i++) {
        passEncoder.setVertexBuffer(i, geometry.vertexBuffers[i]);
      }
      if (geometry.indexCount > 0) {
        passEncoder.setIndexBuffer(geometry.indexBuffer, 'uint16');
        passEncoder.drawIndexed(geometry.indexCount, 1, 0, 0, 0);
      } else {
        passEncoder.draw(geometry.vertexCount, 1, 0, 0);
      }
    }
    /**/
    passEncoder.endPass();

    this._queue.submit([commandEncoder.finish()]);
  }

  public resize(): void {
    this.reCreateSwapChain();
  }

  public render = (deltaTime: number): void => {
    this.computePass(deltaTime);
    this.renderPass();
  };

  public async start(): Promise<void> {
    await this.initialize();
    this.reCreateSwapChain();
    await this.initializeResources();
  }

  public addMesh(mesh: WebGPUMesh): void {
    this._meshes.push(mesh);
  }

  public setComputePipeLine(pipeline: WebGPUComputePipline): void {
    this._computePipeLine = pipeline;
  }
}
