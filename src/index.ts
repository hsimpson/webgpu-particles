import './style.css';
//import ParticelRenderer from './particelrenderer';
import WebGPURenderer from './webgpurenderer';
import Camera from './camera';
import ResizeObserver from 'resize-observer-polyfill';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
import WebGPUGeometry from './webgpugeometry';
import { VERTEXARRAYINTERLEAVED, POSARRAY, COLORARRAY, INDICES } from './triangledata';
import WebGPUMesh from './webgpumesh';

const canvas: HTMLCanvasElement = document.getElementById('webgpu_canvas') as HTMLCanvasElement;
canvas.width = canvas.offsetWidth * window.devicePixelRatio;
canvas.height = canvas.offsetHeight * window.devicePixelRatio;

/*
const renderer = new ParticelRenderer(canvas);
renderer.start();
*/

const renderer = new WebGPURenderer(canvas);

const camera = new Camera(45, canvas.width / canvas.height, 0.1, 1000);
camera.position = [0, 0, 5];
camera.updateMatrices();

const triangleGeometry = new WebGPUInterleavedGeometry();
triangleGeometry.setVertices(VERTEXARRAYINTERLEAVED, 4 * 8);
triangleGeometry.setIndices(INDICES);
triangleGeometry.addAttribute({ shaderLocation: 0, offset: 0, format: 'float4' });
triangleGeometry.addAttribute({ shaderLocation: 1, offset: 4 * Float32Array.BYTES_PER_ELEMENT, format: 'float4' });

/*
const triangleGeometry = new WebGPUGeometry(3);
//triangleGeometry.setIndices(INDICES);
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

const triangleMesh = new WebGPUMesh(triangleGeometry);

const render = (): void => {
  triangleMesh.rotateEuler(0, 0, 0.5);
  renderer.render(camera);

  requestAnimationFrame(render);
};

renderer.addMesh(triangleMesh);

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

    canvas.addEventListener('wheel', (event: WheelEvent) => {
      let z = (camera.position[2] += event.deltaY * 0.01);
      z = Math.max(camera.zNear, Math.min(camera.zFar, z));
      camera.position[2] = z;
      camera.updateMatrices();
    });
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
