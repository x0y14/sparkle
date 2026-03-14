# Black

A hooks-based Web Components library optimized for Astro and utility-first CSS.

## Concept

### Hooks-Based Component Model (@blask/core)

Black brings React-like hooks (`useState`, `useEffect`, `useRef`, etc.) to Web Components. Components are defined with `defineElement()` — a single function that takes options (tag name, props schema, styles) and a render function returning an HTML string. There is no JSX and no custom template syntax — just plain HTML strings. Efficient DOM updates are handled by a built-in morphing algorithm rather than full re-renders.

### Utility-First CSS in Shadow DOM (@blask/vite)

Shadow DOM encapsulates styles, which normally blocks utility CSS frameworks from reaching component internals. Black's Vite plugin solves this by injecting UnoCSS-generated styles into each component's Shadow DOM via the `@unocss-placeholder` marker. It also supports `@apply` directive resolution and HMR.

### Astro-First SSR (@blask/astro)

Black provides an Astro integration with server-side rendering via Declarative Shadow DOM (DSD). Components render to HTML with `<template shadowrootmode="open">` on the server, and client-side hydration restores interactivity. It works with Astro's template directives (`client:load`, `client:visible`, etc.).

## What You Can Build

The `examples/ec/` directory contains a full e-commerce storefront built entirely with Black components, demonstrating:

- Reactive UI components with local state (`useState`, `useEffect`)
- Two-way prop binding with attribute reflection (`useProp`)
- Custom event communication between components (`useEvent`)
- Cross-component shared state via Context API (`createContext`, `useContext`)
- Server-side rendered Web Components with Declarative Shadow DOM
- UnoCSS utility classes working seamlessly inside Shadow DOM

## Usage

### Defining a Component

A minimal greeting component using `defineElement`, `useState`, `useHost`, `useEffect`, and `css`:

```typescript
import { defineElement, useState, useHost, useEffect, css } from "@blask/core";

const HelloMessage = defineElement(
  {
    tag: "hello-message",
    props: {
      name: { type: String, reflect: true },
    },
    styles: css`
      @unocss-placeholder
      :host { display: block; }
    `,
  },
  (props) => {
    const [visible, setVisible] = useState(true);
    const host = useHost();

    useEffect(() => {
      const root = host.current.shadowRoot!;
      const handler = () => setVisible((v) => !v);
      root.addEventListener("click", handler);
      return () => root.removeEventListener("click", handler);
    }, []);

    return `
      <div class="p-4">
        ${visible ? `<p>Hello, ${props.name}!</p>` : `<p>Goodbye!</p>`}
        <button>Toggle</button>
      </div>`;
  },
);

export default HelloMessage;
```

### Props and Custom Events

Use `useProp` for two-way binding and `useEvent` for dispatching custom events:

```typescript
import { defineElement, useProp, useEvent, useHost, useEffect, css } from "@blask/core";

const StarRating = defineElement(
  {
    tag: "star-rating",
    props: {
      value: { type: Number, reflect: true, value: () => 0 },
      max: { type: Number, value: () => 5 },
    },
    styles: css`@unocss-placeholder`,
  },
  (props) => {
    const [value, setValue] = useProp<number>("value");
    const dispatch = useEvent<number>("rate", { bubbles: true, composed: true });
    const host = useHost();

    useEffect(() => {
      const root = host.current.shadowRoot!;
      const handler = (e: Event) => {
        const star = (e.target as HTMLElement).closest("[data-star]");
        if (!star) return;
        const next = Number(star.getAttribute("data-star"));
        setValue(next);
        dispatch(next);
      };
      root.addEventListener("click", handler);
      return () => root.removeEventListener("click", handler);
    }, [value]);

    const stars = Array.from({ length: props.max }, (_, i) =>
      `<span data-star="${i + 1}" class="cursor-pointer">${i < value ? "★" : "☆"}</span>`
    ).join("");

    return `<div class="inline-flex gap-1 text-xl">${stars}</div>`;
  },
);

export default StarRating;
```

### Context

Use `createContext` to define shared state and `useContext` to consume it:

```typescript
// theme-context.ts
import { createContext } from "@blask/core";

export type ThemeContextValue = {
  mode: "light" | "dark";
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>(
  { mode: "light", toggle: () => {} },
  "theme-provider", // tag name for the provider element
);
```

```typescript
// theme-toggle.ts
import { defineElement, useContext, css } from "@blask/core";
import { ThemeContext } from "./theme-context.js";

const ThemeToggle = defineElement(
  { tag: "theme-toggle", styles: css`@unocss-placeholder` },
  () => {
    const theme = useContext(ThemeContext);

    return `
      <button class="p-2">
        ${theme.mode === "light" ? "🌙" : "☀️"} Current: ${theme.mode}
      </button>`;
  },
);

export default ThemeToggle;
```

## Setup with Astro + UnoCSS

Black integrates with Astro and UnoCSS so that utility classes work inside Shadow DOM.

### Install

```bash
pnpm add @blask/core @blask/astro unocss @unocss/astro
```

### UnoCSS config

`uno.config.ts`:

```typescript
import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [presetWind4()],
});
```

### Astro config

`astro.config.mjs`:

```typescript
import { defineConfig } from "astro/config";
import { blaskIntegration } from "@blask/astro";
import UnoCSS from "@unocss/astro";
import unoConfig from "./uno.config.ts";

export default defineConfig({
  integrations: [
    blaskIntegration({ unoConfig }),
    UnoCSS({ injectReset: true }),
  ],
});
```

- `blaskIntegration({ unoConfig })` — Registers the Black renderer and Vite plugin. The `unoConfig` option enables the plugin to generate and inject UnoCSS styles into each component's Shadow DOM at the `@unocss-placeholder` marker.
- `UnoCSS({ injectReset: true })` — Handles UnoCSS for the light DOM (outside Shadow DOM).

### Use `@unocss-placeholder` in components

Adding `@unocss-placeholder` in a component's `styles` tells the Vite plugin to scan that component's HTML template and inject the generated utility CSS:

```typescript
const MyComponent = defineElement(
  {
    tag: "my-component",
    styles: css`
      @unocss-placeholder
      :host { display: block; }
    `,
  },
  () => {
    // Utility classes like "p-4", "flex", etc. are available here
    return `<div class="p-4 flex items-center gap-2">Hello</div>`;
  },
);
```

## Packages

| Package        | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `@blask/core`  | Hooks, component definition, DOM morphing, Declarative Shadow DOM SSR, Context API |
| `@blask/vite`  | Vite plugin — UnoCSS injection into Shadow DOM, `@apply` resolution, HMR           |
| `@blask/astro` | Astro integration — server-side renderer, client-side hydration, DSD polyfill      |

## Hooks

| Hook              | Description                                         |
| ----------------- | --------------------------------------------------- |
| `useState`        | Local reactive state with setter function           |
| `useRef`          | Mutable ref object that persists across renders     |
| `useMemo`         | Memoized value, recomputed when dependencies change |
| `useCallback`     | Memoized function reference                         |
| `useEffect`       | Side effects that run after render                  |
| `useLayoutEffect` | Synchronous effects that run before paint           |
| `useHost`         | Access the host element reference                   |
| `useProp`         | Two-way binding to a component prop with setter     |
| `useEvent`        | Dispatch custom events from the component           |
| `useSlot`         | Reactively access slotted elements                  |
| `useContext`      | Subscribe to a context value                        |
| `createContext`   | Create a context with a provider custom element     |
