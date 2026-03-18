// === チャートタイプ ===
export type ChartType = "line" | "bar" | "area" | "scatter" | "pie" | "candlestick"

// === データ入力形式 ===
export type PointObject = { x: number; y: number; size?: number }
export type PointTuple = [x: number, y: number]
export type ColumnarData = { x: Float64Array | number[]; y: Float64Array | number[] }
export type InterleavedData = { buffer: Float64Array | number[]; stride: number }
export type OHLCObject = { time: number; open: number; high: number; low: number; close: number }
export type SeriesData = PointObject[] | PointTuple[] | ColumnarData | InterleavedData | OHLCObject[]

// === データアクセサ ===
export interface DataAccessor {
  getCount(): number
  getX(i: number): number
  getY(i: number): number
  getOpen(i: number): number
  getHigh(i: number): number
  getLow(i: number): number
  getClose(i: number): number
  getSize(i: number): number
  getBoundsX(): { min: number; max: number }
  getBoundsY(): { min: number; max: number }
  hasNull(i: number): boolean
}

// === ズーム状態 ===
export interface ZoomWindow {
  startPct: number
  endPct: number
}

// === プロット領域 ===
export interface PlotRect {
  x: number
  y: number
  width: number
  height: number
}

// === マージン ===
export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

// === スケール ===
export interface LinearScale {
  map(value: number): number
  invert(value: number): number
  ticks(count: number): number[]
  domain: [number, number]
  range: [number, number]
}

// === テーマ ===
export interface ThemeColors {
  background: string
  gridLine: string
  axisLine: string
  axisLabel: string
  crosshair: string
  tooltipBg: string
  tooltipText: string
  tooltipBorder: string
}

export interface Theme {
  colors: ThemeColors
  palette: string[]
  fontFamily: string
  fontSize: { label: number; title: number; tooltip: number }
}

// === シリーズ設定 ===
export interface SeriesConfig {
  data: SeriesData
  type?: ChartType
  color?: string
  label?: string
  lineWidth?: number
  barWidth?: number
  pointRadius?: number
  stackId?: string
  innerRadius?: number
  outerRadius?: number
  visible?: boolean
}

// === 軸設定 ===
export interface AxisConfig {
  label?: string
  min?: number
  max?: number
  tickCount?: number
  format?: (value: number) => string
}

// === ユーザー入力設定 ===
export interface ChartConfig {
  type: ChartType
  series: SeriesConfig[]
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  theme?: "light" | "dark" | Theme
  margins?: Partial<Margins>
  title?: string
  samplingThreshold?: number
  zoom?: boolean
  tooltip?: boolean
  legend?: boolean
  msaaSampleCount?: 4 | 1
}

// === 正規化済み設定 ===
export interface NormalizedSeries {
  data: SeriesData
  accessor: DataAccessor
  type: ChartType
  color: string
  label: string
  lineWidth: number
  barWidth: number
  pointRadius: number
  stackId: string | null
  innerRadius: number
  outerRadius: number
  visible: boolean
  sampledIndices: number[] | null
  rawBoundsX: { min: number; max: number }
  rawBoundsY: { min: number; max: number }
  offsetX: number
  offsetY: number
}

export interface NormalizedConfig {
  type: ChartType
  series: NormalizedSeries[]
  xAxis: Required<AxisConfig> & { min: number; max: number; format: (v: number) => string }
  yAxis: Required<AxisConfig> & { min: number; max: number; format: (v: number) => string }
  theme: Theme
  margins: Margins
  title: string
  samplingThreshold: number
  zoom: boolean
  tooltip: boolean
  legend: boolean
  msaaSampleCount: 4 | 1
}

// === ヒットテスト結果 ===
export interface HitTestResult {
  seriesIndex: number
  dataIndex: number
  dataX: number
  dataY: number
  distancePx: number
}

// === ツールチップデータ ===
export interface TooltipData {
  x: number
  y: number
  seriesLabel: string
  color: string
  values: { label: string; value: string }[]
}

// === パブリックAPI ===
export interface ChartInstance {
  update(config: Partial<ChartConfig>): void
  appendData(seriesIndex: number, newData: SeriesData): void
  setZoom(startPct: number, endPct: number): void
  getZoom(): ZoomWindow
  resize(): void
  destroy(): void
  onHover(callback: (result: HitTestResult | null) => void): () => void
  onClick(callback: (result: HitTestResult | null) => void): () => void
  syncWith(other: ChartInstance): () => void
}

// === GPUモック用インターフェース ===
export interface GPUContext {
  device: GPUDevice
  context: GPUCanvasContext
  format: GPUTextureFormat
}

// === Dirty フラグ ===
export const enum DirtyFlag {
  NONE        = 0,
  DATA        = 1 << 0,
  ANNOTATION  = 1 << 1,
  INTERACTION = 1 << 2,
  LAYOUT      = 1 << 3,
}
