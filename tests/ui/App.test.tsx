import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import i18n, { localeMetadata, supportedLocales } from '../../src/i18n'
import { App } from '../../src/ui/App'

vi.mock('../../src/map/createMap', () => ({
  createMap: vi.fn(() => ({
    fit: vi.fn(),
    panBy: vi.fn(),
    planRoute: vi.fn(),
    route: vi.fn(),
    selectSector: vi.fn(),
    setKhaak: vi.fn(),
    setLens: vi.fn(),
    setStyle: vi.fn(),
    setTerraform: vi.fn(),
  })),
}))

describe('完整页面', () => {
  beforeEach(async () => {
    window.history.replaceState({}, '', '/?lang=zh-CN')
    await i18n.changeLanguage('zh-CN')
  })

  it('默认渲染中文地图和完整资料区', () => {
    render(<App />)
    const mapRegion = screen.getByRole('region', { name: 'X4 交互式星区地图' })
    expect(mapRegion).toBeInTheDocument()
    expect(within(mapRegion).getByText('X4: 基石 · V9.0')).toBeInTheDocument()
    expect(within(mapRegion).queryByText('星区地图')).not.toBeInTheDocument()
    expect(
      within(mapRegion).getByRole('checkbox', { name: '点击星区后居中' }),
    ).not.toBeChecked()
    expect(screen.getByRole('heading', { name: 'X4: 基石中的免费、废弃及无主舰船' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'X4 地图与免费舰船速查' })).toBeInTheDocument()
    const languageSelect = screen.getByRole('combobox', { name: '选择语言' })
    expect(languageSelect).toHaveValue('zh-CN')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      supportedLocales.map((locale) => localeMetadata[locale].languageName),
    )
    expect(screen.getByText('X4 星区地图')).toBeInTheDocument()
    expect(screen.getAllByText('X4: 基石交互式地图')).toHaveLength(2)
    expect(screen.queryByText('VEANTURVERSE')).not.toBeInTheDocument()
  })

  it('英文资源可以完整渲染', async () => {
    await i18n.changeLanguage('en-US')
    render(<App />)
    expect(screen.getByText('X4: Foundations · V9.0')).toBeInTheDocument()
    expect(screen.queryByText('SECTOR MAP')).not.toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Center after clicking a sector' }),
    ).not.toBeChecked()
    expect(screen.getByPlaceholderText('Search sector...')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select language' })).toHaveValue('en-US')
    expect(screen.getByText('X4 SECTOR MAP')).toBeInTheDocument()
    expect(screen.getAllByText('X4 FOUNDATIONS INTERACTIVE MAP')).toHaveLength(2)
  })

  it('按独立路径渲染中文免费舰船指南和全部锚点', () => {
    window.history.replaceState({}, '', '/free-ships/?lang=zh-CN#ship-odysseus-vanguard')
    const { container } = render(<App />)

    expect(
      screen.getByRole('heading', { name: 'X4 废弃及无主舰船与位置', level: 1 }),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('article[id^="ship-"]')).toHaveLength(15)
    expect(container.querySelector('#ship-odysseus-vanguard')).toBeInTheDocument()
    expect(
      within(container.querySelector('#ship-odysseus-vanguard')!).getByRole('link', {
        name: /在地图上显示/,
      }),
    ).toHaveAttribute('href', '../?lang=zh-CN&ship=odysseus-vanguard')
    expect(screen.queryByRole('region', { name: 'X4 交互式星区地图' })).not.toBeInTheDocument()
  })

  it('舰船图片灯箱支持打开和 Escape 关闭', async () => {
    window.history.replaceState({}, '', '/free-ships/?lang=zh-CN')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '大交易所 I中的精英先锋型' }))
    expect(screen.getByRole('dialog', { name: '舰船图片' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
