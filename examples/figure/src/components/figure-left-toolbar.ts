import { defineElement, css, useHost, useEffect } from '@sparkio/core';

defineElement(
  {
    tag: 'figure-left-toolbar',
    styles: css`
      @unocss-placeholder
      :host {
        @apply "flex flex-col items-center w-12 py-2 gap-1 z-20 box-border";
        background-color: #2d2d44;
        border-right: 1px solid #3a3a5c;
      }
    `,
  },
  () => {
    const hostRef = useHost();

    useEffect(() => {
      const root = hostRef.current.shadowRoot;
      if (!root) return;

      const plusBtn = root.querySelector('[data-action="add-rect"]');
      if (!plusBtn) return;

      const handler = () => {
        window.dispatchEvent(new CustomEvent('figure:add-rect'));
      };
      plusBtn.addEventListener('click', handler);
      return () => plusBtn.removeEventListener('click', handler);
    }, []);

    return `
      <figure-tool-button icon="pointer" tooltip="Select (V)"></figure-tool-button>
      <figure-tool-button icon="rectangle" tooltip="Rectangle (R)"></figure-tool-button>
      <figure-tool-button icon="hand" tooltip="Pan (H)"></figure-tool-button>
      <span class="flex-1"></span>
      <figure-tool-button icon="plus" tooltip="Add Rectangle" data-action="add-rect"></figure-tool-button>
    `;
  }
);
