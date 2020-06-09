import './style.css';
//import ParticelRenderer from './particelrenderer';
import WebGPURenderer from './webgpurenderer';
import Camera from './camera';
import ResizeObserver from 'resize-observer-polyfill';

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

const render = (): void => {
  renderer.render(camera);

  requestAnimationFrame(render);
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
