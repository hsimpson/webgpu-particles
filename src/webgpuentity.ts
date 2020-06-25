import WebGPUObjectBase from './webgpuobjectbase';
import { mat4, vec3, quat } from 'gl-matrix';

export default abstract class WebGPUEntity extends WebGPUObjectBase {
  private _modelMatrix = mat4.create();
  private _position = vec3.create();
  private _scale: vec3 = [1.0, 1.0, 1.0];
  private _rotation = quat.create();

  public get modelMatrix(): mat4 {
    return this._modelMatrix;
  }

  public translate(translation: vec3): void {
    this._position = vec3.add(this._position, this._position, translation);
    this.updateModelMatrix();
  }

  public rotateQuat(rotation: quat): void {
    this._rotation = quat.multiply(this._rotation, this._rotation, rotation);
    this.updateModelMatrix();
  }

  public rotateEuler(angleX: number, angelY: number, angleZ: number): void {
    let tempQuat = quat.create();
    tempQuat = quat.fromEuler(tempQuat, angleX, angelY, angleZ);
    this.rotateQuat(tempQuat);
  }

  public scale(scale: vec3): void {
    this._scale = vec3.multiply(this._scale, this._scale, scale);
    this.updateModelMatrix();
  }

  public get position(): vec3 {
    return this._position;
  }

  public set position(newPos: vec3) {
    this._position = newPos;
    this.updateModelMatrix();
  }

  protected updateModelMatrix(): void {
    const translationMatrix = mat4.create();
    const rotationMatrix = mat4.create();
    const scaleMatrix = mat4.create();
    const tempMat = mat4.create();

    mat4.translate(translationMatrix, translationMatrix, this._position);
    mat4.fromQuat(rotationMatrix, this._rotation);
    mat4.scale(scaleMatrix, scaleMatrix, this._scale);

    mat4.multiply(tempMat, translationMatrix, rotationMatrix);
    this._modelMatrix = mat4.multiply(this._modelMatrix, tempMat, scaleMatrix);
  }
}
