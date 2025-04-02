// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

import Camera from './camera';
import WebGPUComputePipline from './webgpucomputepipline';
import WebGPUMesh from './webgpumesh';
import WebGPURenderContext from './webgpurendercontext';

interface WebGPURendererOptions {
  sampleCount?: number;
}

export default class WebGPURenderer {
  private _canvas: HTMLCanvasElement;

  private _context!: WebGPURenderContext;

  private _meshes: WebGPUMesh[] = [];

  private _presentationContext: GPUCanvasContext | null;
  private _presentationSize: GPUExtent3DDict;
  private _presentationFormat!: GPUTextureFormat;

  private _renderTarget?: GPUTexture;
  private _renderTargetView!: GPUTextureView;

  private _depthTarget!: GPUTexture;
  private _depthTargetView!: GPUTextureView;

  private _camera: Camera;

  private _options?: WebGPURendererOptions;

  private _computePipeLine!: WebGPUComputePipline;

  public constructor(canvas: HTMLCanvasElement, camera: Camera, settings?: WebGPURendererOptions) {
    this._canvas = canvas;
    this._camera = camera;

    this._options = settings;
    this._presentationContext = this._canvas.getContext('webgpu');

    this._presentationSize = {
      width: this._canvas.clientWidth * devicePixelRatio,
      height: this._canvas.clientHeight * devicePixelRatio,
      depthOrArrayLayers: 1,
    };
  }

  public static supportsWebGPU(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.gpu) {
      return true;
    }
    return false;
  }

  private async initialize(): Promise<void> {
    const gpu: GPU = navigator.gpu;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!gpu) {
      throw new Error('No WebGPU support navigator.gpu not available!');
    }

    const adapter = await gpu.requestAdapter();

    if (!adapter) {
      throw new Error('Could not request Adapter');
    }
    console.log(adapter.limits);

    const device = await adapter.requestDevice({
      requiredLimits: {
        maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
      },
    });

    const queue = device.queue;

    this._context = new WebGPURenderContext(this._canvas, device, queue);

    this._presentationFormat = gpu.getPreferredCanvasFormat();

    this._presentationContext?.configure({
      device: this._context.device,
      format: this._presentationFormat,
      alphaMode: 'opaque',
    });
  }

  private reCreateSwapChain(): void {
    if (this._renderTarget !== undefined) {
      this._renderTarget.destroy();
      this._depthTarget.destroy();
    }

    /* render target */
    this._renderTarget = this._context.device.createTexture({
      size: this._presentationSize,
      sampleCount: this._options?.sampleCount ?? 1,
      format: this._presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this._renderTargetView = this._renderTarget.createView();

    /* depth target */
    this._depthTarget = this._context.device.createTexture({
      size: this._presentationSize,
      sampleCount: this._options?.sampleCount ?? 1,
      format: 'depth24plus-stencil8',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this._depthTargetView = this._depthTarget.createView();
  }

  private async initializeResources(): Promise<void> {
    this._camera.initalize(this._context);

    const meshInitializers: Promise<void>[] = [];
    for (const mesh of this._meshes) {
      meshInitializers.push(mesh.initalize(this._context, this._camera));
    }

    await Promise.all(meshInitializers);

    await this._computePipeLine.initialize(this._context);
  }

  private computePass(deltaTime: number): void {
    const commandEncoder = this._context.device.createCommandEncoder();

    this._computePipeLine.deltaTime(deltaTime);
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this._computePipeLine.gpuPipeline);
    passEncoder.setBindGroup(0, this._computePipeLine.bindGroup);
    // passEncoder.dispatch(this._computePipeLine.particleCount, 1, 1);
    passEncoder.dispatchWorkgroups(Math.ceil(this._computePipeLine.particleCount / 256));
    passEncoder.end();

    this._context.queue.submit([commandEncoder.finish()]);
  }

  private renderPass(): void {
    if (!this._presentationContext) {
      throw new Error('No resentationContext given');
    }
    const colorAttachment: GPURenderPassColorAttachment = {
      view: this._presentationContext.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    };

    const sampleCount = this._options?.sampleCount ?? 1;
    if (sampleCount > 1) {
      colorAttachment.view = this._renderTargetView;
      colorAttachment.resolveTarget = this._presentationContext.getCurrentTexture().createView();
    }

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: {
        view: this._depthTargetView,

        depthLoadOp: 'clear',
        depthClearValue: 1.0,
        depthStoreOp: 'store',

        stencilLoadOp: 'clear',
        stencilClearValue: 0,
        stencilStoreOp: 'store',
      },
    };

    const commandEncoder = this._context.device.createCommandEncoder();
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
    passEncoder.end();

    this._context.queue.submit([commandEncoder.finish()]);
  }

  public resize(width: number, height: number): void {
    if (width !== this._presentationSize.width || height !== this._presentationSize.height) {
      this._presentationSize = {
        width,
        height,
        depthOrArrayLayers: 1,
      };
      this.reCreateSwapChain();
    }
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
