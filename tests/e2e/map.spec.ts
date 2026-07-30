import { expect, test } from '@playwright/test'

test('中文地图渲染完整数据并支持双语搜索', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/?lang=zh-CN')
  await expect(page.locator('.mt-kicker')).toHaveText('X4: 基石 · V9.0')
  await expect(page.locator('.mt-h')).toHaveCount(0)
  await expect(page.locator('#gHex path')).toHaveCount(152)
  await expect(page.locator('.edge')).toHaveCount(179)

  const search = page.getByPlaceholder('搜索星区...')
  await search.fill('Argon Prime')
  await expect(page.locator('#searchResults [data-go]')).toHaveText('Argon之都')
  await search.fill('Argon之都')
  await page.locator('#searchResults [data-go]').click()
  await expect(page.locator('#mapPanel .pnl-name')).toHaveText('Argon之都')
  expect(errors).toEqual([])
})

test('Tailwind v4 自定义主题通过 Vite 插件生效', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/?lang=zh-CN')

  const app = page.locator('.min-h-screen.bg-base.text-ink')
  await expect(app).toHaveCSS('background-color', 'rgb(10, 14, 26)')
  await expect(app).toHaveCSS('color', 'rgb(241, 245, 249)')
  await expect(page.locator('.text-cyan').first()).toHaveCSS('color', 'rgb(6, 182, 212)')
  await expect(page.locator('.font-display').first()).toHaveCSS('font-family', /Orbitron/)
  await expect(page.locator('header nav').first()).toBeVisible()
  await expect(page.locator('header nav').first()).toHaveCSS('font-size', '14px')

  const stationFinder = page.locator('#stationFinder')
  await expect(stationFinder).toHaveCSS('width', '268px')
  const stationFinderOverflow = await stationFinder.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  )
  expect(stationFinderOverflow).toBe(false)
})

test('语言下拉框保留当前页面参数并支持键盘原生选择', async ({ page }) => {
  await page.goto('/?lang=zh-CN&from=Argon%20Prime&to=Earth')

  const languageSelect = page.getByRole('combobox', { name: '选择语言' })
  await expect(languageSelect).toHaveValue('zh-CN')
  await expect(languageSelect.locator('option')).toHaveText(['简体中文', 'English'])
  await languageSelect.selectOption('en-US')

  await page.waitForURL((url) => {
    return (
      url.searchParams.get('lang') === 'en-US' &&
      url.searchParams.get('from') === 'Argon Prime' &&
      url.searchParams.get('to') === 'Earth'
    )
  })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.getByRole('combobox', { name: 'Select language' })).toHaveValue('en-US')
})

test('页头只在更窄宽度切换为汉堡菜单', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 844 })
  await page.goto('/?lang=zh-CN')

  await expect(page.locator('header nav').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '打开菜单' })).toBeHidden()

  await page.goto('/?lang=en-US')
  await expect(page.locator('header nav').first()).toBeVisible()
  expect(
    await page.locator('header > div').evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(false)

  await page.goto('/?lang=zh-CN')
  await page.setViewportSize({ width: 740, height: 844 })
  await expect(page.locator('header nav').first()).toBeHidden()
  const menuButton = page.getByRole('button', { name: '打开菜单' })
  await expect(menuButton).toBeVisible()
  await expect(menuButton).toHaveText('')
  await expect(menuButton.locator('svg')).toHaveCount(1)
  await menuButton.click()
  await expect(page.getByRole('button', { name: '关闭菜单' })).toBeVisible()

  const mobileNavigation = page.locator('header nav:visible')
  await expect(mobileNavigation).toHaveCSS('font-size', '14px')
  await expect(mobileNavigation.getByRole('link', { name: '星区地图' })).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false)
})

test('地图顶部标题、搜索框和居中开关在窄宽度下正确对齐', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 844 })
  await page.goto('/?lang=zh-CN')

  const title = page.locator('.mt-title')
  const search = page.locator('#mapSearch')
  await expect(title).toHaveCSS('height', '42px')
  await expect(search).toHaveCSS('height', '42px')

  const centerSwitch = page.getByRole('checkbox', { name: '点击星区后居中' })
  const centerSwitchLabel = page.locator('#mapOptions label')
  await expect(centerSwitch).toBeChecked()
  await centerSwitchLabel.click()
  await expect(centerSwitch).not.toBeChecked()
  await centerSwitchLabel.click()
  await expect(centerSwitch).toBeChecked()

  const layout = await page.evaluate(() => {
    const toolbar = document.querySelector<HTMLElement>('#mapTopL')!.getBoundingClientRect()
    const options = document.querySelector<HTMLElement>('#mapOptions')!.getBoundingClientRect()
    const stationFinder = document
      .querySelector<HTMLElement>('#stationFinder')!
      .getBoundingClientRect()
    const switchStyle = getComputedStyle(document.querySelector<HTMLElement>('.opt-switch')!)
    const overlapsStationFinder = !(
      options.right <= stationFinder.left ||
      options.left >= stationFinder.right ||
      options.bottom <= stationFinder.top ||
      options.top >= stationFinder.bottom
    )
    return {
      toolbarRight: toolbar.right,
      optionsRight: options.right,
      optionsLeft: options.left,
      switchRadius: Number.parseFloat(switchStyle.borderRadius),
      overlapsStationFinder,
    }
  })

  expect(Math.abs(layout.toolbarRight - layout.optionsRight)).toBeLessThanOrEqual(1)
  expect(layout.optionsLeft).toBeGreaterThan(320)
  expect(layout.switchRadius).toBeGreaterThanOrEqual(9)
  expect(layout.overlapsStationFinder).toBe(false)
})

test('滚轮缩放平滑过渡', async ({ page }) => {
  await page.goto('/?lang=zh-CN')
  await page.waitForTimeout(100)

  const { before, samples } = await page.evaluate(async () => {
    const svg = document.querySelector<SVGSVGElement>('#mapSvg')!
    const viewport = document.querySelector<SVGGElement>('#gViewport')!
    const before = viewport.getAttribute('transform') ?? ''
    const samples: string[] = []
    const observer = new MutationObserver(() => {
      samples.push(viewport.getAttribute('transform') ?? '')
    })
    observer.observe(viewport, { attributes: true, attributeFilter: ['transform'] })

    const rect = svg.getBoundingClientRect()
    svg.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      deltaY: -100,
    }))
    await new Promise((resolve) => setTimeout(resolve, 600))
    observer.disconnect()
    return { before, samples }
  })

  expect(new Set(samples).size).toBeGreaterThan(2)
  const after = samples.at(-1) ?? ''

  const [, beforeScale = '0'] = before?.match(/scale\(([^)]+)\)/) ?? []
  const [, afterScale = '0'] = after?.match(/scale\(([^)]+)\)/) ?? []
  expect(Number(afterScale)).toBeGreaterThan(Number(beforeScale))
})

test('图例筛选会按源站层级隐化非匹配星区及其附属图层', async ({ page }) => {
  await page.goto('/?lang=zh-CN')

  await page.getByRole('button', { name: 'Argon', exact: true }).click()
  await expect(page.locator('.hex.filter-dim')).toHaveCount(140)
  await expect(page.locator('.hex.filter-dim').first()).toHaveCSS('opacity', '0.16')
  await expect(page.locator('.clabel.filter-dim:not(.show)').first()).toHaveCSS('opacity', '0')
  expect(await page.locator('.gate-dot.filter-dim').count()).toBeGreaterThan(0)
  expect(await page.locator('.stn-one.filter-dim').count()).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Argon', exact: true }).click()
  await page.getByRole('button', { name: '造船厂', exact: true }).click()
  await expect(page.locator('.hex.stn-match')).toHaveCount(21)
  await expect(page.locator('.hex.filter-dim')).toHaveCount(131)
  await expect(page.locator('.label.filter-dim:not(.show)').first()).toHaveCSS('opacity', '0')

  await page.getByRole('button', { name: '造船厂', exact: true }).click()
  await page.locator('#lensShips').click()
  expect(await page.locator('.hex.filter-dim').count()).toBeGreaterThan(100)
  await expect(page.locator('#lensShips')).toHaveAttribute('aria-pressed', 'true')

  await page.locator('#lensKhaak').evaluate((element) => (element as HTMLButtonElement).click())
  await expect(page.locator('#lensShips')).toHaveAttribute('aria-pressed', 'false')
  expect(await page.locator('.edge.filter-dim').count()).toBeGreaterThan(0)
})

test('路线深链、键盘平滑移动和输入隔离保持有效', async ({ page }) => {
  await page.goto('/?lang=zh-CN&from=Argon%20Prime&to=Earth')
  await expect(page.locator('#mapPanel .pnl-name')).toHaveText('地球')
  await expect(page.locator('#mapPanel .pnl-route-jumps')).toContainText('8 次跳跃')

  const viewport = page.locator('#gViewport')
  const before = await viewport.getAttribute('transform')
  await page.locator('#mapRoot').focus()
  await page.keyboard.down('w')
  await expect.poll(() => viewport.getAttribute('transform')).not.toBe(before)
  const during = await viewport.getAttribute('transform')
  await expect.poll(() => viewport.getAttribute('transform')).not.toBe(during)
  await page.keyboard.up('w')

  await page.waitForTimeout(50)
  const afterRelease = await viewport.getAttribute('transform')
  await page.waitForTimeout(80)
  await expect(viewport).toHaveAttribute('transform', afterRelease!)

  const [, beforeY = '0'] = before?.match(/translate\([^ ]+ ([^)]+)\)/) ?? []
  const [, afterY = '0'] = afterRelease?.match(/translate\([^ ]+ ([^)]+)\)/) ?? []
  expect(Number(afterY)).toBeGreaterThan(Number(beforeY))

  const search = page.getByPlaceholder('搜索星区...')
  await search.fill('w')
  const beforeInput = await viewport.getAttribute('transform')
  await search.press('w')
  await page.waitForTimeout(50)
  await expect(viewport).toHaveAttribute('transform', beforeInput!)
})

test('舰船发现状态沿用原 localStorage 键', async ({ page }) => {
  await page.goto('/?lang=zh-CN')
  await page.getByRole('button', { name: '◆ 废弃舰船' }).click()
  await page.locator('[data-found="elite-vanguard"]').click()
  const stored = await page.evaluate(() => localStorage.getItem('vv_x4_found'))
  expect(JSON.parse(stored ?? '[]')).toContain('elite-vanguard')

  await page.reload()
  await page.getByRole('button', { name: '◆ 废弃舰船' }).click()
  await expect(page.locator('[data-slug="elite-vanguard"]')).toHaveClass(/found/)
})

test('英文界面和旧页面地址保持兼容', async ({ page }) => {
  await page.goto('/?lang=en-US')
  await expect(page.locator('.mt-kicker')).toHaveText('X4: Foundations · V9.0')
  await expect(page.getByPlaceholder('Search sector...')).toBeVisible()

  await page.goto('/guides/x4-universe-map.html?lang=zh-CN&sector=Earth')
  await page.waitForURL(/\?lang=zh-CN&sector=Earth$/)
  await expect(page.locator('#mapPanel .pnl-name')).toHaveText('地球')
})

test('免费舰船指南支持锚点、图片灯箱和响应式布局', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/free-ships/?lang=zh-CN#ship-odysseus-vanguard')
  await expect(page.getByRole('heading', { name: 'X4 废弃及无主舰船与位置', level: 1 })).toBeVisible()
  await expect(page.locator('article[id^="ship-"]')).toHaveCount(15)

  const target = page.locator('#ship-odysseus-vanguard')
  await expect(target).toBeInViewport()
  await expect(target.locator('img')).toHaveCount(2)
  await expect
    .poll(() =>
      target
        .locator('img')
        .first()
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)

  await target.locator('button').first().click()
  await expect(page.getByRole('dialog', { name: '舰船图片' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()

  await expect(page.locator('a[href*="veanturverse.com/guides/x4-derelict-ships"]')).toHaveCount(0)
  await expect(page.locator('#ship-sapporo').getByRole('link', { name: /在地图上显示/ })).toHaveAttribute(
    'href',
    '../?lang=zh-CN&tlship=sapporo',
  )
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
  expect(errors).toEqual([])
})

test('地图和免费舰船指南可以保持语言双向跳转', async ({ page }) => {
  await page.goto('/?lang=zh-CN&ship=odysseus-vanguard')
  await expect(page.locator('#mapPanel .pnl-ship-name')).toHaveText('奥德修斯先锋型')

  await page.locator('#mapPanel .pnl-ship-link').click()
  await page.waitForURL(/\/free-ships\/\?lang=zh-CN#ship-odysseus-vanguard$/)
  await expect(page.locator('#ship-odysseus-vanguard')).toBeInViewport()

  await page.locator('#ship-odysseus-vanguard').getByRole('link', { name: /在地图上显示/ }).click()
  await page.waitForURL(/\?lang=zh-CN&ship=odysseus-vanguard$/)
  await expect(page.locator('#mapPanel .pnl-ship-name')).toHaveText('奥德修斯先锋型')

  await page.goto('/free-ships/?lang=en-US')
  await expect(
    page.getByRole('heading', { name: 'X4 Abandoned & Derelict Ships and Locations', level: 1 }),
  ).toBeVisible()
})
