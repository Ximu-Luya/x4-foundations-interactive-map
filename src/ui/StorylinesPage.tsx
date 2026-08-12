import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  reachableStoryGraph,
  storyEdges,
  storyGraphSize,
  storyNodes,
  storyStarts,
  type StoryExpansion,
  type StoryNode,
} from '../data'

const expansionColors: Record<StoryExpansion, string> = {
  base: '#94a3b8',
  split: '#2dd4bf',
  cradle: '#fb7185',
}

type StoryNodeLayout = Pick<StoryNode, 'x' | 'y' | 'width' | 'height'>

const focusedGraphSize = { width: 1980, height: 1100 } as const
const focusedStartLayout: StoryNodeLayout = { x: 840, y: 30, width: 300, height: 72 }
const focusedNodeLayouts: Record<string, StoryNodeLayout> = {
  'fires-revenge': { x: 20, y: 160, width: 300, height: 76 },
  'spear-claim': { x: 20, y: 160, width: 300, height: 76 },
  'phq-standard': { x: 380, y: 160, width: 340, height: 76 },
  'phq-terran': { x: 380, y: 160, width: 340, height: 76 },
  'phq-pioneer': { x: 380, y: 160, width: 340, height: 76 },
  headquarters: { x: 400, y: 300, width: 300, height: 72 },
  hatikvah: { x: 800, y: 160, width: 340, height: 76 },
  solborn: { x: 1280, y: 160, width: 380, height: 76 },
  'project-genesis-plot': { x: 20, y: 410, width: 360, height: 80 },
  'diplomacy-ready': { x: 500, y: 410, width: 360, height: 80 },
  paranid: { x: 100, y: 550, width: 330, height: 72 },
  'free-families': { x: 510, y: 550, width: 350, height: 72 },
  covert: { x: 930, y: 550, width: 340, height: 72 },
  yaki: { x: 1440, y: 550, width: 330, height: 72 },
  'decision-paranid': { x: 140, y: 680, width: 250, height: 90 },
  'decision-free-families': { x: 560, y: 680, width: 250, height: 90 },
  'decision-covert': { x: 970, y: 680, width: 250, height: 90 },
  'decision-yaki-threat': { x: 1320, y: 680, width: 220, height: 90 },
  'decision-yaki-amplifier': { x: 1640, y: 680, width: 220, height: 90 },
  'outcome-paranid-unify': { x: 20, y: 830, width: 250, height: 70 },
  'outcome-paranid-escalate': { x: 290, y: 830, width: 250, height: 70 },
  'outcome-paranid-war': { x: 20, y: 950, width: 370, height: 78 },
  'outcome-zya': { x: 550, y: 830, width: 280, height: 70 },
  'outcome-rebellion': { x: 550, y: 950, width: 330, height: 78 },
  'outcome-covert-none': { x: 920, y: 810, width: 220, height: 70 },
  'outcome-terran-war': { x: 920, y: 900, width: 330, height: 78 },
  'outcome-trade-break': { x: 920, y: 1000, width: 330, height: 78 },
  'outcome-yaki-purge': { x: 1320, y: 830, width: 280, height: 70 },
  'outcome-yaki-none': { x: 1660, y: 830, width: 220, height: 70 },
  'outcome-xenon-sol': { x: 1320, y: 950, width: 280, height: 78 },
  'outcome-yaki-trade': { x: 1660, y: 950, width: 280, height: 78 },
}

function center(node: StoryNode) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 }
}

function edgePath(from: StoryNode, to: StoryNode) {
  const source = center(from)
  const target = center(to)
  const verticalGap = to.y - (from.y + from.height)

  if (verticalGap >= 0) {
    const startY = from.y + from.height
    const endY = to.y
    const middleY = startY + verticalGap / 2
    return `M ${source.x} ${startY} V ${middleY} H ${target.x} V ${endY}`
  }

  const startX = source.x <= target.x ? from.x + from.width : from.x
  const endX = source.x <= target.x ? to.x : to.x + to.width
  const middleX = startX + (endX - startX) / 2
  return `M ${startX} ${source.y} H ${middleX} V ${target.y} H ${endX}`
}

function nodePolygon(node: StoryNode) {
  const { height, width, x, y } = node
  if (node.kind === 'decision') {
    return `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`
  }
  const cut = Math.min(24, width * 0.08)
  return `${x + cut},${y} ${x + width - cut},${y} ${x + width},${y + height / 2} ${x + width - cut},${y + height} ${x + cut},${y + height} ${x},${y + height / 2}`
}

function wrapLabel(label: string, maxCharacters: number) {
  return label
    .split('\n')
    .flatMap((paragraph) => {
      const words = paragraph.split(' ')
      if (words.length === 1 && paragraph.length > maxCharacters) {
        const chunks: string[] = []
        for (let index = 0; index < paragraph.length; index += maxCharacters) {
          chunks.push(paragraph.slice(index, index + maxCharacters))
        }
        return chunks
      }
      const lines: string[] = []
      words.forEach((word) => {
        const last = lines.at(-1)
        if (last && `${last} ${word}`.length <= maxCharacters) lines[lines.length - 1] = `${last} ${word}`
        else lines.push(word)
      })
      return lines
    })
}

export function StorylinesPage() {
  const { t } = useTranslation()
  const tr = (key: string, values: Record<string, string | number> = {}) => {
    return t(key, values)
  }
  const [selectedStartId, setSelectedStartId] = useState(storyStarts[0].id)
  const [zoom, setZoom] = useState(1)
  const selectedStart = storyStarts.find((start) => start.id === selectedStartId) ?? null
  const highlighted = selectedStart ? reachableStoryGraph(selectedStart.nodeId) : null
  const displayNodes = selectedStart
    ? storyNodes
        .filter((node) => highlighted?.nodeIds.has(node.id))
        .map((node) => ({
          ...node,
          ...(node.id === selectedStart.nodeId
            ? focusedStartLayout
            : focusedNodeLayouts[node.id] ?? {}),
        }))
    : storyNodes
  const displayNodeIds = new Set(displayNodes.map((node) => node.id))
  const displayEdges = storyEdges.filter(
    (edge) => displayNodeIds.has(edge.from) && displayNodeIds.has(edge.to),
  )
  const nodesById = new Map(displayNodes.map((node) => [node.id, node]))
  const graphSize = selectedStart ? focusedGraphSize : storyGraphSize

  return (
    <div className="storylines-page">
      <section className="border-b border-subtle/60 bg-surface2/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan">
            {tr('storylines.hero.kicker')}
          </p>
          <h1 className="max-w-4xl font-display text-3xl font-black tracking-tight md:text-5xl">
            {tr('storylines.hero.title')}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-relaxed text-mute">
            {tr('storylines.hero.intro')}
          </p>
          <p className="mt-3 font-mono text-xs tracking-wide text-mute2">
            {tr('storylines.hero.scope')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 md:px-8 md:py-12">
        <div className="story-start-layout">
          <aside className="story-start-panel" aria-label={tr('storylines.labels.select_start')}>
            <div className="story-start-heading">
              <span>{tr('storylines.labels.select_start')}</span>
              <button type="button" onClick={() => setSelectedStartId('')}>
                {tr('storylines.hero.clear')}
              </button>
            </div>
            <div className="story-start-list">
              {storyStarts.map((start) => (
                <button
                  key={start.id}
                  type="button"
                  aria-pressed={selectedStartId === start.id}
                  className={`story-start-button expansion-${start.expansion}`}
                  onClick={() => setSelectedStartId(start.id)}
                >
                  <span>{tr(start.titleKey)}</span>
                  <small>{tr(`storylines.labels.${start.expansion}`)}</small>
                </button>
              ))}
            </div>

            {selectedStart ? (
              <article className="story-start-summary" aria-live="polite">
                <p className="story-summary-label">{tr('storylines.labels.selected_route')}</p>
                <h2>{tr(selectedStart.titleKey)}</h2>
                <p>{tr(selectedStart.summaryKey)}</p>
                <dl>
                  <div>
                    <dt>{tr('storylines.labels.headquarters_route')}</dt>
                    <dd>{tr(selectedStart.headquartersKey)}</dd>
                  </div>
                  <div>
                    <dt>{tr('storylines.labels.exclusive_route')}</dt>
                    <dd>{tr(selectedStart.exclusiveKey)}</dd>
                  </div>
                </dl>
              </article>
            ) : null}
          </aside>

          <div className="story-chart-shell">
            <div className="story-chart-toolbar">
              <div className="story-chart-toolbar-left">
                <div className="story-legend">
                {(['base', 'split', 'cradle'] as const).map((expansion) => (
                  <span key={expansion}>
                    <i style={{ backgroundColor: expansionColors[expansion] }} />
                    {tr(`storylines.labels.${expansion}`)}
                  </span>
                ))}
                </div>
                <div className="story-chart-controls" aria-label={tr('storylines.labels.zoom_level', { percent: Math.round(zoom * 100) })}>
                  <button
                    type="button"
                    aria-label={tr('storylines.labels.zoom_out')}
                    onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                    disabled={zoom <= 1}
                  >
                    −
                  </button>
                  <span>{tr('storylines.labels.zoom_level', { percent: Math.round(zoom * 100) })}</span>
                  <button
                    type="button"
                    aria-label={tr('storylines.labels.zoom_in')}
                    onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
                    disabled={zoom >= 3}
                  >
                    +
                  </button>
                  <button type="button" onClick={() => setZoom(1)}>
                    {tr('storylines.labels.fit')}
                  </button>
                </div>
              </div>
              {selectedStart ? <p>{tr('storylines.labels.dimmed_hint')}</p> : null}
            </div>
            <div className="story-chart-scroll">
              <svg
                className="story-chart"
                style={{
                  width: `${zoom * 100}%`,
                  aspectRatio: `${graphSize.width} / ${graphSize.height}`,
                }}
                viewBox={`0 0 ${graphSize.width} ${graphSize.height}`}
                role="img"
                aria-label={tr('storylines.labels.diagram_aria')}
              >
                <defs>
                  <marker
                    id="story-arrow"
                    markerWidth="20"
                    markerHeight="20"
                    refX="9"
                    refY="5"
                    viewBox="0 0 10 10"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 1.25 1.5 L 8.5 5 L 1.25 8.5"
                      fill="none"
                      stroke="context-stroke"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </marker>
                  <filter id="story-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g className="story-edges">
                  {displayEdges.map((edge) => {
                    const from = nodesById.get(edge.from)
                    const to = nodesById.get(edge.to)
                    if (!from || !to) return null
                    const active = !highlighted || highlighted.edgeIds.has(edge.id)
                    return (
                      <path
                        key={edge.id}
                        data-edge-id={edge.id}
                        className={`story-edge ${active ? 'is-active' : 'is-muted'} ${edge.relation === 'requires' ? 'is-required' : ''}`}
                        d={edgePath(from, to)}
                        markerEnd="url(#story-arrow)"
                      />
                    )
                  })}
                </g>

                <g className="story-nodes">
                  {displayNodes.map((node) => {
                    const active = !highlighted || highlighted.nodeIds.has(node.id)
                    const selected = node.id === selectedStart?.nodeId
                    const lines = wrapLabel(tr(node.labelKey), node.kind === 'decision' ? 14 : 20)
                    const lineHeight = node.kind === 'start' ? 21 : 22
                    const labelStart = center(node).y - ((lines.length - 1) * lineHeight) / 2
                    const nodeClass = `story-node kind-${node.kind} expansion-${node.expansion} ${active ? 'is-active' : 'is-muted'} ${selected ? 'is-selected' : ''}`
                    const commonProps = {
                      fill: '#111827',
                      stroke: expansionColors[node.expansion],
                    }
                    return (
                      <g key={node.id} data-node-id={node.id} className={nodeClass}>
                        {node.kind === 'start' || node.kind === 'state' ? (
                          <rect
                            {...commonProps}
                            x={node.x}
                            y={node.y}
                            width={node.width}
                            height={node.height}
                            rx={node.kind === 'state' ? node.height / 2 : 14}
                          />
                        ) : (
                          <polygon {...commonProps} points={nodePolygon(node)} />
                        )}
                        <text x={center(node).x} y={labelStart} textAnchor="middle">
                          {lines.map((line, index) => (
                            <tspan
                              key={`${line}-${index}`}
                              x={center(node).x}
                              dy={index === 0 ? 0 : lineHeight}
                            >
                              {line}
                            </tspan>
                          ))}
                        </text>
                        {node.noteKey ? (
                          <text
                            className="story-node-note"
                            x={center(node).x}
                            y={node.y + node.height - 10}
                            textAnchor="middle"
                          >
                            {tr(node.noteKey)}
                          </text>
                        ) : null}
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
