// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@webgpu/types/dist/index.d.ts" />

import { mat4 } from 'gl-matrix';
import { createBuffer } from './webgpuhelpers';
import Camera from './camera';
import Triangle from './triangle';
import WebGPURenderContext from './webgpurendercontext';
export default class WebGPURenderer {
  private canvas: HTMLCanvasElement;
  private adapter: GPUAdapter;
  private device: GPUDevice;
  private queue: GPUQueue;
  private context: WebGPURenderContext;

  private uniformBuffer: GPUBuffer;

  private triangle: Triangle;

  // shader modules
  private vertexModule: GPUShaderModule;
  private fragmentModule: GPUShaderModule;

  private pipeline: GPURenderPipeline;
  private swapchain: GPUSwapChain;
  private colorTexture: GPUTexture;
  private colorTextureView: GPUTextureView;
  private depthTexture: GPUTexture;
  private depthTextureView: GPUTextureView;

  private commandEncoder: GPUCommandEncoder;
  private passEncoder: GPURenderPassEncoder;

  private uniformBindGroup: GPUBindGroup;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private async initialize(): Promise<void> {
    const gpu: GPU = navigator.gpu;
    if (!gpu) {
      throw new Error('No WebGPU support navigator.gpu not available!');
    }

    this.adapter = await gpu.requestAdapter();

    this.device = await this.adapter.requestDevice();

    this.queue = this.device.defaultQueue;

    this.context = new WebGPURenderContext(this.canvas, this.device, this.queue);
  }

  private updateUniformBuffer(camera: Camera): void {
    const uboArray = new Float32Array([
      ...this.triangle.modelMatrix,
      ...camera.viewMatrix,
      ...camera.perspectiveMatrix,
    ]);
    this.queue.writeBuffer(this.uniformBuffer, 0, uboArray.buffer);
  }

  private async loadShader(path: string): Promise<GPUShaderModule> {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();

    const shaderModule = this.device.createShaderModule({
      code: new Uint32Array(buffer),
    });

    return shaderModule;
  }

  private reCreateSwapChain(): void {
    if (!this.swapchain) {
      const context: GPUCanvasContext = (this.canvas.getContext('gpupresent') as unknown) as GPUCanvasContext;
      const swapChainDesc: GPUSwapChainDescriptor = {
        device: this.device,
        format: 'bgra8unorm',
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      };
      this.swapchain = context.configureSwapChain(swapChainDesc);
    }

    const depthSize: GPUExtent3D = {
      width: this.canvas.width,
      height: this.canvas.height,
      depth: 1,
    };

    const depthTextureDesc: GPUTextureDescriptor = {
      size: depthSize,
      //arrayLayerCount: 1, // FIXME: possible move to GPUTextureViewDescriptor?!
      mipLevelCount: 1,
      sampleCount: 1,
      dimension: '2d',
      format: 'depth24plus-stencil8',
      usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };

    this.depthTexture = this.device.createTexture(depthTextureDesc);
    this.depthTextureView = this.depthTexture.createView();
  }

  private encodeCommands(): void {
    const colorAttachment: GPURenderPassColorAttachmentDescriptor = {
      attachment: this.colorTextureView,
      loadValue: { r: 0, g: 0, b: 0, a: 1 },
      storeOp: 'store',
    };

    const depthAttachment: GPURenderPassDepthStencilAttachmentDescriptor = {
      attachment: this.depthTextureView,
      depthLoadValue: 1,
      depthStoreOp: 'store',
      stencilLoadValue: 'load',
      stencilStoreOp: 'store',
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthAttachment,
    };

    this.commandEncoder = this.device.createCommandEncoder();

    this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
    this.passEncoder.setPipeline(this.pipeline);
    this.passEncoder.setBindGroup(0, this.uniformBindGroup);
    this.passEncoder.setViewport(0, 0, this.canvas.width, this.canvas.height, 0, 1);
    this.passEncoder.setScissorRect(0, 0, this.canvas.width, this.canvas.height);
    this.passEncoder.setVertexBuffer(0, this.triangle.vertexBuffer);
    this.passEncoder.setIndexBuffer(this.triangle.indexBuffer);
    this.passEncoder.drawIndexed(3, 1, 0, 0, 0);
    this.passEncoder.endPass();

    this.queue.submit([this.commandEncoder.finish()]);
  }

  private async initializeResources(): Promise<void> {
    this.triangle = new Triangle(this.context);
    this.triangle.initalize();

    const tempMat = mat4.create();
    const uboArray = new Float32Array([...this.triangle.modelMatrix, ...tempMat, ...tempMat]);
    this.uniformBuffer = createBuffer(this.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    // create shader modules
    this.vertexModule = await this.loadShader('basic.vert.spv');
    this.fragmentModule = await this.loadShader('basic.frag.spv');

    const depthStencilState: GPUDepthStencilStateDescriptor = {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus-stencil8',
    };

    const uniformBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          type: 'uniform-buffer',
        },
      ],
    });

    this.uniformBindGroup = this.device.createBindGroup({
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
    });

    const piplineLayoutDesc: GPUPipelineLayoutDescriptor = { bindGroupLayouts: [uniformBindGroupLayout] };
    const layout = this.device.createPipelineLayout(piplineLayoutDesc);

    const vertexStage: GPUProgrammableStageDescriptor = {
      module: this.vertexModule,
      entryPoint: 'main',
    };

    const fragmentStage: GPUProgrammableStageDescriptor = {
      module: this.fragmentModule,
      entryPoint: 'main',
    };

    const colorState: GPUColorStateDescriptor = {
      format: 'bgra8unorm',
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
      primitiveTopology: 'triangle-list',
      colorStates: [colorState],
      depthStencilState,
      vertexState: this.triangle.vertexState,
      rasterizationState,
    };

    this.pipeline = this.device.createRenderPipeline(pipelineDesc);
  }

  public resize(): void {
    this.reCreateSwapChain();
  }

  public render = (camera: Camera): void => {
    this.colorTexture = this.swapchain.getCurrentTexture();
    this.colorTextureView = this.colorTexture.createView();

    this.triangle.rotateEuler(0, 0, 0.5);

    this.updateUniformBuffer(camera);
    this.encodeCommands();
  };

  public async start(): Promise<void> {
    await this.initialize();
    this.reCreateSwapChain();
    await this.initializeResources();
  }
}
