export default class WebGPURenderContext {
  private _canvas: HTMLCanvasElement;
  private _device: GPUDevice;
  private _queue: GPUQueue;

  public constructor(canvas: HTMLCanvasElement, device: GPUDevice, queue: GPUQueue) {
    this._canvas = canvas;
    this._device = device;
    this._queue = queue;
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  public get device(): GPUDevice {
    return this._device;
  }

  public get queue(): GPUQueue {
    return this._queue;
  }
}
