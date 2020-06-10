import WebGPUEntity from './webgpuentity';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import WebGPUGeometry from './webgpugeometry';
import WebGPURenderContext from './webgpurendercontext';
import { createBuffer } from './webgpuhelpers';

export default class WebGPUMesh extends WebGPUEntity {
  private _geometry: WebGPUInterleavedGeometry | WebGPUGeometry;
  private _initialized = false;
  private _uniformBuffer: GPUBuffer;
  //private static _uniformBindGroupLayout: GPUBindGroupLayout;
  private _uniformBindGroup: GPUBindGroup;

  public constructor(geometry: WebGPUInterleavedGeometry | WebGPUGeometry) {
    super();
    this._geometry = geometry;
  }

  public initalize(context: WebGPURenderContext, bindGroupLayout: GPUBindGroupLayout): void {
    this._geometry.initalize(context);

    if (this._initialized) {
      return;
    }

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

    this._initialized = true;
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

  /*
  public get uniformBuffer(): GPUBuffer {
    return this._uniformBuffer;
  }
  */
}
