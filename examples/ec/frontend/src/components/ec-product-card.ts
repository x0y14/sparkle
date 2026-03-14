import { defineElement, css } from "@blask/core"

const ProductCard = defineElement(
  {
    tag: "ec-product-card",
    props: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      productId: { type: String },
    },
    styles: css`@unocss-placeholder
:host { @apply block overflow-hidden rounded-lg rounded-br-2xl; }`,
  },
  (props) => {
    const priceStr = (props.price ?? 0).toLocaleString("ja-JP")
    return `
      <a href="/products/${props.productId}" class="group block bg-surface-card no-underline color-inherit rounded-lg rounded-br-2xl transition-shadow duration-300 hover:shadow-sm">
        <div class="overflow-hidden aspect-square bg-surface-warm">
          <img src="${props.image}" alt="${props.name}" width="300" height="300" class="w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-104" />
        </div>
        <div class="pt-2 pb-3 px-2">
          <h3 class="font-sans text-xs tracking-wide text-ink-muted uppercase leading-relaxed line-clamp-2">${props.name}</h3>
          <p class="font-display text-lg font-400 tracking-tight text-ink">¥${priceStr}</p>
        </div>
      </a>
    `
  },
)
export default ProductCard
