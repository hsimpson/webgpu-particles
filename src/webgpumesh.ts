import WebGPUEntity from './webgpuentity';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import WebGPUGeometry from './webgpugeometry';
import WebGPURenderContext from './webgpurendercontext';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderPipeline from './webgpurenderpipeline';

export default class WebGPUMesh extends WebGPUEntity {
  private _geometry: WebGPUInterleavedGeometry | WebGPUGeometry;
  private _initialized = false;
  private _uniformBuffer: GPUBuffer;
  private _uniformBindGroup: GPUBindGroup;

  private _pipeline: WebGPURenderPipeline;

  public constructor(geometry: WebGPUInterleavedGeometry | WebGPUGeometry, pipeline: WebGPURenderPipeline) {
    super();
    this._geometry = geometry;
    this._pipeline = pipeline;
  }

  public async initalize(context: WebGPURenderContext, bindGroupLayout: GPUBindGroupLayout): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._geometry.initalize(context);
    await this._pipeline.initalize(context, this._geometry.vertexState);

    const uboArray = new Float32Array([...this.modelMatrix]);
    this._uniformBuffer = createBuffer(context.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    this._uniformBindGroup = context.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this._uniformBuffer,
          },
        },
      ],
    });
  }

  public updateUniformBuffer(context: WebGPURenderContext): void {
    if (this.needsUpdate) {
      const uboArray = new Float32Array([...this.modelMatrix]);
      context.queue.writeBuffer(this._uniformBuffer, 0, uboArray.buffer);
      this.needsUpdate = false;
    }
  }

  public get geometry(): WebGPUInterleavedGeometry | WebGPUGeometry {
    return this._geometry;
  }

  public get uniformBindGroup(): GPUBindGroup {
    return this._uniformBindGroup;
  }

  public get gpuPipeline(): GPURenderPipeline {
    return this._pipeline.gpuPipeline;
  }
}
