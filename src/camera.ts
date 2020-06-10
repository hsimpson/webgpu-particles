import { vec3, mat4, quat, glMatrix } from 'gl-matrix';

export default class Camera {
  private _perspectiveMatrix = mat4.create();
  private _viewMatrix = mat4.create();
  private _rotation = quat.create();
  public position: vec3 = vec3.create();
  public target: vec3 = vec3.create();
  public up: vec3 = [0, 1, 0];
  public fovY = 45.0;
  public aspectRatio = 1.0;
  public zNear = 0.1;
  public zFar = 1000;
  public needsUpdate = false;

  public constructor(fovY: number, aspectRatio: number, zNear: number, zFar: number) {
    this.fovY = fovY;
    this.aspectRatio = aspectRatio;
    this.zNear = zNear;
    this.zFar = zFar;
    this.updateMatrices();
  }

  public get viewMatrix(): mat4 {
    return this._viewMatrix;
  }

  public get perspectiveMatrix(): mat4 {
    return this._perspectiveMatrix;
  }

  public updateMatrices(): void {
    this.updateViewMatrix();
    this.updatePerspectiveMatrix();
  }

  private updateViewMatrix(): void {
    const translationMatrix = mat4.create();
    const rotationMatrix = mat4.create();

    //mat4.translate(translationMatrix, translationMatrix, this.position);
    mat4.lookAt(translationMatrix, this.position, this.target, this.up);
    mat4.fromQuat(rotationMatrix, this._rotation);

    this._viewMatrix = mat4.multiply(this._viewMatrix, translationMatrix, rotationMatrix);

    this.needsUpdate = true;
  }

  private updatePerspectiveMatrix(): void {
    this._perspectiveMatrix = mat4.perspective(
      this._perspectiveMatrix,
      glMatrix.toRadian(this.fovY),
      this.aspectRatio,
      this.zNear,
      this.zFar
    );
    this.needsUpdate = true;
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
