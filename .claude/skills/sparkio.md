# Sparkio

A hooks-based Web Components library optimized for Astro and utility-first CSS.

## Packages

| Package | Description |
|---------|-------------|
| `@sparkio/core` | Hooks, component definition (`defineElement`), DOM morphing, Declarative Shadow DOM SSR, Context API. Zero runtime dependencies. |
| `@sparkio/vite` | Vite plugin — injects UnoCSS-generated styles into each component's Shadow DOM via `@unocss-placeholder`, resolves `@apply` directives, supports HMR. |
| `@sparkio/astro` | Astro integration — server-side renderer (DSD), client-side hydration, auto-injected DSD polyfill. |

## When to Use Sparkio

Use sparkio when:

- Building Web Components with a React-like hooks API (no class syntax)
- Targeting Astro SSR with Declarative Shadow DOM
- Needing utility-first CSS (UnoCSS / Tailwind-like) inside Shadow DOM
- Building framework-agnostic component libraries that work anywhere via Web Components
- Wanting a zero-dependency core with small bundle size

Do NOT use sparkio when:

- Building a full single-page application — use React, Vue, Svelte, or SolidJS instead
- Needing JSX or a custom template DSL — sparkio uses plain HTML strings
- Needing a rich ecosystem of ready-made UI component libraries
- Targeting IE11 or browsers without Shadow DOM / Custom Elements support
- Needing server-side state for Context (useContext returns defaultValue during SSR)

Sparkio is a **component-definition library**, not a full framework. It produces standard Web Components. Pair it with **Astro** as the meta-framework for SSR, routing, and page composition.

## Capabilities and Limitations

### Can Do

- Define custom elements with typed props, attribute reflection, and change events
- All hooks: `useState`, `useRef`, `useMemo`, `useCallback`, `useEffect`, `useLayoutEffect`, `useHost`, `useProp`, `useEvent`, `useSlot`, `useContext` / `createContext`
- Server-side render via `renderToString` with Declarative Shadow DOM (`<template shadowrootmode="open">`)
- Efficient DOM updates via built-in morphing algorithm (preserves focus, input state, cursor position)
- Shadow DOM style encapsulation with `adoptedStyleSheets`
- UnoCSS utility classes inside Shadow DOM via `@unocss-placeholder` marker
- `@apply` directive resolution in component CSS
- Prop coercion from HTML attributes (String, Number, Boolean, Array, Object) with XSS protection
- Astro template directives (`client:load`, `client:visible`, `client:idle`, etc.)
- Context API for cross-component shared state (event-based protocol through the DOM tree)

### Cannot Do

- No JSX support — render functions return HTML strings or DOM Nodes
- No virtual DOM — uses morphing (real DOM diffing)
- No built-in router
- No global state management — Context API is scoped to the DOM tree via events
- No template language or conditional rendering syntax — use JS ternaries/conditionals in template strings
- `useContext` returns `defaultValue` during SSR (DOM events unavailable on server)
- `useEffect` / `useLayoutEffect` are no-ops during SSR
- Shadow DOM is enabled by default; disabling with `shadow: false` loses style encapsulation

## Setup: Astro + UnoCSS (Recommended)

### Install

```bash
pnpm add @sparkio/core @sparkio/astro unocss @unocss/astro
```

For `presetWind4` (Tailwind v4 compatibility):

```bash
pnpm add -D @unocss/preset-wind4
```

### uno.config.ts

Basic configuration:

```typescript
import { defineConfig, presetWind4 } from "unocss"

export default defineConfig({
  presets: [presetWind4()],
})
```

With web fonts and custom theme colors:

```typescript
import { defineConfig, presetWebFonts, presetWind4 } from "unocss"

export default defineConfig({
  presets: [
    presetWind4(),
    presetWebFonts({
      fonts: {
        sans: "Outfit:300,400,500,600",
        display: "Cormorant Garamond:300,400,500,600,700",
      },
    }),
  ],
  theme: {
    colors: {
      surface: {
        DEFAULT: "#FAF8F5",
        warm: "#F5F0EB",
        card: "#FFFFFF",
      },
      ink: {
        DEFAULT: "#1A1715",
        muted: "#78716C",
        faint: "#A8A29E",
      },
      accent: {
        DEFAULT: "#292524",
        hover: "#44403C",
        success: "#365314",
        error: "#991B1B",
      },
      border: {
        DEFAULT: "#E7E5E4",
        dark: "#D6D3D1",
      },
    },
  },
})
```

Theme colors are used as utility classes: `bg-surface-card`, `text-ink-muted`, `border-border`, `hover:bg-accent-hover`. The `DEFAULT` key maps to the bare name (e.g., `bg-accent` = `bg-accent-DEFAULT`).

### astro.config.mjs

```typescript
import { defineConfig } from "astro/config"
import { sparkioIntegration } from "@sparkio/astro"
import UnoCSS from "@unocss/astro"
import unoConfig from "./uno.config.ts"

export default defineConfig({
  integrations: [
    sparkioIntegration({ unoConfig }),
    UnoCSS({ injectReset: true }),
  ],
})
```

- `sparkioIntegration({ unoConfig })` — Registers the Sparkio renderer and Vite plugin. The `unoConfig` option enables the plugin to generate and inject UnoCSS styles into each component's Shadow DOM at the `@unocss-placeholder` marker.
- `UnoCSS({ injectReset: true })` — Handles UnoCSS for the light DOM (outside Shadow DOM).

### sparkioIntegration Options

```typescript
type SparkioIntegrationOptions = {
  polyfill?: boolean    // Auto-inject DSD polyfill script (default: true)
  unoConfig?: UserConfig // UnoCSS configuration object
}
```

## Setup: Vite Only (without Astro)

```bash
pnpm add @sparkio/core @sparkio/vite unocss
```

```typescript
// vite.config.ts
import { defineConfig } from "vite"
import { sparkioVitePlugin } from "@sparkio/vite"
import unoConfig from "./uno.config.ts"

export default defineConfig({
  plugins: [sparkioVitePlugin({ unoConfig })],
})
```

Note: Without Astro, SSR / Declarative Shadow DOM is not available. Components work client-side only.

### sparkioVitePlugin Options

```typescript
type SparkioVitePluginOptions = {
  unoConfig?: UserConfig  // UnoCSS configuration
  preflights?: boolean    // Include UnoCSS preflights (default: true)
  safelist?: boolean      // Include UnoCSS safelist (default: true)
}
```

## Core API: defineElement

```typescript
function defineElement<P extends Record<string, PropType>>(
  options: SparkioComponentOptions<P>,
  renderFn: SparkioRenderFn<InferProps<P>>,
): CustomElementConstructor
```

### Options

```typescript
type SparkioComponentOptions<P> = {
  props?: P                                              // Property schema
  styles?: CSSStyleSheet | CSSStyleSheet[] | string | CSSResult  // Component styles
  shadow?: boolean | ShadowRootInit                      // Shadow DOM mode (default: true)
  tag?: string                                           // Custom element tag name (must contain hyphen)
}
```

When `tag` is set, the element is auto-registered via `customElements.define()`.

### Render Function

```typescript
type SparkioRenderFn<P> = (props: P) => string | Node | null
```

Returns an HTML string (most common), a DOM Node, or null. The HTML string is applied to the shadow root via the morphing algorithm, which efficiently patches the DOM without full re-renders.

### PropType

```typescript
type PropType = {
  type: typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object
  reflect?: boolean           // Sync property value back to HTML attribute
  value?: () => unknown        // Factory function returning default value
  event?: {
    type: string              // Event name to dispatch on change
    bubbles?: boolean         // Default: true
    composed?: boolean        // Default: false
  }
}
```

### Prop Coercion (Attribute → Property)

| Type | Attribute Value | Property Value | Notes |
|------|----------------|----------------|-------|
| String | `"text"` | `"text"` | Pass-through |
| Boolean | (absent / null) | `false` | No attribute = false |
| Boolean | `""` (present) | `true` | Attribute present = true |
| Boolean | `"false"` | `false` | Explicit false string |
| Boolean | `"0"` | `false` | Zero string = false |
| Number | `"42"` | `42` | Valid finite number |
| Number | `""` | (skip) | Empty string — keeps previous value |
| Number | `"abc"` | (skip) | Invalid — keeps previous value |
| Number | `"Infinity"` | (skip) | Non-finite — keeps previous value |
| Array / Object | `'[1,2]'` | `[1, 2]` | JSON.parse with prototype pollution protection |

### Minimal Example

```typescript
import { defineElement, useState, useHost, useEffect, css } from "@sparkio/core"

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
    const [visible, setVisible] = useState(true)
    const host = useHost()

    useEffect(() => {
      const root = host.current.shadowRoot!
      const handler = () => setVisible((v) => !v)
      root.addEventListener("click", handler)
      return () => root.removeEventListener("click", handler)
    }, [])

    return `
      <div class="p-4">
        ${visible ? `<p>Hello, ${props.name}!</p>` : `<p>Goodbye!</p>`}
        <button>Toggle</button>
      </div>`
  },
)

export default HelloMessage
```

## Hooks Reference

### Rules of Hooks

Same rules as React Hooks:

1. Call hooks at the **top level** of the render function only
2. Do **not** call hooks inside conditionals, loops, or nested functions
3. Hook call order must be **consistent** across every render
4. Hooks work because they rely on a stable call index per render

### useState

```typescript
function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
```

Local reactive state. The setter supports both direct values and functional updates (`prev => next`). Uses `Object.is()` to skip re-renders when value hasn't changed. Re-renders are batched via microtask.

- **React:** `React.useState` — identical API and semantics
- **Vue:** `ref()` + `.value` — Vue uses a reactive proxy; sparkio uses explicit setter

### useRef

```typescript
function useRef<T>(initial: T): { current: T }
```

Mutable ref object that persists across renders. Mutations to `.current` never trigger re-renders.

- **React:** `React.useRef` — identical
- **Vue:** `ref()` — but Vue's ref is reactive; sparkio's is not

### useMemo

```typescript
function useMemo<T>(factory: () => T, deps: unknown[]): T
```

Memoized value. Recomputes only when `deps` change. The `deps` array is **required** (unlike React where it's optional).

- **React:** `React.useMemo` — identical (deps technically optional in React)
- **Vue:** `computed()` — Vue auto-tracks dependencies; sparkio requires explicit deps

### useCallback

```typescript
function useCallback<T extends (...args: any[]) => any>(fn: T, deps: unknown[]): T
```

Memoized function reference. Implemented internally as `useMemo(() => fn, deps)`.

- **React:** `React.useCallback` — identical
- **Vue:** Not needed — Vue's reactivity system handles this differently

### useEffect

```typescript
function useEffect(callback: () => (() => void) | void, deps?: unknown[]): void
```

Side effects that run **after** render (asynchronously via microtask). The callback may return a cleanup function. Cleanup runs before the next effect execution or on unmount. No-op during SSR.

- **React:** `React.useEffect` — identical semantics
- **Vue:** Combination of `watch()` + `onMounted()` + `onUnmounted()`

### useLayoutEffect

```typescript
function useLayoutEffect(callback: () => (() => void) | void, deps?: unknown[]): void
```

Same as `useEffect` but runs **synchronously** after render, before regular effects. Use for DOM measurements or mutations that must happen before paint. No-op during SSR.

- **React:** `React.useLayoutEffect` — identical
- **Vue:** `watch()` with `{ flush: 'sync' }`

### useHost

```typescript
function useHost(): { current: HTMLElement }
```

Returns a ref to the host custom element. Essential for accessing `shadowRoot` to attach event listeners (since sparkio has no JSX event binding).

- **React:** No equivalent (React components don't have a host element)
- **Vue:** No direct equivalent (use `getCurrentInstance()` or template refs)

### useProp

```typescript
function useProp<T>(name: string): [T, (value: T) => void]
```

Two-way binding to a component prop. The getter reads the current prop value from the host; the setter writes directly to the host element property (triggers re-render, attribute reflection if `reflect: true`, and event dispatch if `event` is configured). The prop **must** be declared in `options.props` — throws an error otherwise.

- **React:** No equivalent (React props are one-way)
- **Vue:** Similar to `defineModel()` — two-way binding with the parent

### useEvent

```typescript
function useEvent<T = void>(
  type: string,
  init?: Omit<CustomEventInit<T>, "detail">,
): (detail: T) => void
```

Returns a memoized function that dispatches a `CustomEvent` from the host element. Always pass `{ bubbles: true, composed: true }` for events that need to cross Shadow DOM boundaries.

- **React:** No equivalent (React uses callback props)
- **Vue:** Similar to `defineEmits()` — dispatching events to parent

### useSlot

```typescript
function useSlot(name?: string): Element[]
```

Reactively tracks elements assigned to a slot. Call with no argument for the default slot, or pass a name for a named slot. Updates automatically on `slotchange`.

- **React:** No equivalent (React uses `props.children`)
- **Vue:** `useSlots()` — but Vue returns render functions, sparkio returns DOM elements

### createContext

```typescript
function createContext<T>(defaultValue: T, tag?: string): SparkioContext<T>

type SparkioContext<T> = {
  Provider: CustomElementConstructor
  defaultValue: T
}
```

Creates a context with a Provider custom element. If `tag` is provided, the Provider is auto-registered. The Provider element renders `<slot></slot>` and manages subscriptions via an event-based protocol.

- **React:** `React.createContext` — similar concept but React uses a different subscription mechanism
- **Vue:** `provide()` — Vue's provide/inject uses component tree, sparkio uses DOM events

### useContext

```typescript
function useContext<T>(context: SparkioContext<T>): T
```

Subscribes to a context value. Dispatches a `"sparkio.context"` event up the DOM tree; the nearest Provider intercepts it and establishes a subscription. Returns `context.defaultValue` if no Provider is found or during SSR.

**SSR limitation:** Always returns `defaultValue` during server-side rendering because DOM events are unavailable.

- **React:** `React.useContext` — similar concept but different subscription mechanism
- **Vue:** `inject()` — Vue's injection uses component tree, sparkio uses DOM events

## Styling: UnoCSS in Shadow DOM

### css Tagged Template

```typescript
import { css } from "@sparkio/core"

const styles = css`
  @unocss-placeholder
  :host { display: block; }
  p { color: blue; }
`
```

Returns a `CSSResult` object with `.cssText` and `.styleSheet` properties. Use as the `styles` option in `defineElement`.

### @unocss-placeholder

Place `@unocss-placeholder` in component styles. The Vite plugin scans the component's HTML template for utility classes (e.g., `flex`, `p-4`, `text-sm`) and replaces the placeholder with the generated CSS at build time / HMR.

Without `@unocss-placeholder`, utility classes inside Shadow DOM will have no effect.

### @apply Directive

Use `@apply` to inline utility class declarations into custom CSS rules:

```typescript
styles: css`
  @unocss-placeholder
  :host { @apply inline-flex items-center gap-2; }
  .title { @apply text-lg font-bold text-ink; }
`
```

The Vite plugin resolves `@apply` directives by generating the corresponding CSS declarations.

### virtual:sparkio/uno.css

For manually adopting UnoCSS into shadow roots (advanced usage):

```typescript
import unoSheet from "virtual:sparkio/uno.css"
import { adoptUnoCSS } from "@sparkio/core"

adoptUnoCSS({
  shadowRoots: [element.shadowRoot!],
  sheet: unoSheet,
})
```

### createSharedSheet

```typescript
import { createSharedSheet } from "@sparkio/core"

const sheet = createSharedSheet("p { color: blue; }")
// Returns a CSSStyleSheet that can be shared across shadow roots
```

## Event Handling Patterns

Sparkio has **no JSX** and no declarative event binding like `onClick`. All event handling uses `useEffect` + `shadowRoot.addEventListener`.

### Basic Pattern

```typescript
const host = useHost()

useEffect(() => {
  const root = host.current.shadowRoot!
  const handler = (e: Event) => {
    // handle event
  }
  root.addEventListener("click", handler)
  return () => root.removeEventListener("click", handler)
}, [/* deps */])
```

### Event Delegation with data-attributes

For components with multiple interactive elements, use event delegation:

```typescript
useEffect(() => {
  const root = host.current.shadowRoot!
  const handler = (e: Event) => {
    const target = (e.target as HTMLElement).closest("[data-action]")
    if (!target) return
    const action = target.getAttribute("data-action")
    if (action === "increment") setValue((v) => v + 1)
    if (action === "decrement") setValue((v) => v - 1)
  }
  root.addEventListener("click", handler)
  return () => root.removeEventListener("click", handler)
}, [])

return `
  <button data-action="decrement">-</button>
  <span>${value}</span>
  <button data-action="increment">+</button>
`
```

### Dispatching Custom Events (composed: true)

For events that need to cross Shadow DOM boundaries (parent-child communication), always use `composed: true`:

```typescript
const dispatch = useEvent<number>("quantity-change", { bubbles: true, composed: true })

// Later, in an event handler:
dispatch(newValue)
```

### Listening for Child Custom Events

```typescript
useEffect(() => {
  const el = host.current
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail
    // handle child event
  }
  el.addEventListener("quantity-change", handler)
  return () => el.removeEventListener("quantity-change", handler)
}, [])
```

## Context API: Full Pattern

### 1. Define Context

```typescript
// context/cart-context.ts
import { createContext } from "@sparkio/core"

export type CartContextValue = {
  items: CartItem[]
  totalCount: number
  totalPrice: number
  addItem: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
}

export const CartContext = createContext<CartContextValue>(
  {
    items: [],
    totalCount: 0,
    totalPrice: 0,
    addItem: () => {},
    removeItem: () => {},
  },
  "my-cart-provider",  // tag name for the Provider element
)
```

### 2. Create Provider App Component

The Provider element (`<my-cart-provider>`) is auto-created by `createContext`. You need a wrapper component that manages state and updates the provider's `value` prop:

```typescript
// components/cart-provider-app.ts
import { defineElement, useState, useEffect, useCallback, useHost } from "@sparkio/core"
import { CartContext, type CartContextValue } from "../context/cart-context.js"

const CartProviderApp = defineElement({ tag: "my-cart-provider-app" }, () => {
  const [items, setItems] = useState<CartItem[]>([])
  const host = useHost()

  const addItem = useCallback(async (productId: string, quantity: number) => {
    // API call or local state update
  }, [])

  const removeItem = useCallback(async (productId: string) => {
    // API call or local state update
  }, [])

  const totalCount = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const ctx: CartContextValue = { items, totalCount, totalPrice, addItem, removeItem }

  // Update the provider element's value prop
  useEffect(() => {
    const provider = host.current.shadowRoot?.querySelector("my-cart-provider") as any
    if (provider) provider.value = ctx
  }, [items])

  return `<my-cart-provider><slot></slot></my-cart-provider>`
})

export default CartProviderApp
```

### 3. Consume Context

```typescript
// components/cart-badge.ts
import { defineElement, useContext, css } from "@sparkio/core"
import { CartContext } from "../context/cart-context.js"

const CartBadge = defineElement(
  {
    tag: "my-cart-badge",
    styles: css`@unocss-placeholder`,
  },
  () => {
    const cart = useContext(CartContext)
    return `<span class="font-bold">${cart.totalCount}</span>`
  },
)

export default CartBadge
```

### 4. Wire in Astro

```astro
---
import CartProviderApp from "../components/cart-provider-app.ts"
import CartBadge from "../components/cart-badge.ts"
---

<CartProviderApp client:load>
  <CartBadge client:load />
  <slot />
</CartProviderApp>
```

## Using Components in Astro Pages

### Import and Use

```astro
---
import MyComponent from "../components/my-component.ts"
---

<MyComponent client:load name="World" />
```

### Hydration Directives

| Directive | When Component Hydrates |
|-----------|------------------------|
| `client:load` | Immediately on page load |
| `client:visible` | When the element enters the viewport |
| `client:idle` | When the browser is idle |
| `client:only="@sparkio/astro"` | Client-only (no SSR) |

### Slot Content

```astro
<MyWrapper client:load>
  <p>This goes into the default slot</p>
  <div slot="header">Named slot content</div>
</MyWrapper>
```

## SSR and Declarative Shadow DOM

- Sparkio components used in Astro automatically SSR via `renderToString`
- Server output uses `<template shadowrootmode="open">` with styles inlined in a `<style>` tag
- The DSD polyfill is auto-injected by `sparkioIntegration` for browsers that don't support DSD natively
- On client-side hydration, the inline `<style>` tag is removed and replaced with `adoptedStyleSheets` (more efficient, shared across instances)

### Hook Behavior During SSR

| Hook | SSR Behavior |
|------|-------------|
| `useState` | Works (captures initial state snapshot) |
| `useRef` | Works (creates mutable object) |
| `useMemo` / `useCallback` | Works (computed once) |
| `useEffect` | **No-op** (returns immediately) |
| `useLayoutEffect` | **No-op** (returns immediately) |
| `useContext` | **Returns `defaultValue`** (DOM events unavailable) |
| `useHost` | Works (returns host ref) |
| `useProp` | Works (reads initial prop value) |
| `useEvent` | Works (creates dispatch function, but won't fire on server) |
| `useSlot` | Returns empty array (no slot assignment on server) |

## Common Pitfalls

1. **Forgetting `composed: true` on events** — Custom events won't cross Shadow DOM boundaries without `composed: true`. Use `useEvent("my-event", { bubbles: true, composed: true })`.

2. **Missing `@unocss-placeholder` in styles** — Utility classes (e.g., `flex`, `p-4`) won't work inside Shadow DOM without this marker. Always include it in the `css` tagged template.

3. **Calling hooks conditionally** — Like React, hooks must be called in the same order on every render. Conditional hooks break the index-based state tracking.

4. **Missing event listener cleanup** — Always return a cleanup function from `useEffect` that calls `removeEventListener`. Otherwise, listeners accumulate on re-renders.

5. **Tag names without a hyphen** — Web Components spec requires custom element names to contain a hyphen (e.g., `my-counter`, not `counter`).

6. **camelCase vs kebab-case** — Props are defined in camelCase in JavaScript (`userName`) but map to kebab-case HTML attributes (`user-name`). This conversion is automatic.

7. **Expecting useContext to work in SSR** — `useContext` always returns `defaultValue` during server-side rendering. Design components to handle default/empty state gracefully.

8. **Directly mutating DOM instead of returning from render** — Use the render function's return value for template output. The morph algorithm handles efficient updates. Direct `innerHTML` manipulation bypasses morphing.

## File Organization Conventions

```
src/
├── components/        # Sparkio component files (e.g., my-counter.ts)
├── context/           # Context definitions (e.g., cart-context.ts)
├── lib/               # Shared utilities, API functions, types
├── layouts/           # Astro layouts
└── pages/             # Astro pages
uno.config.ts          # UnoCSS configuration
astro.config.mjs       # Astro configuration
```

Component files are typically named with a prefix matching the project or feature (e.g., `ec-product-card.ts`, `ec-quantity-selector.ts`).
