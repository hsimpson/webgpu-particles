import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUEntity from './webgpuentity';

/*
          C
          /\
         /  \
        /    \
       /      \
    B /________\ A
*/

const VERTEXARRAY = new Float32Array([
  1.0,
  -1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  0.0,
  1.0, // A

  -1.0,
  -1.0,
  0.0,
  1.0,
  0.0,
  1.0,
  0.0,
  1.0, // B

  0.0,
  1.0,
  0.0,
  1.0,
  0.0,
  0.0,
  1.0,
  1.0, // C
]);

const INDICES = new Uint16Array([0, 1, 2]);

export default class Triangle extends WebGPUEntity {
  private _vertexBuffer: GPUBuffer;
  private _indexBuffer: GPUBuffer;
  private _initialized = false;
  private _context: WebGPURenderContext;
  private _vertexState: GPUVertexStateDescriptor;

  public constructor(context: WebGPURenderContext) {
    super();
    this._context = context;
  }

  public initalize(): void {
    if (this._initialized) {
      return;
    }

    this._vertexBuffer = createBuffer(this._context.device, VERTEXARRAY, GPUBufferUsage.VERTEX);
    this._indexBuffer = createBuffer(this._context.device, INDICES, GPUBufferUsage.INDEX);

    const positionAttributeDesc: GPUVertexAttributeDescriptor = {
      shaderLocation: 0,
      offset: 0,
      format: 'float4',
    };

    const colorAttributeDesc: GPUVertexAttributeDescriptor = {
      shaderLocation: 1,
      offset: 4 * 4,
      format: 'float4',
    };

    const vertexBufferDesc: GPUVertexBufferLayoutDescriptor = {
      attributes: [positionAttributeDesc, colorAttributeDesc],
      arrayStride: 4 * 8, // size of Float32 = 4 bytes * count of elements
      stepMode: 'vertex',
    };

    this._vertexState = {
      indexFormat: 'uint16',
      vertexBuffers: [vertexBufferDesc],
    };

    this._initialized = true;
  }

  public get vertexState(): GPUVertexStateDescriptor {
    return this._vertexState;
  }

  public get vertexBuffer(): GPUBuffer {
    return this._vertexBuffer;
  }

  public get indexBuffer(): GPUBuffer {
    return this._indexBuffer;
  }
}
