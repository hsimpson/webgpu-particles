import WebGPURenderContext from './webgpurendercontext';
import { vec4 } from 'gl-matrix';
import { createBuffer } from './webgpuhelpers';

export default class WebGPUMaterial {
  private _uniformBuffer: GPUBuffer;
  private _bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [];
  private _bindGroupEntries: GPUBindGroupEntry[] = [];

  private _initialized = false;
  private _color: vec4;

  private _context: WebGPURenderContext;

  public constructor(color: vec4) {
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
      type: 'uniform-buffer',
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

  public set color(color: vec4) {
    this._color = color;
    this.updateUniformBuffer();
  }
}
