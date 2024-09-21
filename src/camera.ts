import { Quat, Vec3, mat4, quat, utils, vec3 } from 'wgpu-matrix';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';

export default class Camera {
  private _perspectiveMatrix = mat4.identity();
  private _viewMatrix = mat4.identity();
  private _rotation = quat.identity();

  private _uniformBuffer!: GPUBuffer;
  /*
  private _uniformBindGroupLayout: GPUBindGroupLayout;
  private _uniformBindGroup: GPUBindGroup;
  */
  private _initialized = false;
  private _context!: WebGPURenderContext;

  public position: Vec3 = vec3.create(0, 0, 0);
  public target: Vec3 = vec3.create(0, 0, 0);
  public up: Vec3 = vec3.create(0, 1, 0);
  public fovY = 45.0;
  public aspectRatio = 1.0;
  public zNear = 0.1;
  public zFar = 1000;

  public constructor(fovY: number, aspectRatio: number, zNear: number, zFar: number) {
    this.fovY = fovY;
    this.aspectRatio = aspectRatio;
    this.zNear = zNear;
    this.zFar = zFar;
  }

  public initalize(context: WebGPURenderContext): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._context = context;

    const uboArray = new Float32Array([...this._viewMatrix, ...this._perspectiveMatrix]);
    this._uniformBuffer = createBuffer(context.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    this.updateMatrices();
  }

  public get viewMatrix() {
    return this._viewMatrix;
  }

  public get perspectiveMatrix() {
    return this._perspectiveMatrix;
  }

  public get uniformBuffer(): GPUBuffer {
    return this._uniformBuffer;
  }

  public updateMatrices(): void {
    this.updateViewMatrix();
    this.updatePerspectiveMatrix();
  }

  private updateViewMatrix(): void {
    const translationMatrix = mat4.lookAt(this.position, this.target, this.up);
    const rotationMatrix = mat4.fromQuat(this._rotation);

    mat4.multiply(translationMatrix, rotationMatrix, this._viewMatrix);
    this.updateUniformBuffer();
  }

  private updatePerspectiveMatrix(): void {
    mat4.perspective(utils.degToRad(this.fovY), this.aspectRatio, this.zNear, this.zFar, this._perspectiveMatrix);
    this.updateUniformBuffer();
  }

  private updateUniformBuffer(): void {
    const uboArray = new Float32Array([...this._viewMatrix, ...this._perspectiveMatrix]);
    this._context.queue.writeBuffer(this._uniformBuffer, 0, uboArray.buffer);
  }

  public rotateQuat(rotation: Quat): void {
    quat.multiply(rotation, this._rotation, this._rotation);
    this.updateViewMatrix();
  }

  public rotateEuler(angleX: number, angelY: number, angleZ: number): void {
    const tempQuat = quat.fromEuler(angleX, angelY, angleZ, 'xzy');
    this.rotateQuat(tempQuat);
  }
}
