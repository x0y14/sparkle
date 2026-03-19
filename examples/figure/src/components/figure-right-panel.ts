import { defineElement, css, useState, useHost, useEffect } from '@sparkio/core';

defineElement(
  {
    tag: 'figure-right-panel',
    styles: css`
      @unocss-placeholder
      :host {
        @apply "flex items-center justify-center absolute right-2 z-20";
        top: 50%;
        transform: translateY(-50%);
      }
      .panel {
        @apply "rounded-3xl w-60 max-h-[70vh] overflow-y-auto p-4";
        background-color: #2d2d44;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        transition: width 0.25s ease, opacity 0.2s ease, padding 0.25s ease;
      }
      .panel.collapsed {
        width: 2.5rem;
        @apply "overflow-hidden";
        padding: 16px 8px;
      }
      .panel.collapsed .panel-content {
        @apply "opacity-0 pointer-events-none";
      }
      .toggle-btn {
        @apply "w-6 h-6 border-none cursor-pointer text-sm flex items-center justify-center rounded";
        background-color: transparent;
        color: #aaa;
      }
      .toggle-btn:hover {
        background-color: #3a3a5c;
      }
      .panel-header {
        @apply "flex justify-between items-center mb-3";
      }
      .panel-title {
        @apply "text-xs font-semibold uppercase";
        color: #aaa;
      }
      .section {
        @apply "mb-4";
      }
      .section-title {
        @apply "mb-2";
        color: #888;
        font-size: 11px;
      }
      label {
        @apply "text-xs block mb-1";
        color: #ccc;
      }
      input[type='number'],
      input[type='color'] {
        @apply "border rounded-md text-xs w-full box-border";
        background-color: #1a1a2e;
        border-color: #3a3a5c;
        color: #e0e0e0;
        padding: 4px 8px;
      }
      .row {
        @apply "flex gap-2";
      }
      .row > * {
        @apply "flex-1";
      }
    `,
  },
  () => {
    const [collapsed, setCollapsed] = useState(false);
    const hostRef = useHost();

    useEffect(() => {
      const root = hostRef.current.shadowRoot;
      if (!root) return;
      const btn = root.querySelector('.toggle-btn');
      if (!btn) return;
      const handler = () => setCollapsed((prev: boolean) => !prev);
      btn.addEventListener('click', handler);
      return () => btn.removeEventListener('click', handler);
    }, []);

    return `
      <div class="panel ${collapsed ? 'collapsed' : ''}">
        <div class="panel-header">
          ${collapsed ? '' : '<span class="panel-title">Properties</span>'}
          <button class="toggle-btn">${collapsed ? '\u25C0' : '\u25B6'}</button>
        </div>
        <div class="panel-content">
          <div class="section">
            <div class="section-title">Position</div>
            <div class="row">
              <div><label>X</label><input type="number" value="0" /></div>
              <div><label>Y</label><input type="number" value="0" /></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Size</div>
            <div class="row">
              <div><label>W</label><input type="number" value="100" /></div>
              <div><label>H</label><input type="number" value="100" /></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Fill</div>
            <input type="color" value="#3498db" />
          </div>
        </div>
      </div>
    `;
  }
);
