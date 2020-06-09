import WebGPURenderContext from './webgpurendercontext';
import { createBuffer } from './webgpuhelpers';

export default abstract class WebGPUGeometryBase {
  private _indicesArray: Uint16Array;
  private _indexBuffer: GPUBuffer;
  protected _vertexBuffers: GPUBuffer[] = [];
  protected _initialized = false;
  protected _vertexState: GPUVertexStateDescriptor;
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

  public get vertexState(): GPUVertexStateDescriptor {
    return this._vertexState;
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
}
