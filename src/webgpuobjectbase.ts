export default abstract class WebGPUObjectBase {
  private _name = '';

  public set name(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }
}
