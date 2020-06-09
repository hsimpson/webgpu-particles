import WebGPUEntity from './webgpuentity';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import WebGPUGeometry from './webgpugeometry';

export default class WebGPUMesh extends WebGPUEntity {
  private _geometry: WebGPUInterleavedGeometry | WebGPUGeometry;

  public constructor(geometry: WebGPUInterleavedGeometry | WebGPUGeometry) {
    super();
    this._geometry = geometry;
  }

  public get geometry(): WebGPUInterleavedGeometry | WebGPUGeometry {
    return this._geometry;
  }
}
