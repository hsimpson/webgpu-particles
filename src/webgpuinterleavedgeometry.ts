import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUGeometryBase from './webgpugeometrybase';

export default class WebGPUInterleavedGeometry extends WebGPUGeometryBase {
  private _interleavedArray: Float32Array;
  private _stride: number;
  private _attributes: GPUVertexAttribute[] = [];

  public setVertices(array: Float32Array, stride: number): void {
    this._interleavedArray = array;
    this._stride = stride;
    this._vertexCount = array.length / (stride / array.BYTES_PER_ELEMENT);
    this._initialized = false;
  }

  public addAttribute(attribute: GPUVertexAttribute): void {
    this._attributes.push(attribute);
  }

  public initalize(context: WebGPURenderContext): void {
    super.initalize(context);
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._vertexBuffers.push(createBuffer(context.device, this._interleavedArray, GPUBufferUsage.VERTEX));

    const vertexBufferDesc: GPUVertexBufferLayout = {
      attributes: this._attributes,
      arrayStride: this._stride,
      stepMode: 'vertex',
    };

    this._vertexState = {
      vertexBuffers: [vertexBufferDesc],
    };
  }
}
