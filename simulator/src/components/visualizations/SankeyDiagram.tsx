import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import type { SankeyNode } from 'd3-sankey'

interface SankeyDiagramProps {
  votes: Record<string, string[]>
  tally: Map<unknown, number>[]
}

interface NodeData {
  name: string
}

interface LinkData {
  source: number
  target: number
  value: number
}

export function SankeyDiagram({ votes, tally }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !tally.length || Object.keys(votes).length === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const margin = { top: 20, right: 200, bottom: 20, left: 20 }
    const width = 1000 - margin.left - margin.right
    const height = 600 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Build Sankey data from vote preferences
    const nodes: NodeData[] = []
    const links: LinkData[] = []
    const nodeMap = new Map<string, number>()

    // Get all unique candidates
    const allCandidates = new Set<string>()
    Object.values(votes).forEach(prefs => {
      prefs.forEach(candidate => allCandidates.add(candidate))
    })

    const candidates = Array.from(allCandidates)

    // Create nodes for each preference position
    const maxPrefs = Math.max(...Object.values(votes).map(v => v.length))

    for (let pref = 0; pref < maxPrefs; pref++) {
      candidates.forEach(candidate => {
        const nodeName = `${candidate} (Pref ${pref + 1})`
        nodeMap.set(nodeName, nodes.length)
        nodes.push({ name: nodeName })
      })
    }

    // Create links based on vote flows
    Object.values(votes).forEach(preferences => {
      for (let i = 0; i < preferences.length - 1; i++) {
        const sourceNode = `${preferences[i]} (Pref ${i + 1})`
        const targetNode = `${preferences[i + 1]} (Pref ${i + 2})`

        const sourceIndex = nodeMap.get(sourceNode)
        const targetIndex = nodeMap.get(targetNode)

        if (sourceIndex !== undefined && targetIndex !== undefined) {
          // Find existing link or create new one
          const existingLink = links.find(
            l => l.source === sourceIndex && l.target === targetIndex
          )

          if (existingLink) {
            existingLink.value += 1
          } else {
            links.push({
              source: sourceIndex,
              target: targetIndex,
              value: 1
            })
          }
        }
      }
    })

    // Create the Sankey generator
    const sankeyGenerator = sankey<NodeData, LinkData>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [width, height]])

    // Generate the Sankey layout
    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    })

    // Color scale based on candidate
    const colorScale = d3.scaleOrdinal<string>()
      .domain(candidates)
      .range(d3.schemeTableau10)

    // Helper to get candidate name from node name
    const getCandidateName = (nodeName: string) => {
      return nodeName.split(' (Pref')[0]
    }

    // Add links
    const link = svg.append('g')
      .selectAll('.link')
      .data(sankeyLinks)
      .join('path')
      .attr('class', 'link')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        const candidateName = getCandidateName((d.source as SankeyNode<NodeData, LinkData>).name)
        return colorScale(candidateName)
      })
      .attr('stroke-width', d => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.3)

    // Add link hover effects
    link
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke-width', (d.width || 0) + 2)

        // Show tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', ((d.source as SankeyNode<NodeData, LinkData>).x1 || 0 + (d.target as SankeyNode<NodeData, LinkData>).x0! || 0) / 2)
          .attr('y', ((d.source as SankeyNode<NodeData, LinkData>).y1 || 0 + (d.target as SankeyNode<NodeData, LinkData>).y0! || 0) / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', '#000')
          .text(`${d.value} vote${d.value > 1 ? 's' : ''}`)
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.3)
          .attr('stroke-width', (d) => Math.max(1, d.width || 0))

        svg.selectAll('.tooltip').remove()
      })

    // Add nodes
    const node = svg.append('g')
      .selectAll('.node')
      .data(sankeyNodes)
      .join('g')
      .attr('class', 'node')

    node.append('rect')
      .attr('x', d => d.x0 || 0)
      .attr('y', d => d.y0 || 0)
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', d => {
        const candidateName = getCandidateName(d.name)
        return colorScale(candidateName)
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 1)

    // Add node labels
    node.append('text')
      .attr('x', d => (d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6)
      .attr('y', d => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 || 0) < width / 2 ? 'start' : 'end')
      .style('font-size', '11px')
      .text(d => {
        const votes = d.value || 0
        return votes > 0 ? `${getCandidateName(d.name)} (${votes})` : ''
      })
      .filter(d => (d.y1 || 0) - (d.y0 || 0) > 15)

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Preference Flow Diagram')

    // Add preference labels
    const prefLevels = Array.from(new Set(nodes.map(n => n.name.match(/Pref (\d+)/)?.[1]))).filter(Boolean)
    prefLevels.forEach((pref, i) => {
      svg.append('text')
        .attr('x', (width / (prefLevels.length + 1)) * (i + 1))
        .attr('y', height + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#666')
        .text(`Preference ${pref}`)
    })

  }, [votes, tally])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  )
}
