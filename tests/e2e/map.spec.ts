import { expect, test } from '@playwright/test'

test('中文地图渲染完整数据并支持双语搜索', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/?lang=zh-CN')
  await expect(page.locator('.mt-h')).toHaveText('宇宙地图')
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
  await page.goto('/?lang=zh-CN')

  const app = page.locator('.min-h-screen.bg-base.text-ink')
  await expect(app).toHaveCSS('background-color', 'rgb(10, 14, 26)')
  await expect(app).toHaveCSS('color', 'rgb(241, 245, 249)')
  await expect(page.locator('.text-cyan').first()).toHaveCSS('color', 'rgb(6, 182, 212)')
  await expect(page.locator('.font-display').first()).toHaveCSS('font-family', /Orbitron/)
})

test('路线深链、键盘平移和输入隔离保持有效', async ({ page }) => {
  await page.goto('/?lang=zh-CN&from=Argon%20Prime&to=Earth')
  await expect(page.locator('#mapPanel .pnl-name')).toHaveText('地球')
  await expect(page.locator('#mapPanel .pnl-route-jumps')).toContainText('8 次跳跃')

  const viewport = page.locator('#gViewport')
  const before = await viewport.getAttribute('transform')
  await page.locator('#mapRoot').press('ArrowRight')
  await expect.poll(() => viewport.getAttribute('transform')).not.toBe(before)

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
  await expect(page.locator('.mt-h')).toHaveText('UNIVERSE MAP')
  await expect(page.getByPlaceholder('Search sector...')).toBeVisible()

  await page.goto('/guides/x4-universe-map.html?lang=zh-CN&sector=Earth')
  await page.waitForURL(/\?lang=zh-CN&sector=Earth$/)
  await expect(page.locator('#mapPanel .pnl-name')).toHaveText('地球')
})
