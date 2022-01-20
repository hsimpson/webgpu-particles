import WebGPURenderer from './webgpurenderer';
import Camera from './camera';
//import { TriangleGeometry } from './trianglegeometry';
import { BoxGeometry, BoxDimensions } from './boxgeometry';
import { CrossHairGeometry } from './crosshairgeometry';
import ParticleGeometry from './particlegeometry';
import WebGPUMesh from './webgpumesh';
import { vec2 } from 'gl-matrix';
import WebGPURenderPipeline from './webgpurenderpipeline';
import WebGPUComputePipline from './webgpucomputepipline';
import WebGPUMaterial from './webgpumaterial';

type FrameCallBackT = (frameTime: number, cpuTime: number) => void;

export default class ParticleRenderer {
  private _canvas: HTMLCanvasElement;
  private _renderer: WebGPURenderer;
  private _camera: Camera;
  private readonly _sampleCount = 4;

  /**/
  private _boxMesh: WebGPUMesh;
  private _crossHairMesh: WebGPUMesh;
  private _particleMesh: WebGPUMesh;
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
  private _frameDurationAvg = 0;
  private _cpuDurationAvg = 0;

  private _currentMousePos = vec2.create();

  private readonly _movementSpeed = 0.25;

  private _computePipeLine: WebGPUComputePipline;
  private _frameTimeCallback: FrameCallBackT;

  private _particleMaterial: WebGPUMaterial;

  public constructor(canvas: HTMLCanvasElement, particleCount: number, frameTimeCallback?: FrameCallBackT) {
    this._canvas = canvas;
    this._frameTimeCallback = frameTimeCallback;
    this._canvas.width = this._canvas.offsetWidth * window.devicePixelRatio;
    this._canvas.height = this._canvas.offsetHeight * window.devicePixelRatio;

    this._camera = new Camera(45, this._canvas.width / this._canvas.height, 0.1, 1000);
    this._camera.position = [0, 0, 15];
    //this._camera.position = [10, 5, 15];
    this._camera.updateMatrices();

    this._renderer = new WebGPURenderer(this._canvas, this._camera, { sampleCount: this._sampleCount });

    const basicFragmentShaderUrl = './assets/shaders/basic.frag.wgsl';
    const basicVertexShaderUrl = './assets/shaders/basic.vert.wgsl';
    const computeShaderUrl = './assets/shaders/particle.comp.wgsl';
    const particleVertexShaderUrl = './assets/shaders/particle.vert.wgsl';
    const particleFragmenShaderUrl = './assets/shaders/particle.frag.wgsl';

    const boxPipeline = new WebGPURenderPipeline({
      primitiveTopology: 'line-list',
      sampleCount: this._sampleCount,
      vertexShaderUrl: basicVertexShaderUrl,
      fragmentShaderUrl: basicFragmentShaderUrl,
    });
    boxPipeline.name = 'boxPipeline';

    const crossHairPipeline = new WebGPURenderPipeline({
      primitiveTopology: 'line-list',
      sampleCount: this._sampleCount,
      vertexShaderUrl: basicVertexShaderUrl,
      fragmentShaderUrl: basicFragmentShaderUrl,
    });
    crossHairPipeline.name = 'crossHairPipeline';

    const particlePipeline = new WebGPURenderPipeline({
      primitiveTopology: 'point-list',
      sampleCount: this._sampleCount,
      vertexShaderUrl: particleVertexShaderUrl,
      fragmentShaderUrl: particleFragmenShaderUrl,
    });
    particlePipeline.name = 'pointPipeline';

    /**/
    this._boxMesh = new WebGPUMesh(BoxGeometry, boxPipeline);
    this._boxMesh.name = 'BoxMesh';
    this._crossHairMesh = new WebGPUMesh(CrossHairGeometry, crossHairPipeline);
    this._crossHairMesh.name = 'CrossHairMesh';

    this._particleMaterial = new WebGPUMaterial([1.0, 0.0, 1.0, 0.5]);
    this._particleMesh = new WebGPUMesh(
      new ParticleGeometry(particleCount, 4),
      particlePipeline,
      this._particleMaterial
    );
    this._particleMesh.name = 'ParticleMesh';

    this._renderer.addMesh(this._boxMesh);
    this._renderer.addMesh(this._crossHairMesh);
    this._renderer.addMesh(this._particleMesh);
    /**/

    this._computePipeLine = new WebGPUComputePipline(this._particleMesh, {
      computeShaderUrl,
      particleCount: particleCount,
    });
    this._computePipeLine.name = 'Compute pipeLine';

    this._renderer.setComputePipeLine(this._computePipeLine);

    /*/
    const trianglePipeline = new WebGPURenderPipeline(this._camera, {
      primitiveTopology: 'triangle-list',
      sampleCount: this._sampleCount,
      vertexShaderUrl: 'basic.vert.wgsl',
      fragmentShaderUrl: 'basic.frag.wgsl',
    });
    this._triangleMesh1 = new WebGPUMesh(TriangleGeometry, trianglePipeline);
    this._triangleMesh2 = new WebGPUMesh(TriangleGeometry, trianglePipeline);
    this._triangleMesh3 = new WebGPUMesh(TriangleGeometry, trianglePipeline);
    this._triangleMesh4 = new WebGPUMesh(TriangleGeometry, trianglePipeline);
    this._triangleMesh1.translate([-2, 2, 0]);
    this._triangleMesh2.translate([2, 2, 0]);
    this._triangleMesh3.translate([-2, -2, 0]);
    this._triangleMesh4.translate([2, -2, 0]);

    this._renderer.addMesh(this._triangleMesh1);
    this._renderer.addMesh(this._triangleMesh2);
    this._renderer.addMesh(this._triangleMesh3);
    this._renderer.addMesh(this._triangleMesh4);
    /**/
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
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyup);
        this._currentTime = performance.now();
        this.render();
      },
      (error) => {
        console.error(error);
        // no WebGPU support
      }
    );
  }

  private render = (): void => {
    const beginFrameTime = performance.now();
    const duration = beginFrameTime - this._currentTime;
    this._currentTime = beginFrameTime;

    if (this._frameTimeCallback) {
      this._frameCount++;

      this._frameDurationAvg += duration;

      if (this._frameDurationAvg > 1000) {
        const avgFrameTime = this._frameDurationAvg / this._frameCount;
        const avgCpuTime = this._cpuDurationAvg / this._frameCount;
        this._frameCount = 0;
        this._frameDurationAvg = 0;
        this._cpuDurationAvg = 0;
        this._frameTimeCallback(avgFrameTime, avgCpuTime);
        /*
        this._frameTimeEl.innerHTML = `Avg frame time: ${avgFrameTime.toFixed(3)} ms<br>FPS: ${(
          1000 / avgFrameTime
        ).toFixed(2)}`;
        */
      }
    }

    /*/
    this._triangleMesh1.rotateEuler(0, 0, duration * this._triangleRotation);
    this._triangleMesh2.rotateEuler(0, 0, duration * this._triangleRotation * -1.5);
    this._triangleMesh3.rotateEuler(0, 0, duration * this._triangleRotation * 2);
    this._triangleMesh4.rotateEuler(0, 0, duration * this._triangleRotation * -2.5);
    /**/

    this._renderer.render(duration);

    window.requestAnimationFrame(this.render);
    const endFrameTime = performance.now();
    this._cpuDurationAvg += endFrameTime - beginFrameTime;
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

  private onKeyDown = (event: KeyboardEvent): void => {
    const newPosition = this._crossHairMesh.position;
    let x = newPosition[0];
    let y = newPosition[1];
    let z = newPosition[2];

    switch (event.key) {
      case 'a':
        x -= this._movementSpeed;
        break;
      case 'd':
        x += this._movementSpeed;
        break;
      case 'w':
        z -= this._movementSpeed;
        break;
      case 's':
        z += this._movementSpeed;
        break;
      case 'PageUp':
        y += this._movementSpeed;
        break;
      case 'PageDown':
        y -= this._movementSpeed;
        break;

      case ' ':
        this._computePipeLine.turnForceOn();
        return;

      default:
        return;
    }

    const epsilon = 0.001;
    const halfx = BoxDimensions[0] / 2 + epsilon;
    const halfy = BoxDimensions[1] / 2 + epsilon;
    const halfz = BoxDimensions[2] / 2 + epsilon;

    if (x < -halfx || x > halfx) {
      x = this._crossHairMesh.position[0];
    }
    if (y < -halfy || y > halfy) {
      y = this._crossHairMesh.position[1];
    }
    if (z < -halfz || z > halfz) {
      z = this._crossHairMesh.position[2];
    }

    this._crossHairMesh.position = [x, y, z];
    this._computePipeLine.forcePostion = [x, y, z];
  };

  private onKeyup = (event: KeyboardEvent): void => {
    switch (event.key) {
      case ' ':
        this._computePipeLine.turnForceOff();
        break;

      default:
        break;
    }
  };

  public get computePipline(): WebGPUComputePipline {
    return this._computePipeLine;
  }

  public get particleMaterial(): WebGPUMaterial {
    return this._particleMaterial;
  }
}
