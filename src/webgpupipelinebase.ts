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
    // let code: Uint32Array | string;
    const response = await fetch(shaderUrl);
    let shaderModule: GPUShaderModule;

    if (!this._useWGSL) {
      shaderModule = context.device.createShaderModule({
        code: new Uint32Array(await response.arrayBuffer()),
      });
    } else {
      shaderModule = context.device.createShaderModule({
        code: await response.text(),
      });
    }

    return shaderModule;
  }

  public get gpuPipeline(): GPURenderPipeline | GPUComputePipeline {
    return this._pipeline;
  }
}
