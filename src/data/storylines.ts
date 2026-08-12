export type StoryExpansion = 'base' | 'split' | 'cradle'

export type StoryNodeKind = 'start' | 'mission' | 'state' | 'gate' | 'decision' | 'outcome'

export type StoryNode = {
  id: string
  labelKey: string
  noteKey?: string
  kind: StoryNodeKind
  expansion: StoryExpansion
  x: number
  y: number
  width: number
  height: number
}

export type StoryEdge = {
  id: string
  from: string
  to: string
  relation?: 'flow' | 'requires'
}

export type StoryStart = {
  id: string
  nodeId: string
  titleKey: string
  summaryKey: string
  headquartersKey: string
  exclusiveKey: string
  expansion: StoryExpansion
}

export const storyGraphSize = {
  width: 3160,
  height: 1500,
} as const

const startY = 60
const startWidth = 280
const startHeight = 76

export const storyNodes: StoryNode[] = [
  {
    id: 'start-young-gun',
    labelKey: 'storylines.nodes.start_young_gun',
    kind: 'start',
    expansion: 'base',
    x: 40,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-entrepreneur',
    labelKey: 'storylines.nodes.start_entrepreneur',
    kind: 'start',
    expansion: 'base',
    x: 360,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-warrior',
    labelKey: 'storylines.nodes.start_warrior',
    kind: 'start',
    expansion: 'base',
    x: 680,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-explorer',
    labelKey: 'storylines.nodes.start_explorer',
    noteKey: 'storylines.labels.unlock_start',
    kind: 'start',
    expansion: 'base',
    x: 1000,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-scientist',
    labelKey: 'storylines.nodes.start_scientist',
    noteKey: 'storylines.labels.unlock_start',
    kind: 'start',
    expansion: 'base',
    x: 1320,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-fires',
    labelKey: 'storylines.nodes.start_fires',
    kind: 'start',
    expansion: 'split',
    x: 1640,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-spear',
    labelKey: 'storylines.nodes.start_spear',
    kind: 'start',
    expansion: 'split',
    x: 1960,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-cadet',
    labelKey: 'storylines.nodes.start_cadet',
    kind: 'start',
    expansion: 'cradle',
    x: 2280,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'start-genesis',
    labelKey: 'storylines.nodes.start_genesis',
    kind: 'start',
    expansion: 'cradle',
    x: 2600,
    y: startY,
    width: startWidth,
    height: startHeight,
  },
  {
    id: 'fires-revenge',
    labelKey: 'storylines.nodes.fires_revenge',
    noteKey: 'storylines.labels.exclusive',
    kind: 'mission',
    expansion: 'split',
    x: 1560,
    y: 220,
    width: 320,
    height: 86,
  },
  {
    id: 'spear-claim',
    labelKey: 'storylines.nodes.spear_claim',
    noteKey: 'storylines.labels.exclusive',
    kind: 'mission',
    expansion: 'split',
    x: 1920,
    y: 220,
    width: 320,
    height: 86,
  },
  {
    id: 'phq-standard',
    labelKey: 'storylines.nodes.phq_standard',
    kind: 'mission',
    expansion: 'base',
    x: 300,
    y: 250,
    width: 370,
    height: 86,
  },
  {
    id: 'phq-terran',
    labelKey: 'storylines.nodes.phq_terran',
    kind: 'mission',
    expansion: 'cradle',
    x: 2280,
    y: 250,
    width: 360,
    height: 86,
  },
  {
    id: 'phq-pioneer',
    labelKey: 'storylines.nodes.phq_pioneer',
    kind: 'mission',
    expansion: 'cradle',
    x: 2690,
    y: 250,
    width: 360,
    height: 86,
  },
  {
    id: 'headquarters',
    labelKey: 'storylines.nodes.headquarters',
    kind: 'state',
    expansion: 'base',
    x: 760,
    y: 410,
    width: 330,
    height: 82,
  },
  {
    id: 'hatikvah',
    labelKey: 'storylines.nodes.hatikvah',
    kind: 'mission',
    expansion: 'base',
    x: 1190,
    y: 410,
    width: 360,
    height: 82,
  },
  {
    id: 'solborn',
    labelKey: 'storylines.nodes.solborn',
    kind: 'mission',
    expansion: 'cradle',
    x: 2260,
    y: 410,
    width: 410,
    height: 82,
  },
  {
    id: 'project-genesis-plot',
    labelKey: 'storylines.nodes.project_genesis_plot',
    noteKey: 'storylines.nodes.project_genesis_plot_note',
    kind: 'mission',
    expansion: 'cradle',
    x: 220,
    y: 570,
    width: 430,
    height: 90,
  },
  {
    id: 'diplomacy-ready',
    labelKey: 'storylines.nodes.diplomacy_ready',
    noteKey: 'storylines.labels.all_prerequisites',
    kind: 'gate',
    expansion: 'base',
    x: 960,
    y: 570,
    width: 390,
    height: 90,
  },
  {
    id: 'paranid',
    labelKey: 'storylines.nodes.paranid',
    kind: 'mission',
    expansion: 'base',
    x: 700,
    y: 730,
    width: 360,
    height: 82,
  },
  {
    id: 'free-families',
    labelKey: 'storylines.nodes.free_families',
    kind: 'mission',
    expansion: 'split',
    x: 1190,
    y: 730,
    width: 360,
    height: 82,
  },
  {
    id: 'covert',
    labelKey: 'storylines.nodes.covert',
    kind: 'mission',
    expansion: 'cradle',
    x: 1960,
    y: 730,
    width: 360,
    height: 82,
  },
  {
    id: 'yaki',
    labelKey: 'storylines.nodes.yaki',
    kind: 'mission',
    expansion: 'cradle',
    x: 2480,
    y: 730,
    width: 360,
    height: 82,
  },
  {
    id: 'decision-paranid',
    labelKey: 'storylines.nodes.decision_paranid',
    kind: 'decision',
    expansion: 'base',
    x: 760,
    y: 890,
    width: 240,
    height: 120,
  },
  {
    id: 'decision-free-families',
    labelKey: 'storylines.nodes.decision_free_families',
    kind: 'decision',
    expansion: 'split',
    x: 1250,
    y: 890,
    width: 240,
    height: 120,
  },
  {
    id: 'decision-covert',
    labelKey: 'storylines.nodes.decision_covert',
    kind: 'decision',
    expansion: 'cradle',
    x: 2020,
    y: 890,
    width: 240,
    height: 120,
  },
  {
    id: 'decision-yaki-threat',
    labelKey: 'storylines.nodes.decision_yaki_threat',
    kind: 'decision',
    expansion: 'cradle',
    x: 2390,
    y: 890,
    width: 240,
    height: 120,
  },
  {
    id: 'decision-yaki-amplifier',
    labelKey: 'storylines.nodes.decision_yaki_amplifier',
    kind: 'decision',
    expansion: 'cradle',
    x: 2740,
    y: 890,
    width: 240,
    height: 120,
  },
  {
    id: 'outcome-paranid-unify',
    labelKey: 'storylines.nodes.outcome_paranid_unify',
    kind: 'outcome',
    expansion: 'base',
    x: 560,
    y: 1080,
    width: 280,
    height: 78,
  },
  {
    id: 'outcome-paranid-escalate',
    labelKey: 'storylines.nodes.outcome_paranid_escalate',
    kind: 'outcome',
    expansion: 'base',
    x: 850,
    y: 1080,
    width: 280,
    height: 78,
  },
  {
    id: 'outcome-paranid-war',
    labelKey: 'storylines.nodes.outcome_paranid_war',
    kind: 'outcome',
    expansion: 'base',
    x: 530,
    y: 1230,
    width: 340,
    height: 92,
  },
  {
    id: 'outcome-zya',
    labelKey: 'storylines.nodes.outcome_zya',
    kind: 'outcome',
    expansion: 'split',
    x: 1170,
    y: 1080,
    width: 280,
    height: 78,
  },
  {
    id: 'outcome-rebellion',
    labelKey: 'storylines.nodes.outcome_rebellion',
    kind: 'outcome',
    expansion: 'split',
    x: 1460,
    y: 1080,
    width: 280,
    height: 78,
  },
  {
    id: 'outcome-covert-none',
    labelKey: 'storylines.nodes.outcome_none',
    kind: 'outcome',
    expansion: 'cradle',
    x: 1780,
    y: 1080,
    width: 220,
    height: 78,
  },
  {
    id: 'outcome-terran-war',
    labelKey: 'storylines.nodes.outcome_terran_war',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2040,
    y: 1080,
    width: 300,
    height: 92,
  },
  {
    id: 'outcome-trade-break',
    labelKey: 'storylines.nodes.outcome_trade_break',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2380,
    y: 1080,
    width: 300,
    height: 92,
  },
  {
    id: 'outcome-yaki-purge',
    labelKey: 'storylines.nodes.outcome_yaki_purge',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2280,
    y: 1230,
    width: 280,
    height: 82,
  },
  {
    id: 'outcome-yaki-none',
    labelKey: 'storylines.nodes.outcome_none',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2590,
    y: 1230,
    width: 220,
    height: 82,
  },
  {
    id: 'outcome-xenon-sol',
    labelKey: 'storylines.nodes.outcome_xenon_sol',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2840,
    y: 1230,
    width: 280,
    height: 82,
  },
  {
    id: 'outcome-yaki-trade',
    labelKey: 'storylines.nodes.outcome_yaki_trade',
    kind: 'outcome',
    expansion: 'cradle',
    x: 2840,
    y: 1370,
    width: 280,
    height: 82,
  },
]

const baseStarts = [
  'start-young-gun',
  'start-entrepreneur',
  'start-warrior',
  'start-explorer',
] as const
const standardPhqStarts = [...baseStarts, 'start-fires', 'start-spear'] as const
const allStarts = [
  ...baseStarts,
  'start-scientist',
  'start-fires',
  'start-spear',
  'start-cadet',
  'start-genesis',
] as const

function edgesFromStarts(prefix: string, starts: readonly string[], to: string): StoryEdge[] {
  return starts.map((from) => ({ id: `${prefix}-${from}`, from, to }))
}

export const storyEdges: StoryEdge[] = [
  ...edgesFromStarts('standard-phq', standardPhqStarts, 'phq-standard'),
  ...edgesFromStarts('hatikvah-access', allStarts, 'hatikvah'),
  ...edgesFromStarts('solborn-access', allStarts, 'solborn'),
  { id: 'scientist-has-phq', from: 'start-scientist', to: 'headquarters' },
  { id: 'fires-exclusive', from: 'start-fires', to: 'fires-revenge' },
  { id: 'spear-exclusive', from: 'start-spear', to: 'spear-claim' },
  { id: 'cadet-phq', from: 'start-cadet', to: 'phq-terran' },
  { id: 'genesis-phq', from: 'start-genesis', to: 'phq-pioneer' },
  { id: 'standard-phq-complete', from: 'phq-standard', to: 'headquarters' },
  { id: 'terran-phq-complete', from: 'phq-terran', to: 'headquarters' },
  { id: 'pioneer-phq-complete', from: 'phq-pioneer', to: 'headquarters' },
  { id: 'headquarters-genesis', from: 'headquarters', to: 'project-genesis-plot' },
  {
    id: 'headquarters-diplomacy',
    from: 'headquarters',
    to: 'diplomacy-ready',
    relation: 'requires',
  },
  {
    id: 'hatikvah-diplomacy',
    from: 'hatikvah',
    to: 'diplomacy-ready',
    relation: 'requires',
  },
  { id: 'diplomacy-paranid', from: 'diplomacy-ready', to: 'paranid' },
  { id: 'diplomacy-free-families', from: 'diplomacy-ready', to: 'free-families' },
  { id: 'solborn-covert', from: 'solborn', to: 'covert' },
  { id: 'solborn-yaki', from: 'solborn', to: 'yaki' },
  { id: 'paranid-decision', from: 'paranid', to: 'decision-paranid' },
  {
    id: 'paranid-unify',
    from: 'decision-paranid',
    to: 'outcome-paranid-unify',
  },
  {
    id: 'paranid-escalate',
    from: 'decision-paranid',
    to: 'outcome-paranid-escalate',
  },
  {
    id: 'paranid-war',
    from: 'outcome-paranid-unify',
    to: 'outcome-paranid-war',
  },
  {
    id: 'free-families-decision',
    from: 'free-families',
    to: 'decision-free-families',
  },
  { id: 'free-families-zya', from: 'decision-free-families', to: 'outcome-zya' },
  {
    id: 'free-families-rebellion',
    from: 'decision-free-families',
    to: 'outcome-rebellion',
  },
  { id: 'covert-decision', from: 'covert', to: 'decision-covert' },
  { id: 'covert-none', from: 'decision-covert', to: 'outcome-covert-none' },
  { id: 'covert-war', from: 'decision-covert', to: 'outcome-terran-war' },
  { id: 'covert-trade', from: 'decision-covert', to: 'outcome-trade-break' },
  { id: 'yaki-threat-decision', from: 'yaki', to: 'decision-yaki-threat' },
  { id: 'yaki-amplifier-decision', from: 'yaki', to: 'decision-yaki-amplifier' },
  { id: 'yaki-purge', from: 'decision-yaki-threat', to: 'outcome-yaki-purge' },
  { id: 'yaki-none', from: 'decision-yaki-threat', to: 'outcome-yaki-none' },
  { id: 'yaki-xenon-sol', from: 'decision-yaki-amplifier', to: 'outcome-xenon-sol' },
  { id: 'yaki-trade', from: 'decision-yaki-amplifier', to: 'outcome-yaki-trade' },
]

export const storyStarts: StoryStart[] = [
  {
    id: 'young-gun',
    nodeId: 'start-young-gun',
    titleKey: 'storylines.nodes.start_young_gun',
    summaryKey: 'storylines.starts.young_gun.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.shared.no_exclusive',
    expansion: 'base',
  },
  {
    id: 'entrepreneur',
    nodeId: 'start-entrepreneur',
    titleKey: 'storylines.nodes.start_entrepreneur',
    summaryKey: 'storylines.starts.entrepreneur.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.shared.no_exclusive',
    expansion: 'base',
  },
  {
    id: 'warrior',
    nodeId: 'start-warrior',
    titleKey: 'storylines.nodes.start_warrior',
    summaryKey: 'storylines.starts.warrior.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.shared.no_exclusive',
    expansion: 'base',
  },
  {
    id: 'explorer',
    nodeId: 'start-explorer',
    titleKey: 'storylines.nodes.start_explorer',
    summaryKey: 'storylines.starts.explorer.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.shared.no_exclusive',
    expansion: 'base',
  },
  {
    id: 'scientist',
    nodeId: 'start-scientist',
    titleKey: 'storylines.nodes.start_scientist',
    summaryKey: 'storylines.starts.scientist.summary',
    headquartersKey: 'storylines.starts.scientist.headquarters',
    exclusiveKey: 'storylines.starts.shared.no_exclusive',
    expansion: 'base',
  },
  {
    id: 'fires-of-defeat',
    nodeId: 'start-fires',
    titleKey: 'storylines.nodes.start_fires',
    summaryKey: 'storylines.starts.fires.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.fires.exclusive',
    expansion: 'split',
  },
  {
    id: 'spear-of-the-patriarch',
    nodeId: 'start-spear',
    titleKey: 'storylines.nodes.start_spear',
    summaryKey: 'storylines.starts.spear.summary',
    headquartersKey: 'storylines.starts.shared.standard_headquarters',
    exclusiveKey: 'storylines.starts.spear.exclusive',
    expansion: 'split',
  },
  {
    id: 'terran-cadet',
    nodeId: 'start-cadet',
    titleKey: 'storylines.nodes.start_cadet',
    summaryKey: 'storylines.starts.cadet.summary',
    headquartersKey: 'storylines.starts.cadet.headquarters',
    exclusiveKey: 'storylines.starts.cadet.exclusive',
    expansion: 'cradle',
  },
  {
    id: 'project-genesis',
    nodeId: 'start-genesis',
    titleKey: 'storylines.nodes.start_genesis',
    summaryKey: 'storylines.starts.genesis.summary',
    headquartersKey: 'storylines.starts.genesis.headquarters',
    exclusiveKey: 'storylines.starts.genesis.exclusive',
    expansion: 'cradle',
  },
]

export function reachableStoryGraph(startNodeId: string) {
  const nodeIds = new Set<string>([startNodeId])
  const edgeIds = new Set<string>()
  const requirementsByTarget = new Map<string, StoryEdge[]>()

  storyEdges.forEach((edge) => {
    if (edge.relation !== 'requires') return
    const requirements = requirementsByTarget.get(edge.to) ?? []
    requirements.push(edge)
    requirementsByTarget.set(edge.to, requirements)
  })

  let changed = true
  while (changed) {
    changed = false

    storyEdges.forEach((edge) => {
      if (edge.relation === 'requires' || !nodeIds.has(edge.from)) return
      edgeIds.add(edge.id)
      if (nodeIds.has(edge.to)) return
      nodeIds.add(edge.to)
      changed = true
    })

    requirementsByTarget.forEach((requirements, target) => {
      if (!requirements.every((edge) => nodeIds.has(edge.from))) return
      requirements.forEach((edge) => edgeIds.add(edge.id))
      if (nodeIds.has(target)) return
      nodeIds.add(target)
      changed = true
    })
  }

  return { edgeIds, nodeIds }
}
