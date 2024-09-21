import { Vec4 } from 'wgpu-matrix';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';

export default class WebGPUMaterial {
  private _uniformBuffer!: GPUBuffer;
  private _bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [];
  private _bindGroupEntries: GPUBindGroupEntry[] = [];

  private _initialized = false;
  private _color: Vec4;

  private _context!: WebGPURenderContext;

  public constructor(color: Vec4) {
    this._color = color;
  }

  public initalize(context: WebGPURenderContext): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._context = context;

    const uboArray = new Float32Array([...this._color]);
    this._uniformBuffer = createBuffer(context.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    this._bindGroupLayoutEntries.push({
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'uniform',
      },
    });

    this._bindGroupEntries.push({
      binding: 2,
      resource: {
        buffer: this._uniformBuffer,
      },
    });
  }

  private updateUniformBuffer(): void {
    if (this._initialized) {
      const uboArray = new Float32Array([...this._color]);
      this._context.queue.writeBuffer(this._uniformBuffer, 0, uboArray.buffer);
    }
  }

  public get bindGroupLayoutEntries(): GPUBindGroupLayoutEntry[] {
    return this._bindGroupLayoutEntries;
  }

  public get bindGroupEntries(): GPUBindGroupEntry[] {
    return this._bindGroupEntries;
  }

  public set color(color: Vec4) {
    this._color = color;
    this.updateUniformBuffer();
  }
}
