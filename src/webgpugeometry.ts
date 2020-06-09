import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';
import WebGPUGeometryBase from './webgpugeometrybase';

interface GeometryAttribute {
  array: Float32Array;
  descriptor: GPUVertexAttributeDescriptor;
  stride: number;
}

export default class WebGPUGeometry extends WebGPUGeometryBase {
  private _attributes: GeometryAttribute[] = [];

  public constructor(vertexCount: number) {
    super();
    this._vertexCount = vertexCount;
  }

  public addAttribute(attribute: GeometryAttribute): void {
    this._attributes.push(attribute);
  }

  public initalize(context: WebGPURenderContext): void {
    super.initalize(context);
    if (this._initialized) {
      return;
    }

    const layoutDescriptors: GPUVertexBufferLayoutDescriptor[] = [];
    for (const attibute of this._attributes) {
      this._vertexBuffers.push(createBuffer(context.device, attibute.array, GPUBufferUsage.VERTEX));

      layoutDescriptors.push({
        attributes: [attibute.descriptor],
        arrayStride: attibute.stride,
        stepMode: 'vertex',
      });
    }

    this._vertexState = {
      indexFormat: 'uint16', // does matter if non-indexed?
      vertexBuffers: layoutDescriptors,
    };

    this._initialized = true;
  }
}
