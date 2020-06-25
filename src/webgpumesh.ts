import WebGPUEntity from './webgpuentity';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import WebGPUGeometry from './webgpugeometry';
import WebGPURenderContext from './webgpurendercontext';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderPipeline from './webgpurenderpipeline';
import WebGPUMaterial from './webgpumaterial';
import Camera from './camera';

export default class WebGPUMesh extends WebGPUEntity {
  private _geometry: WebGPUInterleavedGeometry | WebGPUGeometry;
  private _initialized = false;
  private _uniformBuffer: GPUBuffer;

  private _pipeline: WebGPURenderPipeline;

  private _material: WebGPUMaterial;

  private _context: WebGPURenderContext;

  public constructor(
    geometry: WebGPUInterleavedGeometry | WebGPUGeometry,
    pipeline: WebGPURenderPipeline,
    material?: WebGPUMaterial
  ) {
    super();
    this._geometry = geometry;
    this._pipeline = pipeline;
    this._material = material;
  }

  public async initalize(context: WebGPURenderContext, camera: Camera): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._context = context;

    if (this._material) {
      this._material.initalize(context);
    }

    this._geometry.initalize(context);

    const uboArray = new Float32Array([...this.modelMatrix]);
    this._uniformBuffer = createBuffer(context.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    const bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        type: 'uniform-buffer',
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        type: 'uniform-buffer',
      },
    ];

    const bindGroupEntries: GPUBindGroupEntry[] = [
      {
        binding: 0,
        resource: {
          buffer: camera.uniformBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: this._uniformBuffer,
        },
      },
    ];

    if (this._material) {
      bindGroupLayoutEntries.push(...this._material.bindGroupLayoutEntries);
      bindGroupEntries.push(...this._material.bindGroupEntries);
    }

    await this._pipeline.initalize(context, this._geometry.vertexState, bindGroupLayoutEntries, bindGroupEntries);
  }

  private updateUniformBuffer(): void {
    if (this._context) {
      const uboArray = new Float32Array([...this.modelMatrix]);
      this._context.queue.writeBuffer(this._uniformBuffer, 0, uboArray.buffer);
    }
  }

  protected updateModelMatrix(): void {
    super.updateModelMatrix();
    this.updateUniformBuffer();
  }

  public get geometry(): WebGPUInterleavedGeometry | WebGPUGeometry {
    return this._geometry;
  }

  public set geometry(geometry: WebGPUInterleavedGeometry | WebGPUGeometry) {
    this._geometry = geometry;
  }

  public get bindGroup(): GPUBindGroup {
    return this._pipeline.bindGroup;
  }

  public get gpuPipeline(): GPURenderPipeline {
    return this._pipeline.gpuPipeline;
  }

  public get material(): WebGPUMaterial {
    return this._material;
  }
}
