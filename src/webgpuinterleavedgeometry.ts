import WebGPUGeometryBase from './webgpugeometrybase';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';

export default class WebGPUInterleavedGeometry extends WebGPUGeometryBase {
  private _interleavedArray!: Float32Array;
  private _stride = 0;
  private _attributes: GPUVertexAttribute[] = [];

  public constructor() {
    super();
  }

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

    this._vertexBufferLayouts.push({
      attributes: this._attributes,
      arrayStride: this._stride,
      stepMode: 'vertex',
    });
  }
}
