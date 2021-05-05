import WebGPURenderContext from './webgpurendercontext';
import WebGPUPipelineBase from './webgpupipelinebase';

interface WebGPURenderPipelineOptions {
  primitiveTopology?: GPUPrimitiveTopology;
  sampleCount?: number;
  colorFormat?: GPUTextureFormat;
  depthFormat?: GPUTextureFormat;
  vertexShaderUrl?: string;
  fragmentShaderUrl?: string;
  useWGSL?: boolean;
}

export default class WebGPURenderPipeline extends WebGPUPipelineBase {
  private _options: WebGPURenderPipelineOptions;
  private _bindGroup: GPUBindGroup;

  public constructor(options: WebGPURenderPipelineOptions) {
    super();
    const defaultOptions: WebGPURenderPipelineOptions = {
      primitiveTopology: 'triangle-list',
      sampleCount: 1,
      colorFormat: 'bgra8unorm',
      depthFormat: 'depth24plus-stencil8',
    };
    this._options = { ...defaultOptions, ...options };
  }

  public async initalize(
    context: WebGPURenderContext,
    vertexBufferLayouts: GPUVertexBufferLayout[],
    bindGroupLayoutEntries: GPUBindGroupLayoutEntry[],
    bindGroupEntries: GPUBindGroupEntry[]
  ): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    const primitiveState: GPUPrimitiveState = {
      topology: this._options.primitiveTopology,
      // stripIndexFormat: // TODO
      frontFace: 'cw',
      cullMode: 'none',
    };

    const vertexState: GPUVertexState = {
      module: await this.loadShader(context, this._options.vertexShaderUrl),
      entryPoint: 'main',
      buffers: vertexBufferLayouts,
    };

    const colorState: GPUColorTargetState = {
      format: this._options.colorFormat,
      blend: {
        color: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add',
        },
        alpha: {
          srcFactor: 'src-alpha',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add',
        },
      },
      writeMask: GPUColorWrite.ALL,
    };

    const depthStencilState: GPUDepthStencilState = {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: this._options.depthFormat,
    };

    const fragmentState: GPUFragmentState = {
      module: await this.loadShader(context, this._options.fragmentShaderUrl),
      entryPoint: 'main',
      targets: [colorState],
    };

    const multiSampleState: GPUMultisampleState = {
      count: this._options.sampleCount,
      // mask
      // alphaToCoverageEnabled: true, // not yet supported
    };

    const bindGroupLayout = context.device.createBindGroupLayout({
      entries: bindGroupLayoutEntries,
    });

    this._bindGroup = context.device.createBindGroup({
      layout: bindGroupLayout,
      entries: bindGroupEntries,
    });

    const layout = context.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    const pipelineDesc: GPURenderPipelineDescriptorNew = {
      layout,
      vertex: vertexState,
      primitive: primitiveState,
      fragment: fragmentState,
      depthStencil: depthStencilState,
      multisample: multiSampleState,
    };

    this._pipeline = context.device.createRenderPipeline(pipelineDesc);
  }

  public get gpuPipeline(): GPURenderPipeline {
    return this._pipeline as GPURenderPipeline;
  }

  public get bindGroup(): GPUBindGroup {
    return this._bindGroup;
  }
}
