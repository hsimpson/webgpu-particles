import './style.css';
//import ParticelRenderer from './particelrenderer';
import WebGPURenderer from './webgpurenderer';
import Camera from './camera';
import ResizeObserver from 'resize-observer-polyfill';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import { VERTEXARRAYINTERLEAVED, INDICES } from './triangledata';

//import WebGPUGeometry from './webgpugeometry';
//import { POSARRAY, COLORARRAY, INDICES } from './triangledata';

import WebGPUMesh from './webgpumesh';
import { vec2 } from 'gl-matrix';

const canvas: HTMLCanvasElement = document.getElementById('webgpu_canvas') as HTMLCanvasElement;
canvas.width = canvas.offsetWidth * window.devicePixelRatio;
canvas.height = canvas.offsetHeight * window.devicePixelRatio;

/*
const renderer = new ParticelRenderer(canvas);
renderer.start();
*/

const renderer = new WebGPURenderer(canvas);

const camera = new Camera(45, canvas.width / canvas.height, 0.1, 1000);
camera.position = [0, 0, 10];
camera.updateMatrices();

const triangleGeometry = new WebGPUInterleavedGeometry();
triangleGeometry.setVertices(VERTEXARRAYINTERLEAVED, 4 * 8);
triangleGeometry.setIndices(INDICES);
triangleGeometry.addAttribute({ shaderLocation: 0, offset: 0, format: 'float4' });
triangleGeometry.addAttribute({ shaderLocation: 1, offset: 4 * Float32Array.BYTES_PER_ELEMENT, format: 'float4' });

/*
const triangleGeometry = new WebGPUGeometry(3);
triangleGeometry.setIndices(INDICES);
triangleGeometry.addAttribute({
  array: POSARRAY,
  stride: 4 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 0, offset: 0, format: 'float4' },
});
triangleGeometry.addAttribute({
  array: COLORARRAY,
  stride: 4 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 1, offset: 0, format: 'float4' },
});
*/

const triangleMesh1 = new WebGPUMesh(triangleGeometry);
const triangleMesh2 = new WebGPUMesh(triangleGeometry);
const triangleMesh3 = new WebGPUMesh(triangleGeometry);
const triangleMesh4 = new WebGPUMesh(triangleGeometry);
triangleMesh1.translate([-2, 2, 0]);
triangleMesh2.translate([2, 2, 0]);
triangleMesh3.translate([-2, -2, 0]);
triangleMesh4.translate([2, -2, 0]);

renderer.addMesh(triangleMesh1);
renderer.addMesh(triangleMesh2);
renderer.addMesh(triangleMesh3);
renderer.addMesh(triangleMesh4);

let time = 0;
let framecount = 0;
let durationAvg = 0;
const framtimeEl = document.getElementById('frameinfo');
const rotation = 0.05;
let currentMousePos = vec2.create();

const render = (): void => {
  framecount++;
  const now = performance.now();
  const duration = now - time;
  durationAvg += duration;
  time = now;

  if (durationAvg > 1000) {
    const avgFrameTime = durationAvg / framecount;
    framecount = 0;
    durationAvg = 0;
    framtimeEl.innerHTML = `Avg frame time: ${avgFrameTime.toFixed(3)} ms<br>FPS: ${(1000 / avgFrameTime).toFixed(2)}`;
  }

  triangleMesh1.rotateEuler(0, 0, duration * rotation);
  triangleMesh2.rotateEuler(0, 0, duration * rotation * -1.5);
  triangleMesh3.rotateEuler(0, 0, duration * rotation * 2);
  triangleMesh4.rotateEuler(0, 0, duration * rotation * -2.5);
  renderer.render(camera);

  requestAnimationFrame(render);
};

const onMouseWheel = (event: WheelEvent): void => {
  let z = (camera.position[2] += event.deltaY * 0.01);
  z = Math.max(camera.zNear, Math.min(camera.zFar, z));
  camera.position[2] = z;
  camera.updateMatrices();
};

const onMouseMove = (event: MouseEvent): void => {
  const currentPos: vec2 = [event.clientX, event.clientY];
  if (event.buttons === 1) {
    let offset = vec2.create();
    offset = vec2.subtract(offset, currentPos, currentMousePos);
    offset = vec2.scale(offset, offset, 0.1);

    //console.log(offset);

    camera.rotateEuler(0.0, offset[0], 0.0);
    camera.rotateEuler(offset[1], 0.0, 0.0);
  }
  currentMousePos = currentPos;
};

renderer.start().then(
  () => {
    const ro = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }

      const w = entries[0].contentRect.width * window.devicePixelRatio;
      const h = entries[0].contentRect.height * window.devicePixelRatio;
      canvas.width = w;
      canvas.height = h;

      camera.aspectRatio = w / h;
      camera.updateMatrices();
      renderer.resize();
    });
    ro.observe(canvas);

    canvas.addEventListener('wheel', onMouseWheel);
    canvas.addEventListener('mousemove', onMouseMove);
    render();
  },
  (error) => {
    console.error(error);
    // no WebGPU support
    canvas.style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.style.display = 'block';
  }
);
