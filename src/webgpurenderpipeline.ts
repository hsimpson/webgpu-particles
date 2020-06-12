import WebGPURenderContext from './webgpurendercontext';
import Camera from './camera';

interface WebGPURenderPipelineOptions {
  primitiveTopology?: GPUPrimitiveTopology;
  sampleCount?: number;
  colorFormat?: GPUTextureFormat;
  depthFormat?: GPUTextureFormat;
}

export default class WebGPURenderPipeline {
  private _pipeline: GPURenderPipeline;
  private _initialized = false;
  private _pipelineOptions: WebGPURenderPipelineOptions;
  private _camera: Camera;

  private readonly _defaultColorTextureFormat: GPUTextureFormat = 'bgra8unorm';
  private readonly _defaultDepthTextureFormat: GPUTextureFormat = 'depth24plus-stencil8';

  public constructor(camera: Camera, pipelineOptions?: WebGPURenderPipelineOptions) {
    this._pipelineOptions = pipelineOptions || {};
    this._camera = camera;
  }

  public async initalize(context: WebGPURenderContext, vertexState: GPUVertexStateDescriptor): Promise<void> {
    if (this._initialized) {
      return;
    }

    const colorState: GPUColorStateDescriptor = {
      format: this._pipelineOptions.colorFormat || this._defaultColorTextureFormat,
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
      format: this._pipelineOptions.depthFormat || this._defaultDepthTextureFormat,
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
      module: await loadShader('basic.vert.spv'),
      entryPoint: 'main',
    };

    const fragmentStage: GPUProgrammableStageDescriptor = {
      module: await loadShader('basic.frag.spv'),
      entryPoint: 'main',
    };

    const layout = context.device.createPipelineLayout({
      bindGroupLayouts: [this._camera.bindGroupLayout, uniformBindGroupLayoutMesh],
    });

    const pipelineDesc: GPURenderPipelineDescriptor = {
      layout,
      vertexStage,
      fragmentStage,
      primitiveTopology: this._pipelineOptions.primitiveTopology || 'triangle-list',
      colorStates: [colorState],
      depthStencilState,
      vertexState,
      rasterizationState,
      sampleCount: this._pipelineOptions.sampleCount || 1,
    };

    this._pipeline = context.device.createRenderPipeline(pipelineDesc);
  }

  public get gpuPipeline(): GPURenderPipeline {
    return this._pipeline;
  }
}
