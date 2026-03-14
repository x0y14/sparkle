import type { Product, Cart, Order } from "./types.js";

const seedProducts: Product[] = [
  // Sandals (flipflop-001.webp)
  { id: "san-001", name: "EVAクロッグサンダル", price: 3900, description: "軽量EVA素材のクロッグタイプサンダル", image: "/images/flipflop-001.webp", category: "sandals", stock: 50 },
  { id: "san-002", name: "ビーチスライドサンダル", price: 2900, description: "ワンストラップのシンプルスライドサンダル", image: "/images/flipflop-001.webp", category: "sandals", stock: 30 },
  { id: "san-003", name: "メッシュスポーツサンダル", price: 5800, description: "通気性抜群のメッシュアッパーサンダル", image: "/images/flipflop-001.webp", category: "sandals", stock: 20 },
  { id: "san-004", name: "コンフォートリカバリーサンダル", price: 4500, description: "運動後のリカバリーに最適な厚底サンダル", image: "/images/flipflop-001.webp", category: "sandals", stock: 40 },
  { id: "san-005", name: "ストラップフラットサンダル", price: 3200, description: "アジャスタブルストラップ付きフラットサンダル", image: "/images/flipflop-001.webp", category: "sandals", stock: 35 },

  // Leather (leather-001.webp)
  { id: "lea-001", name: "キャップトウダービー", price: 18900, description: "つま先切替のクラシックダービーシューズ", image: "/images/leather-001.webp", category: "leather", stock: 15 },
  { id: "lea-002", name: "プレーントウオックスフォード", price: 22800, description: "内羽根式のフォーマルオックスフォード", image: "/images/leather-001.webp", category: "leather", stock: 10 },
  { id: "lea-003", name: "ウィングチップシューズ", price: 24800, description: "メダリオン装飾のフルブローグ", image: "/images/leather-001.webp", category: "leather", stock: 12 },
  { id: "lea-004", name: "モンクストラップシューズ", price: 21800, description: "ダブルモンクストラップのドレスシューズ", image: "/images/leather-001.webp", category: "leather", stock: 8 },
  { id: "lea-005", name: "レザーチャッカブーツ", price: 26800, description: "スムースレザーのアンクル丈チャッカブーツ", image: "/images/leather-001.webp", category: "leather", stock: 10 },

  // Sneakers (sneaker-001.webp)
  { id: "snk-001", name: "キャンバスハイカットスニーカー", price: 7900, description: "定番キャンバス地のハイカットモデル", image: "/images/sneaker-001.webp", category: "sneakers", stock: 40 },
  { id: "snk-002", name: "ローカットコートシューズ", price: 6900, description: "クリーンデザインのレザーコートスニーカー", image: "/images/sneaker-001.webp", category: "sneakers", stock: 30 },
  { id: "snk-003", name: "プラットフォームスニーカー", price: 9800, description: "厚底ソールのボリュームスニーカー", image: "/images/sneaker-001.webp", category: "sneakers", stock: 25 },
  { id: "snk-004", name: "スリッポンスニーカー", price: 5900, description: "着脱簡単なエラスティックスリッポン", image: "/images/sneaker-001.webp", category: "sneakers", stock: 35 },
  { id: "snk-005", name: "ミッドカットスケートシューズ", price: 8500, description: "耐久性に優れたスケートボード向けシューズ", image: "/images/sneaker-001.webp", category: "sneakers", stock: 20 },

  // Sport (sport-001.webp)
  { id: "spt-001", name: "ロードランニングシューズ", price: 12800, description: "軽量クッションのデイリーランナー", image: "/images/sport-001.webp", category: "sport", stock: 30 },
  { id: "spt-002", name: "トレイルランニングシューズ", price: 15800, description: "グリップ力に優れたオフロード対応モデル", image: "/images/sport-001.webp", category: "sport", stock: 20 },
  { id: "spt-003", name: "ウォーキングシューズ", price: 8900, description: "長時間歩行に適したサポートシューズ", image: "/images/sport-001.webp", category: "sport", stock: 40 },
  { id: "spt-004", name: "クロストレーニングシューズ", price: 11800, description: "ジムトレーニング向けの安定性モデル", image: "/images/sport-001.webp", category: "sport", stock: 25 },
  { id: "spt-005", name: "レーシングフラット", price: 18900, description: "レース用の超軽量カーボンプレート搭載", image: "/images/sport-001.webp", category: "sport", stock: 15 },
];

let products = new Map<string, Product>();
let carts = new Map<string, Cart>();
let orders = new Map<string, Order>();

export function resetStore(): void {
  products = new Map(seedProducts.map((p) => [p.id, p]));
  carts = new Map();
  orders = new Map();
}
resetStore();
export { products, carts, orders };
