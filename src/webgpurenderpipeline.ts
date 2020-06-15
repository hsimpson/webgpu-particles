import WebGPURenderContext from './webgpurendercontext';
import Camera from './camera';
import WebGPUPipelineBase from './webgpupipelinebase';

interface WebGPURenderPipelineOptions {
  primitiveTopology?: GPUPrimitiveTopology;
  sampleCount?: number;
  colorFormat?: GPUTextureFormat;
  depthFormat?: GPUTextureFormat;
  vertexShaderUrl?: string;
  fragmentShaderUrl?: string;
}

export default class WebGPURenderPipeline extends WebGPUPipelineBase {
  private _options: WebGPURenderPipelineOptions;
  private _camera: Camera;

  public constructor(camera: Camera, options: WebGPURenderPipelineOptions) {
    super();
    this._camera = camera;
    const defaultOptions: WebGPURenderPipelineOptions = {
      primitiveTopology: 'triangle-list',
      sampleCount: 1,
      colorFormat: 'bgra8unorm',
      depthFormat: 'depth24plus-stencil8',
    };
    this._options = { ...defaultOptions, ...options };
  }

  public async initalize(context: WebGPURenderContext, vertexState: GPUVertexStateDescriptor): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    const colorState: GPUColorStateDescriptor = {
      format: this._options.colorFormat,
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

    const depthStencilState: GPUDepthStencilStateDescriptor = {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: this._options.depthFormat,
    };

    const rasterizationState: GPURasterizationStateDescriptor = {
      frontFace: 'cw',
      cullMode: 'none',
    };

    const uniformBindGroupLayoutMesh = context.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          type: 'uniform-buffer',
        },
      ],
    });

    const vertexStage: GPUProgrammableStageDescriptor = {
      module: await this.loadShader(context, this._options.vertexShaderUrl),
      entryPoint: 'main',
    };

    const fragmentStage: GPUProgrammableStageDescriptor = {
      module: await this.loadShader(context, this._options.fragmentShaderUrl),
      entryPoint: 'main',
    };

    const layout = context.device.createPipelineLayout({
      bindGroupLayouts: [this._camera.bindGroupLayout, uniformBindGroupLayoutMesh],
    });

    const pipelineDesc: GPURenderPipelineDescriptor = {
      layout,
      vertexStage,
      fragmentStage,
      primitiveTopology: this._options.primitiveTopology,
      colorStates: [colorState],
      depthStencilState,
      vertexState,
      rasterizationState,
      sampleCount: this._options.sampleCount,
    };

    this._pipeline = context.device.createRenderPipeline(pipelineDesc);
  }

  public get gpuPipeline(): GPURenderPipeline {
    return this._pipeline as GPURenderPipeline;
  }
}
