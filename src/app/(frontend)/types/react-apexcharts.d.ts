import { ApexOptions } from 'apexcharts'

declare module 'react-apexcharts' {
  interface Props {
    type:
      | 'line'
      | 'area'
      | 'bar'
      | 'histogram'
      | 'pie'
      | 'donut'
      | 'radialBar'
      | 'scatter'
      | 'bubble'
      | 'heatmap'
      | 'treemap'
      | 'boxPlot'
      | 'candlestick'
      | 'radar'
      | 'polarArea'
      | 'rangeBar'
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries
    width?: string | number
    height?: string | number
    options?: ApexOptions
  }

  export default function ReactApexChart(props: Props): JSX.Element
}
