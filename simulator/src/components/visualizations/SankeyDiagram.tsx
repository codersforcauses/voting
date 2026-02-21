import { useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, type SankeyNode, type SankeyLink } from 'd3-sankey'
import type { TallyEntry } from '@lib/election-system/src/types'

interface SankeyDiagramProps {
  tally: Map<PropertyKey, TallyEntry>[]
  quota: number
  winners: unknown[]
}

interface NodeExtra {
  candidate: string
  round: number
  votes: number
  status: 'elected' | 'eliminated' | 'active'
}

interface LinkExtra {
  type: 'retained' | 'transfer'
}

type SNode = SankeyNode<NodeExtra, LinkExtra>
type SLink = SankeyLink<NodeExtra, LinkExtra>

function buildSankeyData(
  tally: Map<PropertyKey, TallyEntry>[],
  quota: number,
  winners: unknown[]
): { nodes: NodeExtra[]; links: (LinkExtra & { source: number; target: number; value: number })[] } {
  const winnerSet = new Set(winners.map(String))
  const nodes: NodeExtra[] = []
  const links: (LinkExtra & { source: number; target: number; value: number })[] = []
  const nodeIndex = new Map<string, number>()

  // Create nodes for each candidate in each round
  for (let r = 0; r < tally.length; r++) {
    const round = tally[r]
    const nextRound = r < tally.length - 1 ? tally[r + 1] : null

    for (const [candidate, entry] of round.entries()) {
      const key = `${String(candidate)}-r${r}`
      const isElected = entry.count >= quota
      const isEliminated = nextRound !== null && !nextRound.has(candidate)
      const isFinalRound = r === tally.length - 1

      let status: 'elected' | 'eliminated' | 'active' = 'active'
      if (isElected) status = 'elected'
      if (isEliminated) status = 'eliminated'
      if (isFinalRound && winnerSet.has(String(candidate))) status = 'elected'

      nodeIndex.set(key, nodes.length)
      nodes.push({ candidate: String(candidate), round: r, votes: entry.count, status })
    }
  }

  // Create links between rounds using exact transfer data
  for (let r = 0; r < tally.length - 1; r++) {
    const currentRound = tally[r]
    const nextRound = tally[r + 1]

    for (const [candidate, entry] of nextRound.entries()) {
      const targetKey = `${String(candidate)}-r${r + 1}`
      const targetIdx = nodeIndex.get(targetKey)!

      // Exact transfer links from the tally's transfer data
      let transferredIn = 0
      for (const transfer of entry.transfers) {
        const value = transfer.votes * transfer.weight
        transferredIn += value
        const sourceKey = `${String(transfer.from)}-r${r}`
        const sourceIdx = nodeIndex.get(sourceKey)
        if (sourceIdx !== undefined && value > 0.001) {
          links.push({ source: sourceIdx, target: targetIdx, value, type: 'transfer' })
        }
      }

      // Retained votes = votes carried over from the same candidate in the previous round
      if (currentRound.has(candidate)) {
        const retained = entry.count - transferredIn
        if (retained > 0.001) {
          const sourceKey = `${String(candidate)}-r${r}`
          const sourceIdx = nodeIndex.get(sourceKey)!
          links.push({ source: sourceIdx, target: targetIdx, value: retained, type: 'retained' })
        }
      }
    }
  }

  return { nodes, links }
}

const STATUS_COLORS = {
  elected: { fill: '#16a34a', stroke: '#15803d' },
  eliminated: { fill: '#dc2626', stroke: '#b91c1c' },
  active: { fill: '#a3a3a3', stroke: '#737373' },
}

const MARGIN = { top: 24, right: 120, bottom: 24, left: 120 }
const WIDTH = 900

export function SankeyDiagram({ tally, quota, winners }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const data = useMemo(() => buildSankeyData(tally, quota, winners), [tally, quota, winners])

  const maxCandidatesInRound = useMemo(() => {
    const counts = new Map<number, number>()
    for (const n of data.nodes) {
      counts.set(n.round, (counts.get(n.round) ?? 0) + 1)
    }
    return Math.max(...counts.values(), 1)
  }, [data])

  const height = Math.max(300, maxCandidatesInRound * 50 + MARGIN.top + MARGIN.bottom)

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const sankeyGenerator = sankey<NodeExtra, LinkExtra>()
      .nodeId((((_d: SNode, i: number) => i) as unknown as (node: SNode) => string | number))
      .nodeWidth(16)
      .nodePadding(12)
      .nodeSort((a, b) => (b as SNode & NodeExtra).votes - (a as SNode & NodeExtra).votes)
      .extent([
        [MARGIN.left, MARGIN.top],
        [WIDTH - MARGIN.right, height - MARGIN.bottom],
      ])

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    })

    // Draw links
    svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d) => {
        const source = d.source as SNode & NodeExtra
        const link = d as SLink & LinkExtra
        if (link.type === 'transfer') {
          return source.status === 'eliminated' ? '#ef444480' : '#22c55e60'
        }
        return '#ffffff18'
      })
      .attr('stroke-width', (d) => Math.max(1, d.width ?? 1))
      .attr('opacity', 0.6)
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 0.9)
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.6)
      })

    // Draw nodes
    const nodeGroup = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')

    nodeGroup
      .append('rect')
      .attr('x', (d) => d.x0 ?? 0)
      .attr('y', (d) => d.y0 ?? 0)
      .attr('height', (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr('width', (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr('fill', (d) => {
        const node = d as SNode & NodeExtra
        return STATUS_COLORS[node.status].fill
      })
      .attr('stroke', (d) => {
        const node = d as SNode & NodeExtra
        return STATUS_COLORS[node.status].stroke
      })
      .attr('stroke-width', 1)
      .attr('rx', 2)

    // Labels
    nodeGroup
      .append('text')
      .attr('x', (d) => ((d.x0 ?? 0) < WIDTH / 2 ? (d.x1 ?? 0) + 8 : (d.x0 ?? 0) - 8))
      .attr('y', (d) => ((d.y1 ?? 0) + (d.y0 ?? 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => ((d.x0 ?? 0) < WIDTH / 2 ? 'start' : 'end'))
      .attr('fill', '#e5e5e5')
      .attr('font-size', '12px')
      .attr('font-family', 'ui-monospace, monospace')
      .text((d) => {
        const node = d as SNode & NodeExtra
        return `${node.candidate} (${node.votes.toFixed(1)})`
      })

    // Round labels
    const roundXPositions = new Map<number, { x0: number; x1: number }>()
    for (const node of nodes) {
      const n = node as SNode & NodeExtra
      if (!roundXPositions.has(n.round)) {
        roundXPositions.set(n.round, { x0: node.x0 ?? 0, x1: node.x1 ?? 0 })
      }
    }

    for (const [round, pos] of roundXPositions.entries()) {
      svg
        .append('text')
        .attr('x', (pos.x0 + pos.x1) / 2)
        .attr('y', MARGIN.top - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a3a3a3')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`Round ${round + 1}`)
    }
  }, [data, height])

  if (data.nodes.length === 0) {
    return <p className="text-muted-foreground text-sm">Not enough data to visualize.</p>
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.elected.fill }} />
          Elected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.eliminated.fill }} />
          Eliminated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.active.fill }} />
          Active
        </span>
      </div>
      <svg ref={svgRef} width={WIDTH} height={height} className="w-full" viewBox={`0 0 ${WIDTH} ${height}`} />
    </div>
  )
}
