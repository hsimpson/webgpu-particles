import { createBuffer } from './webgpuhelpers';
import WebGPUObjectBase from './webgpuobjectbase';
import WebGPURenderContext from './webgpurendercontext';

export default abstract class WebGPUGeometryBase extends WebGPUObjectBase {
  private _indicesArray!: Uint16Array;
  private _indexBuffer!: GPUBuffer;
  protected _vertexBuffers: GPUBuffer[] = [];
  protected _initialized = false;
  protected _vertexBufferLayouts: GPUVertexBufferLayout[] = [];
  protected _indexCount = 0;
  protected _vertexCount = 0;

  public setIndices(array: Uint16Array): void {
    this._indicesArray = array;
    this._indexCount = array.length;
    this._initialized = false;
  }

  public initalize(context: WebGPURenderContext): void {
    if (this._initialized) {
      return;
    }

    if (this._indexCount > 0) {
      this._indexBuffer = createBuffer(context.device, this._indicesArray, GPUBufferUsage.INDEX);
    }
  }

  public get vertexBufferLayouts(): GPUVertexBufferLayout[] {
    return this._vertexBufferLayouts;
  }

  public get indexBuffer(): GPUBuffer {
    return this._indexBuffer;
  }

  public get indexCount(): number {
    return this._indexCount;
  }

  public get vertexCount(): number {
    return this._vertexCount;
  }

  public get vertexBuffers(): GPUBuffer[] {
    return this._vertexBuffers;
  }

  public set vertexBuffers(buffers: GPUBuffer[]) {
    this._vertexBuffers = buffers;
  }
}
