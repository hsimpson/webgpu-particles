import './style.css';
//import ParticelRenderer from './particelrenderer';
import WebGPURenderer from './webgpurenderer';
import Camera from './camera';
import ResizeObserver from 'resize-observer-polyfill';
//import { TriangleGeometry } from './trianglegeometry';
import { BoxGeometry } from './boxgeometry';
import { CrossHairGeometry } from './crosshairgeometry';
import WebGPUMesh from './webgpumesh';
import { vec2 } from 'gl-matrix';

export default class ParticleRenderer {
  private _canvas: HTMLCanvasElement;
  private _renderer: WebGPURenderer;
  private _camera: Camera;

  /**/
  private _boxMesh: WebGPUMesh;
  private _crossHairMesh: WebGPUMesh;
  /**/

  /*/
  private _triangleMesh1: WebGPUMesh;
  private _triangleMesh2: WebGPUMesh;
  private _triangleMesh3: WebGPUMesh;
  private _triangleMesh4: WebGPUMesh;
  private readonly _triangleRotation = 0.05;
  /**/

  private _currentTime = 0;
  private _frameCount = 0;
  private _durationAvg = 0;
  private _frameTimeEl: HTMLElement;

  private _currentMousePos = vec2.create();

  public constructor() {
    this._canvas = document.getElementById('webgpu_canvas') as HTMLCanvasElement;
    this._canvas.width = this._canvas.offsetWidth * window.devicePixelRatio;
    this._canvas.height = this._canvas.offsetHeight * window.devicePixelRatio;
    this._renderer = new WebGPURenderer(this._canvas);

    this._camera = new Camera(45, this._canvas.width / this._canvas.height, 0.1, 1000);
    this._camera.position = [0, 0, 10];
    this._camera.updateMatrices();

    /**/
    this._boxMesh = new WebGPUMesh(BoxGeometry);
    this._crossHairMesh = new WebGPUMesh(CrossHairGeometry);

    this._renderer.addMesh(this._boxMesh);
    this._renderer.addMesh(this._crossHairMesh);
    /**/

    /*/
    this._triangleMesh1 = new WebGPUMesh(TriangleGeometry);
    this._triangleMesh2 = new WebGPUMesh(TriangleGeometry);
    this._triangleMesh3 = new WebGPUMesh(TriangleGeometry);
    this._triangleMesh4 = new WebGPUMesh(TriangleGeometry);
    this._triangleMesh1.translate([-2, 2, 0]);
    this._triangleMesh2.translate([2, 2, 0]);
    this._triangleMesh3.translate([-2, -2, 0]);
    this._triangleMesh4.translate([2, -2, 0]);

    this._renderer.addMesh(this._triangleMesh1);
    this._renderer.addMesh(this._triangleMesh2);
    this._renderer.addMesh(this._triangleMesh3);
    this._renderer.addMesh(this._triangleMesh4);
    /**/

    this._frameTimeEl = document.getElementById('frameinfo');
  }

  public start(): void {
    this._renderer.start().then(
      () => {
        const ro = new ResizeObserver((entries) => {
          if (!Array.isArray(entries)) {
            return;
          }

          const w = entries[0].contentRect.width * window.devicePixelRatio;
          const h = entries[0].contentRect.height * window.devicePixelRatio;
          this._canvas.width = w;
          this._canvas.height = h;

          this._camera.aspectRatio = w / h;
          this._camera.updateMatrices();
          this._renderer.resize();
        });
        ro.observe(this._canvas);

        this._canvas.addEventListener('wheel', this.onMouseWheel);
        this._canvas.addEventListener('mousemove', this.onMouseMove);
        this.render();
      },
      (error) => {
        console.error(error);
        // no WebGPU support
        this._canvas.style.display = 'none';
        const errorEl = document.getElementById('error');
        errorEl.style.display = 'block';
      }
    );
  }

  private render = (): void => {
    this._frameCount++;
    const now = performance.now();
    const duration = now - this._currentTime;
    this._durationAvg += duration;
    this._currentTime = now;

    if (this._durationAvg > 1000) {
      const avgFrameTime = this._durationAvg / this._frameCount;
      this._frameCount = 0;
      this._durationAvg = 0;
      this._frameTimeEl.innerHTML = `Avg frame time: ${avgFrameTime.toFixed(3)} ms<br>FPS: ${(
        1000 / avgFrameTime
      ).toFixed(2)}`;
    }

    /*/
    this._triangleMesh1.rotateEuler(0, 0, duration * this._triangleRotation);
    this._triangleMesh2.rotateEuler(0, 0, duration * this._triangleRotation * -1.5);
    this._triangleMesh3.rotateEuler(0, 0, duration * this._triangleRotation * 2);
    this._triangleMesh4.rotateEuler(0, 0, duration * this._triangleRotation * -2.5);
    /**/

    this._renderer.render(this._camera);

    requestAnimationFrame(this.render);
  };

  private onMouseWheel = (event: WheelEvent): void => {
    let z = (this._camera.position[2] += event.deltaY * 0.02);
    z = Math.max(this._camera.zNear, Math.min(this._camera.zFar, z));
    this._camera.position[2] = z;
    this._camera.updateMatrices();
  };

  private onMouseMove = (event: MouseEvent): void => {
    const currentPos: vec2 = [event.clientX, event.clientY];
    if (event.buttons === 1) {
      let offset = vec2.create();
      offset = vec2.subtract(offset, currentPos, this._currentMousePos);
      offset = vec2.scale(offset, offset, 0.2);

      //console.log(offset);

      this._camera.rotateEuler(0.0, offset[0], 0.0);
      this._camera.rotateEuler(offset[1], 0.0, 0.0);
    }
    this._currentMousePos = currentPos;
  };
}
