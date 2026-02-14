import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WaterfallChartProps {
  tally: Map<unknown, number>[]
  quota: number
}

export function WaterfallChart({ tally, quota }: WaterfallChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedRound, setSelectedRound] = useState(0)

  useEffect(() => {
    if (!svgRef.current || !tally.length || selectedRound >= tally.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 60, right: 120, bottom: 80, left: 80 }
    const width = 900 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get data for current and next round
    const currentRound = tally[selectedRound]
    const nextRound = selectedRound < tally.length - 1 ? tally[selectedRound + 1] : null

    // Calculate changes between rounds
    interface BarData {
      candidate: string
      current: number
      next: number
      change: number
      isStart: boolean
      isEnd: boolean
      isPositive: boolean
    }

    const candidates = Array.from(currentRound.keys()).map(String)
    const barData: BarData[] = []

    candidates.forEach(candidate => {
      const current = currentRound.get(candidate) || 0
      const next = nextRound?.get(candidate) || 0

      if (current > 0 || next > 0) {
        barData.push({
          candidate,
          current,
          next,
          change: next - current,
          isStart: false,
          isEnd: false,
          isPositive: next > current
        })
      }
    })

    // Sort by current value
    barData.sort((a, b) => b.current - a.current)

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(candidates)
      .range(d3.schemeTableau10)

    // Scales
    const x = d3.scaleBand()
      .domain(barData.map(d => d.candidate))
      .range([0, width])
      .padding(0.3)

    const maxValue = Math.max(
      d3.max(barData, d => d.current) || 0,
      d3.max(barData, d => d.next) || 0,
      quota
    )

    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([height, 0])

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end')

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Votes')

    // Add quota line
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(quota))
      .attr('y2', y(quota))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    svg.append('text')
      .attr('x', width - 5)
      .attr('y', y(quota) - 5)
      .attr('text-anchor', 'end')
      .style('fill', '#ef4444')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(`Quota: ${quota}`)

    // Draw current round bars
    const bars = svg.selectAll('.bar-current')
      .data(barData)
      .join('rect')
      .attr('class', 'bar-current')
      .attr('x', d => x(d.candidate) || 0)
      .attr('width', x.bandwidth() / 2.5)
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => colorScale(d.candidate))
      .attr('opacity', 0.7)

    bars.transition()
      .duration(800)
      .attr('y', d => y(d.current))
      .attr('height', d => height - y(d.current))

    // Draw next round bars if available
    if (nextRound) {
      const nextBars = svg.selectAll('.bar-next')
        .data(barData)
        .join('rect')
        .attr('class', 'bar-next')
        .attr('x', d => (x(d.candidate) || 0) + x.bandwidth() / 2.2)
        .attr('width', x.bandwidth() / 2.5)
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', d => colorScale(d.candidate))
        .attr('opacity', 1)
        .attr('stroke', d => d.next >= quota ? '#16a34a' : 'none')
        .attr('stroke-width', 3)

      nextBars.transition()
        .delay(400)
        .duration(800)
        .attr('y', d => y(d.next))
        .attr('height', d => height - y(d.next))

      // Add arrows showing change
      barData.forEach(d => {
        if (Math.abs(d.change) > 0.01) {
          const xPos = (x(d.candidate) || 0) + x.bandwidth() / 2
          const yStart = y(d.current)
          const yEnd = y(d.next)

          // Arrow line
          svg.append('line')
            .attr('class', 'change-arrow')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', yStart)
            .attr('y2', yStart)
            .attr('stroke', d.isPositive ? '#16a34a' : '#dc2626')
            .attr('stroke-width', 2)
            .attr('marker-end', d.isPositive ? 'url(#arrow-down)' : 'url(#arrow-up)')
            .transition()
            .delay(1200)
            .duration(600)
            .attr('y2', yEnd)

          // Change label
          svg.append('text')
            .attr('class', 'change-label')
            .attr('x', xPos + 10)
            .attr('y', (yStart + yEnd) / 2)
            .attr('text-anchor', 'start')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', d.isPositive ? '#16a34a' : '#dc2626')
            .attr('opacity', 0)
            .text(`${d.change > 0 ? '+' : ''}${d.change.toFixed(2)}`)
            .transition()
            .delay(1800)
            .duration(400)
            .attr('opacity', 1)
        }
      })
    }

    // Add arrow markers
    const defs = svg.append('defs')

    // Down arrow (gain)
    defs.append('marker')
      .attr('id', 'arrow-down')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#16a34a')

    // Up arrow (loss)
    defs.append('marker')
      .attr('id', 'arrow-up')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#dc2626')

    // Add value labels on bars
    svg.selectAll('.label-current')
      .data(barData)
      .join('text')
      .attr('class', 'label-current')
      .attr('x', d => (x(d.candidate) || 0) + x.bandwidth() / 5)
      .attr('y', d => y(d.current) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .attr('opacity', 0)
      .text(d => d.current.toFixed(2))
      .transition()
      .delay(800)
      .duration(400)
      .attr('opacity', 1)

    if (nextRound) {
      svg.selectAll('.label-next')
        .data(barData)
        .join('text')
        .attr('class', 'label-next')
        .attr('x', d => (x(d.candidate) || 0) + x.bandwidth() / 1.5)
        .attr('y', d => y(d.next) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .attr('opacity', 0)
        .text(d => d.next.toFixed(2))
        .transition()
        .delay(1200)
        .duration(400)
        .attr('opacity', 1)
    }

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`)

    const legendItems = [
      { label: `Round ${selectedRound + 1}`, opacity: 0.7 },
      ...(nextRound ? [{ label: `Round ${selectedRound + 2}`, opacity: 1 }] : [])
    ]

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`)

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#666')
        .attr('opacity', item.opacity)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(item.label)
    })

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Vote Transfers: Round ${selectedRound + 1}${nextRound ? ` → Round ${selectedRound + 2}` : ''}`)

  }, [tally, quota, selectedRound])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-center">
        <label className="text-sm font-medium">Select Round:</label>
        <Select
          value={selectedRound.toString()}
          onValueChange={(value) => setSelectedRound(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tally.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                Round {index + 1}
                {index < tally.length - 1 ? ` → ${index + 2}` : ' (Final)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="mx-auto"></svg>
      </div>
    </div>
  )
}
