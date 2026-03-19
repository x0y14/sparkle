import { defineElement, css } from '@sparkio/core';

defineElement(
  {
    tag: 'figure-header',
    styles: css`
      @unocss-placeholder
      :host {
        @apply "flex items-center h-12 px-4 gap-3 z-20 box-border";
        background-color: #2d2d44;
        border-bottom: 1px solid #3a3a5c;
      }
      .filename:hover {
        background-color: #3a3a5c;
      }
    `,
  },
  () => {
    return `
      <span class="logo font-bold text-sm text-accent select-none">Figure</span>
      <span class="w-px h-6 bg-border"></span>
      <span class="filename text-xs text-muted px-2 py-1 rounded">Untitled</span>
      <span class="flex-1"></span>
      <figure-tool-button icon="grid" tooltip="Toggle Grid"></figure-tool-button>
    `;
  }
);
