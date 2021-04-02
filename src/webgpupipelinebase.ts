import WebGPUObjectBase from './webgpuobjectbase';
import WebGPURenderContext from './webgpurendercontext';

export default abstract class WebGPUPipelineBase extends WebGPUObjectBase {
  protected _initialized = false;
  protected _pipeline: GPURenderPipeline | GPUComputePipeline;
  private _useWGSL = false;

  public constructor(useWGSL = false) {
    super();
    this._useWGSL = useWGSL;
  }

  protected async loadShader(context: WebGPURenderContext, shaderUrl: string): Promise<GPUShaderModule> {
    let code: Uint32Array | string;
    const response = await fetch(shaderUrl);

    if (!this._useWGSL) {
      code = new Uint32Array(await response.arrayBuffer());
    } else {
      code = await response.text();
    }

    const shaderModule = context.device.createShaderModule({
      code,
    });

    return shaderModule;
  }

  public get gpuPipeline(): GPURenderPipeline | GPUComputePipeline {
    return this._pipeline;
  }
}
