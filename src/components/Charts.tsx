import { createEffect, For, onMount, onCleanup } from 'solid-js'
import * as d3 from 'd3'
import type { HistoryPoint } from '../types'
import { formatYear } from '../utils'
import { CHART_HEIGHT, CHART_MARGIN, CHART_THROTTLE_MS } from '../constants'

interface ChartsProps {
  history: HistoryPoint[]
}

interface ChartConfig {
  title: string
  color: string
  getValue: (point: HistoryPoint) => number
}

function Chart(props: { config: ChartConfig; history: HistoryPoint[] }) {
  let svgRef: SVGSVGElement | undefined
  let rafId: number | undefined
  let lastDrawTime = 0

  const drawChart = () => {
    if (!svgRef || props.history.length < 2) return

    const svg = d3.select(svgRef)
    svg.selectAll('*').remove()

    const width = svgRef.clientWidth || 300
    const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right
    const innerHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom

    const g = svg
      .attr('width', width)
      .attr('height', CHART_HEIGHT)
      .append('g')
      .attr('transform', `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`)

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

  const throttledDraw = () => {
    const now = performance.now()
    if (now - lastDrawTime < CHART_THROTTLE_MS) {
      // Schedule for later if not enough time has passed
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        lastDrawTime = performance.now()
        drawChart()
      })
      return
    }
    lastDrawTime = now
    drawChart()
  }

  onMount(() => {
    drawChart()
  })

  onCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  createEffect(() => {
    // Track history changes
    props.history.length
    throttledDraw()
  })

  const currentValue = () => {
    if (props.history.length === 0) return 0
    return Math.round(props.config.getValue(props.history[props.history.length - 1]))
  }

  return (
    <figure class="bg-amber-50 border border-amber-300 p-2" role="img" aria-label={`${props.config.title} chart showing current value: ${currentValue().toLocaleString()}`}>
      <figcaption class="text-xs font-serif text-amber-800 mb-1 text-center">
        {props.config.title}
      </figcaption>
      <svg
        ref={svgRef}
        class="w-full"
        style={{ height: `${CHART_HEIGHT}px` }}
        aria-hidden="true"
      />
      <div class="text-center text-sm font-serif font-bold" style={{ color: props.config.color }} aria-hidden="true">
        {currentValue().toLocaleString()}
      </div>
    </figure>
  )
}

export default function Charts(props: ChartsProps) {
  const charts: ChartConfig[] = [
    { title: 'Population', color: '#3b82f6', getValue: (p) => p.population },
    { title: 'Births', color: '#22c55e', getValue: (p) => p.births },
    { title: 'Food', color: '#f59e0b', getValue: (p) => p.food },
  ]

  return (
    <section class="bg-linear-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden" role="region" aria-labelledby="charts-heading">
      <div class="bg-linear-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 id="charts-heading" class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          Statistics
        </h2>
      </div>

      <div class="p-4 grid grid-cols-3 gap-4">
        <For each={charts}>
          {(chart) => <Chart config={chart} history={props.history} />}
        </For>
      </div>
    </section>
  )
}
