import { sparkleVitePlugin, type SparkleVitePluginOptions } from "@sparkle/vite"

export type SparkleIntegrationOptions = {
  polyfill?: boolean
  unoConfig?: SparkleVitePluginOptions["unoConfig"]
}

export type AstroIntegration = {
  name: string
  hooks: Record<string, Function>
}

export function sparkleIntegration(options: SparkleIntegrationOptions = {}): AstroIntegration {
  const { polyfill = true } = options

  return {
    name: "@sparkle/astro",
    hooks: {
      "astro:config:setup": ({
        addRenderer,
        updateConfig,
        injectScript,
      }: {
        addRenderer: (config: any) => void
        updateConfig: (config: any) => void
        injectScript: (stage: string, content: string) => void
      }) => {
        addRenderer({
          name: "@sparkle/astro",
          serverEntrypoint: "@sparkle/astro/server",
          clientEntrypoint: "@sparkle/astro/client",
        })

        updateConfig({
          vite: {
            plugins: [sparkleVitePlugin({ unoConfig: options.unoConfig })],
            ssr: {
              // TypeScript ソースを直接持つ workspace パッケージを Vite で処理させる
              // externalize すると Node.js ネイティブ ESM が .js 拡張子を解決しようとして失敗する
              noExternal: ["@sparkle/core", "@sparkle/vite"],
            },
          },
        })

        if (polyfill) {
          injectScript(
            "head-inline",
            `(function(){if("shadowRootMode" in HTMLTemplateElement.prototype)return;function p(r){var ts=r.querySelectorAll("template[shadowrootmode]");for(var i=0;i<ts.length;i++){var t=ts[i],m=t.getAttribute("shadowrootmode"),pr=t.parentElement;if(!pr)continue;try{var o={mode:m};if(t.hasAttribute("shadowrootdelegatesfocus"))o.delegatesFocus=true;if(t.hasAttribute("shadowrootclonable"))o.clonable=true;if(t.hasAttribute("shadowrootserializable"))o.serializable=true;var sr=pr.attachShadow(o);sr.appendChild(t.content.cloneNode(true));t.remove();p(sr)}catch(e){if(typeof console!=="undefined")console.warn("[sparkle] polyfill:",e);t.remove()}}}p(document)})();`,
          )
        }
      },
    },
  }
}
