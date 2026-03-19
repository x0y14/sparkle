import { defineElement, css } from '@sparkio/core';

const ICONS: Record<string, string> = {
  pointer: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1l10 7-4 1-2 5z"/></svg>`,
  rectangle: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/></svg>`,
  hand: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a1 1 0 011 1v5h1V4a1 1 0 112 0v4h1V5a1 1 0 112 0v6a4 4 0 01-4 4H9a4 4 0 01-3-1.5L3.5 10a1 1 0 011.5-1L6 10V2a1 1 0 011-1z"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`,
  grid: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/></svg>`,
};

defineElement(
  {
    tag: 'figure-tool-button',
    props: {
      icon: { type: String },
      tooltip: { type: String },
      active: { type: Boolean, reflect: true },
    },
    styles: css`
      @unocss-placeholder
      :host {
        @apply "inline-flex";
      }
      button {
        @apply "w-8 h-8 flex items-center justify-center border-none rounded-md cursor-pointer text-base";
        background-color: transparent;
        color: #aaa;
        transition: background 0.15s;
      }
      button:hover {
        background-color: #3a3a5c;
        color: #fff;
      }
      :host([active]) button {
        background: #4a4a6a;
        color: #fff;
      }
    `,
  },
  (props) => {
    const iconHtml = ICONS[props.icon] || '';
    return `<button title="${props.tooltip || ''}">${iconHtml}</button>`;
  }
);
