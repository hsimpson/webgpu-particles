import WebGPUGeometryBase from './webgpugeometrybase';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';

interface GeometryAttribute {
  array: Float32Array;
  descriptor: GPUVertexAttribute;
  stride: number;
  usage?: GPUBufferUsageFlags;
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
    this._initialized = true;

    for (let i = 0; i < this._attributes.length; i++) {
      const attribute = this._attributes[i];
      const buffer = createBuffer(context.device, attribute.array, attribute.usage ?? GPUBufferUsage.VERTEX);
      buffer.label = `Buffer-${this.name}-Attribute-${i}`;
      this._vertexBuffers.push(buffer);

      this._vertexBufferLayouts.push({
        attributes: [attribute.descriptor],
        arrayStride: attribute.stride,
        stepMode: 'vertex',
      });
    }
  }
}
