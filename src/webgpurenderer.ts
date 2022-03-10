// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

import Camera from './camera';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUMesh from './webgpumesh';
import WebGPUComputePipline from './webgpucomputepipline';

interface WebGPURendererOptions {
  sampleCount?: number;
}

export default class WebGPURenderer {
  private _canvas: HTMLCanvasElement;

  private _context: WebGPURenderContext;

  private _meshes: WebGPUMesh[] = [];

  private _presentationContext: GPUCanvasContext;
  private _presentationSize: GPUExtent3DStrict;
  private _presentationFormat: GPUTextureFormat;

  private _renderTarget: GPUTexture;
  private _renderTargetView: GPUTextureView;

  private _depthTarget: GPUTexture;
  private _depthTargetView: GPUTextureView;

  private _camera: Camera;

  private _options: WebGPURendererOptions;

  private _computePipeLine: WebGPUComputePipline;

  public constructor(canvas: HTMLCanvasElement, camera: Camera, settings?: WebGPURendererOptions) {
    this._canvas = canvas;
    this._camera = camera;
    const defaultOptions: WebGPURendererOptions = {
      sampleCount: 1,
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

    const adapter = await gpu.requestAdapter();
    console.log(adapter.limits);

    const device = await adapter.requestDevice();

    const queue = device.queue;

    this._context = new WebGPURenderContext(this._canvas, device, queue);

    const devicePixelRatio = window.devicePixelRatio || 1;
    this._presentationSize = {
      width: this._canvas.clientWidth * devicePixelRatio,
      height: this._canvas.clientWidth * devicePixelRatio,
      depthOrArrayLayers: 1,
    };

    this._presentationContext = this._canvas.getContext('webgpu');
    this._presentationFormat = this._presentationContext.getPreferredFormat(adapter);

    this._presentationContext.configure({
      device: this._context.device,
      format: this._presentationFormat,
      size: this._presentationSize,
    });
  }

  private reCreateSwapChain(): void {
    if (this._renderTarget !== undefined) {
      this._renderTarget.destroy();
      this._depthTarget.destroy();
    }

    this._presentationSize = {
      width: this._canvas.clientWidth * devicePixelRatio,
      height: this._canvas.clientWidth * devicePixelRatio,
      depthOrArrayLayers: 1,
    };

    this._presentationContext.configure({
      device: this._context.device,
      format: this._presentationFormat,
      size: this._presentationSize,
    });

    /* render target */
    this._renderTarget = this._context.device.createTexture({
      size: this._presentationSize,
      sampleCount: this._options.sampleCount,
      format: this._presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this._renderTargetView = this._renderTarget.createView();

    /* depth target */
    this._depthTarget = this._context.device.createTexture({
      size: this._presentationSize,
      sampleCount: this._options.sampleCount,
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

    if (this._computePipeLine) {
      await this._computePipeLine.initialize(this._context);
    }
  }

  private computePass(deltaTime: number): void {
    const commandEncoder = this._context.device.createCommandEncoder();

    this._computePipeLine.deltaTime(deltaTime);
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this._computePipeLine.gpuPipeline);
    passEncoder.setBindGroup(0, this._computePipeLine.bindGroup);
    // passEncoder.dispatch(this._computePipeLine.particleCount, 1, 1);
    passEncoder.dispatch(Math.ceil(this._computePipeLine.particleCount / 256));
    passEncoder.end();

    this._context.queue.submit([commandEncoder.finish()]);
  }

  private renderPass(): void {
    const colorAttachment: GPURenderPassColorAttachment = {
      view: this._presentationContext.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    };

    if (this._options.sampleCount > 1) {
      colorAttachment.view = this._renderTargetView;
      colorAttachment.resolveTarget = this._presentationContext.getCurrentTexture().createView();
    }

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: {
        view: this._depthTargetView,

        // TODO: check https://github.com/gund/eslint-plugin-deprecation/issues/13
        // depthLoadValue: 1.0,
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

  public resize(): void {
    const devicePixelRatio = window.devicePixelRatio || 1;

    if (
      this._canvas.clientWidth * devicePixelRatio !== this._presentationSize[0] ||
      this._canvas.clientHeight * devicePixelRatio !== this._presentationSize[1]
    ) {
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
