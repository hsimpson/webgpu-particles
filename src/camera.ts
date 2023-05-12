import { mat4, vec3 } from 'wgpu-matrix';
import type Mat4 from 'wgpu-matrix/dist/2.x/mat4-impl';
import { degToRad } from 'wgpu-matrix/dist/2.x/utils';
import type Vec3 from 'wgpu-matrix/dist/2.x/vec3-impl';
import { createBuffer } from './webgpuhelpers';
import WebGPURenderContext from './webgpurendercontext';

export default class Camera {
  private _perspectiveMatrix: Mat4 = mat4.identity();
  private _viewMatrix = mat4.identity();
  private _rotation = quat.create();

  private _uniformBuffer: GPUBuffer;
  /*
  private _uniformBindGroupLayout: GPUBindGroupLayout;
  private _uniformBindGroup: GPUBindGroup;
  */
  private _initialized = false;
  private _context: WebGPURenderContext;

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
    this.updateMatrices();
  }

  public initalize(context: WebGPURenderContext): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    this._context = context;

    const uboArray = new Float32Array([...this._viewMatrix, ...this._perspectiveMatrix]);
    this._uniformBuffer = createBuffer(context.device, uboArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
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
    const translationMatrix = mat4.create();
    const rotationMatrix = mat4.create();

    mat4.lookAt(translationMatrix, this.position, this.target, this.up);
    mat4.fromQuat(rotationMatrix, this._rotation);

    this._viewMatrix = mat4.multiply(this._viewMatrix, translationMatrix, rotationMatrix);
    this.updateUniformBuffer();
  }

  private updatePerspectiveMatrix(): void {
    this._perspectiveMatrix = mat4.perspective(
      this._perspectiveMatrix,
      degToRad(this.fovY),
      this.aspectRatio,
      this.zNear,
      this.zFar
    );
    this.updateUniformBuffer();
  }

  private updateUniformBuffer(): void {
    if (this._initialized) {
      const uboArray = new Float32Array([...this._viewMatrix, ...this._perspectiveMatrix]);
      this._context.queue.writeBuffer(this._uniformBuffer, 0, uboArray.buffer);
    }
  }

  public rotateQuat(rotation: quat): void {
    this._rotation = quat.multiply(this._rotation, rotation, this._rotation);
    this.updateViewMatrix();
  }

  public rotateEuler(angleX: number, angelY: number, angleZ: number): void {
    let tempQuat = quat.create();
    tempQuat = quat.fromEuler(tempQuat, angleX, angelY, angleZ);
    this.rotateQuat(tempQuat);
  }
}
