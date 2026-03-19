import { defineElement, css, useHost, useEffect } from '@sparkio/core';
import { getGPUDevice, initGPUContext } from '../lib/gpu/device';
import { FigureStore } from '../lib/figures/figure-store';
import { Scene } from '../lib/scene/scene';

defineElement(
  {
    tag: 'figure-canvas',
    styles: css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  },
  () => {
    const hostRef = useHost();

    useEffect(() => {
      const root = hostRef.current.shadowRoot;
      if (!root) return;

      const canvas = root.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      let scene: Scene | null = null;
      let resizeObserver: ResizeObserver | null = null;

      const init = async () => {
        try {
          const device = await getGPUDevice();
          const gpu = initGPUContext(canvas, device);
          const store = new FigureStore();

          // Size canvas to container
          const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
          };
          resize();

          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(canvas);

          scene = new Scene(canvas, gpu, store);
        } catch (e) {
          console.error('WebGPU initialization failed:', e);
        }
      };

      init();

      return () => {
        scene?.destroy();
        resizeObserver?.disconnect();
      };
    }, []);

    return `<canvas></canvas>`;
  }
);
