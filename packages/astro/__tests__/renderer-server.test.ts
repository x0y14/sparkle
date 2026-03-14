import { describe, test, expect, vi } from "vitest";
import sparkleRenderer from "../src/server.js";

describe("sparkle server renderer", () => {
  test("server check() identifies sparkle components", () => {
    const SparkleComp = class extends HTMLElement {
      static __sparkle = true;
    };
    expect(sparkleRenderer.check(SparkleComp)).toBe(true);
  });

  test("server check() rejects non-sparkle", () => {
    expect(sparkleRenderer.check(class {})).toBe(false);
    expect(sparkleRenderer.check(null)).toBe(false);
    expect(sparkleRenderer.check(undefined)).toBe(false);
    expect(sparkleRenderer.check("string")).toBe(false);
    expect(sparkleRenderer.check(42)).toBe(false);
  });

  test("renderToStaticMarkup returns DSD HTML", async () => {
    const SparkleComp = class extends HTMLElement {
      static __sparkle = true;
      static _renderFn = () => "<p>server rendered</p>";
    } as any;

    // We need to register it to get a tag name
    const tag = `ssr-test-${Date.now()}`;
    customElements.define(tag, SparkleComp);

    const result = await sparkleRenderer.renderToStaticMarkup(SparkleComp, { _tag: tag }, {});
    expect(result.html).toContain("shadowrootmode");
    expect(result.html).toContain("<p>server rendered</p>");
  });

  test("renderToStaticMarkup passes named slots without wrapper", async () => {
    const renderFn = vi.fn(() => '<slot name="header"></slot><slot></slot>');
    const SparkleComp = class extends HTMLElement {
      static __sparkle = true;
      static _renderFn = renderFn;
    } as any;

    const tag = `ssr-slots-${Date.now()}`;
    customElements.define(tag, SparkleComp);

    const result = await sparkleRenderer.renderToStaticMarkup(
      SparkleComp,
      { _tag: tag },
      { default: "<p>body</p>", header: '<h1 slot="header">Title</h1>' },
    );
    // Content passed through directly — no <div> wrapper
    expect(result.html).toContain('<h1 slot="header">Title</h1>');
    expect(result.html).not.toContain('<div slot="header">');
    expect(result.html).toContain("<p>body</p>");
  });

  test("props are forwarded", async () => {
    const renderFn = vi.fn((props: any) => `<p>${props.name}</p>`);
    const SparkleComp = class extends HTMLElement {
      static __sparkle = true;
      static _renderFn = renderFn;
    } as any;

    const tag = `ssr-props-${Date.now()}`;
    customElements.define(tag, SparkleComp);

    const result = await sparkleRenderer.renderToStaticMarkup(
      SparkleComp,
      { _tag: tag, name: "test" },
      {},
    );
    expect(result.html).toContain("test");
  });

  test("warns when using fallback tag name", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Component = { __sparkle: true, _renderFn: () => "<p>hi</p>" };
    await sparkleRenderer.renderToStaticMarkup(Component, {}, {});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("sparkle-component"));
    warnSpy.mockRestore();
  });
});
