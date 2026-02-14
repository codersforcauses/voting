import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface LineChartProps {
  tally: Map<unknown, number>[]
  quota: number
}

export function LineChart({ tally, quota }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [currentRound, setCurrentRound] = useState(tally.length)
  const [isPlaying, setIsPlaying] = useState(false)

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

    // Prepare data for lines
    const lineData = candidates.map(candidate => ({
      name: candidate,
      values: tally.slice(0, currentRound).map((round, index) => ({
        round: index,
        votes: round.get(candidate) || 0
      }))
    }))

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(candidates)
      .range(d3.schemeTableau10)

    // Scales
    const x = d3.scaleLinear()
      .domain([0, tally.length - 1])
      .range([0, width])

    const maxVotes = d3.max(tally, round =>
      d3.max(Array.from(round.values()))
    ) || 0

    const y = d3.scaleLinear()
      .domain([0, Math.max(maxVotes, quota) * 1.1])
      .nice()
      .range([height, 0])

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(tally.length)
        .tickFormat(d => `Round ${Number(d) + 1}`)
      )
      .selectAll('text')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-15)')
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

    // Line generator
    const line = d3.line<{ round: number; votes: number }>()
      .x(d => x(d.round))
      .y(d => y(d.votes))
      .curve(d3.curveMonotoneX)

    // Add the lines with animation
    const lines = svg.selectAll('.line')
      .data(lineData)
      .join('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.name))
      .attr('stroke-width', 3)
      .attr('d', d => line(d.values))

    // Animate the lines
    lines.each(function() {
      const totalLength = (this as SVGPathElement).getTotalLength()

      d3.select(this)
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
    })

    // Add dots at data points
    lineData.forEach(candidate => {
      svg.selectAll(`.dot-${candidate.name.replace(/\s+/g, '-')}`)
        .data(candidate.values)
        .join('circle')
        .attr('class', `dot-${candidate.name.replace(/\s+/g, '-')}`)
        .attr('cx', d => x(d.round))
        .attr('cy', d => y(d.votes))
        .attr('r', 0)
        .attr('fill', colorScale(candidate.name))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .transition()
        .delay((_, i) => i * 200)
        .duration(300)
        .attr('r', 5)

      // Add hover effects to dots
      svg.selectAll(`.dot-${candidate.name.replace(/\s+/g, '-')}`)
        .on('mouseover', function(event, d: any) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)

          // Show tooltip
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', x(d.round))
            .attr('y', y(d.votes) - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#000')
            .text(`${candidate.name}: ${d.votes.toFixed(2)}`)
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)

          svg.selectAll('.tooltip').remove()
        })
    })

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`)

    candidates.forEach((candidate, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`)

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 7)
        .attr('y2', 7)
        .attr('stroke', colorScale(candidate))
        .attr('stroke-width', 3)

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
      .style('fill', 'var(--foreground)')
      .text('Vote Progression Over Rounds')

  }, [tally, quota, currentRound])

  // Animation controls
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentRound(prev => {
        if (prev >= tally.length) {
          setIsPlaying(false)
          return tally.length
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, tally.length])

  const handlePlayPause = () => {
    if (currentRound >= tally.length && !isPlaying) {
      setCurrentRound(1)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentRound(tally.length)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handlePlayPause}
          variant="outline"
          size="sm"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play Animation
            </>
          )}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="mx-auto"></svg>
      </div>
    </div>
  )
}
