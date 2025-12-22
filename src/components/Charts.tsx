import { createEffect, For, onMount } from 'solid-js'
import * as d3 from 'd3'
import type { HistoryPoint } from '../types'

interface ChartsProps {
  history: HistoryPoint[]
}

interface ChartConfig {
  title: string
  color: string
  getValue: (point: HistoryPoint) => number
}

const CHART_HEIGHT = 120
const MARGIN = { top: 20, right: 20, bottom: 30, left: 50 }

function formatYear(year: number): string {
  if (year <= 0) return `${Math.abs(year)} BC`
  return `${year} AD`
}

function Chart(props: { config: ChartConfig; history: HistoryPoint[] }) {
  let svgRef: SVGSVGElement | undefined

  const drawChart = () => {
    if (!svgRef || props.history.length < 2) return

    const svg = d3.select(svgRef)
    svg.selectAll('*').remove()

    const width = svgRef.clientWidth || 300
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

    const g = svg
      .attr('width', width)
      .attr('height', CHART_HEIGHT)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const data = props.history
    const getValue = props.config.getValue

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, getValue) || 1])
      .nice()
      .range([innerHeight, 0])

    // Area generator
    const area = d3
      .area<HistoryPoint>()
      .x((d) => xScale(d.year))
      .y0(innerHeight)
      .y1((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3
      .line<HistoryPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX)

    // Draw area
    g.append('path')
      .datum(data)
      .attr('fill', props.config.color)
      .attr('fill-opacity', 0.15)
      .attr('d', area)

    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', props.config.color)
      .attr('stroke-width', 2)
      .attr('d', line)

    // X axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(3)
      .tickFormat((d) => formatYear(d as number))

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#92400e')
      .attr('font-size', '8px')
      .attr('font-family', 'serif')

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format('.2s'))

    g.append('g')
      .call(yAxis)
      .attr('color', '#92400e')
      .attr('font-size', '8px')
      .attr('font-family', 'serif')

    // Current value indicator
    if (data.length > 0) {
      const lastPoint = data[data.length - 1]
      const lastX = xScale(lastPoint.year)
      const lastY = yScale(getValue(lastPoint))

      g.append('circle')
        .attr('cx', lastX)
        .attr('cy', lastY)
        .attr('r', 4)
        .attr('fill', props.config.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
    }
  }

  onMount(() => {
    drawChart()
  })

  createEffect(() => {
    // Track history changes
    props.history.length
    drawChart()
  })

  const currentValue = () => {
    if (props.history.length === 0) return 0
    return Math.round(props.config.getValue(props.history[props.history.length - 1]))
  }

  return (
    <div class="bg-amber-50 border border-amber-300 p-2">
      <div class="text-xs font-serif text-amber-800 mb-1 text-center">
        {props.config.title}
      </div>
      <svg ref={svgRef} class="w-full" style={{ height: `${CHART_HEIGHT}px` }} />
      <div class="text-center text-sm font-serif font-bold" style={{ color: props.config.color }}>
        {currentValue().toLocaleString()}
      </div>
    </div>
  )
}

export default function Charts(props: ChartsProps) {
  const charts: ChartConfig[] = [
    { title: 'Population', color: '#3b82f6', getValue: (p) => p.population },
    { title: 'Births', color: '#22c55e', getValue: (p) => p.births },
    { title: 'Food', color: '#f59e0b', getValue: (p) => p.food },
  ]

  return (
    <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
      <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          Statistics
        </h2>
      </div>

      <div class="p-4 grid grid-cols-3 gap-4">
        <For each={charts}>
          {(chart) => <Chart config={chart} history={props.history} />}
        </For>
      </div>
    </div>
  )
}
