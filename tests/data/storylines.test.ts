import { reachableStoryGraph, storyEdges, storyNodes, storyStarts } from '../../src/data'

describe('X4 开局故事图', () => {
  it('包含九个开局且节点和连线引用完整', () => {
    expect(storyStarts).toHaveLength(9)
    const nodeIds = new Set(storyNodes.map((node) => node.id))
    expect(nodeIds.size).toBe(storyNodes.length)
    storyStarts.forEach((start) => expect(nodeIds.has(start.nodeId)).toBe(true))
    storyEdges.forEach((edge) => {
      expect(nodeIds.has(edge.from)).toBe(true)
      expect(nodeIds.has(edge.to)).toBe(true)
    })
  })

  it('只有同时满足总部和希望之歌时才通过外交前置', () => {
    const fromYoungGun = reachableStoryGraph('start-young-gun')
    expect(fromYoungGun.nodeIds).toContain('headquarters')
    expect(fromYoungGun.nodeIds).toContain('hatikvah')
    expect(fromYoungGun.nodeIds).toContain('diplomacy-ready')
    expect(fromYoungGun.nodeIds).toContain('paranid')

    const fromHeadquarters = reachableStoryGraph('headquarters')
    expect(fromHeadquarters.nodeIds).not.toContain('diplomacy-ready')
    expect(fromHeadquarters.edgeIds).not.toContain('headquarters-diplomacy')
  })

  it('保留不同开局的独享任务与总部取得方式', () => {
    const fires = reachableStoryGraph('start-fires')
    expect(fires.nodeIds).toContain('fires-revenge')
    expect(fires.nodeIds).not.toContain('spear-claim')

    const scientist = reachableStoryGraph('start-scientist')
    expect(scientist.nodeIds).toContain('headquarters')
    expect(scientist.nodeIds).not.toContain('phq-standard')

    const cadet = reachableStoryGraph('start-cadet')
    expect(cadet.nodeIds).toContain('phq-terran')
    expect(cadet.nodeIds).not.toContain('phq-pioneer')
  })
})
