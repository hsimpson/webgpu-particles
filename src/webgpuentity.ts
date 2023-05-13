import { Mat4, Quat, Vec3, mat4, quat, vec3 } from 'wgpu-matrix';
import WebGPUObjectBase from './webgpuobjectbase';

export default abstract class WebGPUEntity extends WebGPUObjectBase {
  private _modelMatrix = mat4.identity();
  private _position = vec3.create();
  private _scale: Vec3 = [1.0, 1.0, 1.0];
  private _rotation = quat.identity();

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public translate(translation: Vec3): void {
    vec3.add(this._position, translation, this._position);
    this.updateModelMatrix();
  }

  public rotateQuat(rotation: Quat): void {
    quat.multiply(rotation, this._rotation, this._rotation);
    this.updateModelMatrix();
  }

  public rotateEuler(angleX: number, angelY: number, angleZ: number): void {
    const tempQuat = quat.fromEuler(angleX, angelY, angleZ, 'xzy');
    this.rotateQuat(tempQuat);
  }

  public scale(scale: Vec3): void {
    vec3.multiply(this._scale, scale, this._scale);
    this.updateModelMatrix();
  }

  public get position(): Vec3 {
    return this._position;
  }

  public set position(newPos: Vec3) {
    this._position = newPos;
    this.updateModelMatrix();
  }

  protected updateModelMatrix(): void {
    const translationMatrix = mat4.translation(this._position);
    const rotationMatrix = mat4.fromQuat(this._rotation);
    const scaleMatrix = mat4.scaling(this._scale);

    mat4.multiply(translationMatrix, rotationMatrix, this._modelMatrix);
    mat4.multiply(this._modelMatrix, scaleMatrix, this._modelMatrix);
  }
}
