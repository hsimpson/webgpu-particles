import WebGPUObjectBase from './webgpuobjectbase';
import WebGPURenderContext from './webgpurendercontext';

export default abstract class WebGPUPipelineBase extends WebGPUObjectBase {
  protected _initialized = false;
  protected _pipeline: GPURenderPipeline | GPUComputePipeline;

  public constructor() {
    super();
  }

  protected async loadShader(context: WebGPURenderContext, shaderUrl: string): Promise<GPUShaderModule> {
    // let code: Uint32Array | string;
    const response = await fetch(shaderUrl);

    const shaderModule = context.device.createShaderModule({
      code: await response.text(),
    });

    return shaderModule;
  }

  public get gpuPipeline(): GPURenderPipeline | GPUComputePipeline {
    return this._pipeline;
  }
}
