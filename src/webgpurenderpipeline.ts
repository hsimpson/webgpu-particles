import WebGPURenderContext from './webgpurendercontext';
import Camera from './camera';

interface WebGPURenderPipelineOptions {
  primitiveTopology?: GPUPrimitiveTopology;
  sampleCount?: number;
  colorFormat?: GPUTextureFormat;
  depthFormat?: GPUTextureFormat;
  vertexShaderUrl?: string;
  fragmentShaderUrl?: string;
}

export default class WebGPURenderPipeline {
  private _pipeline: GPURenderPipeline;
  private _initialized = false;
  private _options: WebGPURenderPipelineOptions;
  private _camera: Camera;

  public constructor(camera: Camera, options: WebGPURenderPipelineOptions) {
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

    const loadShader = async (path: string): Promise<GPUShaderModule> => {
      const response = await fetch(path);
      const buffer = await response.arrayBuffer();

      const shaderModule = context.device.createShaderModule({
        code: new Uint32Array(buffer),
      });

      return shaderModule;
    };

    const vertexStage: GPUProgrammableStageDescriptor = {
      module: await loadShader(this._options.vertexShaderUrl),
      entryPoint: 'main',
    };

    const fragmentStage: GPUProgrammableStageDescriptor = {
      module: await loadShader(this._options.fragmentShaderUrl),
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
    return this._pipeline;
  }
}
