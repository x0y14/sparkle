import { defineElement, css, useHost, useRef, useEffect } from "@sparkio/core"
import type { ChartInstance, ChartConfig } from "../lib/types"

const SparkChart = defineElement(
  {
    tag: "spark-chart",
    props: {
      type: { type: String, value: () => "line" },
      data: { type: Object, value: () => ({ series: [] }) },
      config: { type: Object, value: () => ({}) },
      width: { type: Number, value: () => 600 },
      height: { type: Number, value: () => 400 },
      theme: { type: String, value: () => "light" },
    },
    styles: css`@unocss-placeholder
:host { @apply "block"; }
.chart-container { @apply "relative"; }`,
  },
  (props) => {
    const host = useHost()
    const chartRef = useRef<ChartInstance | null>(null)
    const initRef = useRef(false)

    useEffect(() => {
      if (initRef.current) return
      initRef.current = true
      const container = host.current!.shadowRoot!.querySelector(".chart-container") as HTMLElement
      if (!container) return
      import("../lib/index").then(({ createChart }) => {
        const cfg: ChartConfig = {
          type: props.type as ChartConfig["type"],
          series: (props.data as { series: ChartConfig["series"] }).series ?? [],
          theme: props.theme as ChartConfig["theme"],
          ...(props.config as Partial<ChartConfig>),
        }
        return createChart(container, cfg)
      }).then((inst) => {
        chartRef.current = inst
      }).catch((err) => {
        console.error("spark-chart init failed:", err)
        initRef.current = false
      })
      return () => {
        chartRef.current?.destroy()
        chartRef.current = null
        initRef.current = false
      }
    }, [])

    useEffect(() => {
      if (!chartRef.current) return
      chartRef.current.update({
        type: props.type as ChartConfig["type"],
        series: (props.data as { series: ChartConfig["series"] }).series ?? [],
        theme: props.theme as ChartConfig["theme"],
        ...(props.config as Partial<ChartConfig>),
      })
    }, [props.data, props.config, props.theme, props.type])

    return `<div class="chart-container" style="width:${props.width}px;height:${props.height}px"></div>`
  },
)

export default SparkChart
