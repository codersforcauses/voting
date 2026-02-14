import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface StackedBarChartProps {
  tally: Map<unknown, number>[]
  quota: number
}

export function StackedBarChart({ tally, quota }: StackedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !tally.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 40, right: 120, bottom: 60, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get all unique candidates
    const allCandidates = new Set<string>()
    tally.forEach(round => {
      round.forEach((_, candidate) => {
        allCandidates.add(String(candidate))
      })
    })

    const candidates = Array.from(allCandidates)

    // Prepare data for stacking
    const data = tally.map((round, index) => {
      const roundData: any = { round: `Round ${index + 1}` }
      candidates.forEach(candidate => {
        roundData[candidate] = round.get(candidate) || 0
      })
      return roundData
    })

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(candidates)
      .range(d3.schemeTableau10)

    // Stack the data
    const stack = d3.stack<any>()
      .keys(candidates)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    const series = stack(data)

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.round))
      .range([0, width])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, s => d3.max(s, d => d[1])) || 0])
      .nice()
      .range([height, 0])

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')

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
      .style('fill', 'var(--foreground)')
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

    // Add the bars with animation
    const groups = svg.selectAll('g.series')
      .data(series)
      .join('g')
      .attr('class', 'series')
      .attr('fill', d => colorScale(d.key))

    groups.selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.round) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))

    // Add tooltips
    groups.selectAll('rect')
      .on('mouseover', function(event, d: any) {
        const candidateName = d3.select(this.parentNode).datum() as any
        const votes = d[1] - d[0]

        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)

        // Show tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (x(d.data.round) || 0) + x.bandwidth() / 2)
          .attr('y', y(d[1]) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', 'var(--foreground)')
          .text(`${candidateName.key}: ${votes.toFixed(2)}`)
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', 'none')

        svg.selectAll('.tooltip').remove()
      })

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`)

    candidates.forEach((candidate, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`)

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(candidate))

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('fill', 'var(--foreground)')
        .text(candidate)
    })

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Vote Distribution by Round')

  }, [tally, quota])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  )
}
