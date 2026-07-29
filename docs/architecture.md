# 架构与原逻辑映射

## 重构边界

原站不是 React 应用，而是一个 HTML 页面、Tailwind CSS 编译产物和九个原生 JavaScript 文件。发布物没有 source map，因此本工程是行为等价的重新工程化，不是作者未发布源码的恢复。

- `origin/`：不可变的原始发布物和重构前语言包。
- `src/data/`：由原 `window.X4_*` 全局数据转换出的类型化 ES 模块。
- `src/domain/`：无 DOM 依赖的坐标、图结构、路线、距离、视图和校验算法。
- `src/map/createMap.ts`：保持原 SVG 渲染行为的迁移适配层，从模块数据和翻译函数获取输入。
- `src/map/MapShell.tsx`：React 管理的地图 DOM 契约和本地化控制区。
- `src/ui/App.tsx`：完整页面、语言切换、资料内容和 SEO 状态。

`createMap.ts` 为降低一次性重写 1200 行 SVG 运行时造成的行为回归，暂时保留原控制流并设置 `@ts-nocheck`。它不再依赖 `window.X4_*`；稳定数据结构和核心算法已经迁出并受到 TypeScript 与单元测试约束。后续若继续声明式改写 SVG，应以现有 E2E 契约为迁移门禁，而不是直接删除适配层。

## 原文件对应关系

| 原发布物 | 新实现 | 说明 |
| --- | --- | --- |
| `universe-data.js` | `src/data/universe.ts` | 阵营、星区、边和星团 |
| `derelicts.js`、`timeline-ships.js` | `src/data/derelicts.ts`、`timelineShips.ts` | 舰船数据和深链标识 |
| `resources.js`、`stations.js`、`highways.js` | `src/data/` 对应模块 | 资源、固定空间站和本地高速公路 |
| `khaak-hives.js`、`terraform-sectors.js` | `src/data/` 对应模块 | 特殊星区图层 |
| `map.js` 图算法 | `src/domain/universe.ts` | 邻接表、BFS、Kha'ak 距离、归一化、缩放和避让 |
| `map.js` SVG/交互逻辑 | `src/map/createMap.ts` | 图层、筛选、面板、标记、路线和深链 |
| 页面内联 HTML | React 页面组件 | 导航、地图、舰船资料、FAQ 和页脚 |
| `tailwind.css` 与内联 CSS | Tailwind CSS v4 主题及 `src/styles/` | 重新获得可维护的样式输入 |

## 状态与兼容性

- 英文星区名是数据连接和 URL 的稳定主键；中文只作为显示名和搜索别名。
- `vv_x4_found` 与 `vv_x4_tl_found` 保留，已有浏览器发现记录无需迁移。
- `window.X4Map` 保留 `selectSector`、`fit`、`setStyle`、`setLens`、`setKhaak`、`setTerraform`、`planRoute`、`route`，并新增 `panBy`。
- 语言优先级为 URL `lang`、`x4_map_locale` 本地存储、简体中文默认值。
- 高频拖拽和键盘平移直接更新 SVG transform；坐标提交由 `requestAnimationFrame` 合并。

## 验证门禁

- 数据：18 个阵营、152 个星区、179 条连接、6 艘废弃舰船、9 艘时间线舰船、10 个 Kha'ak 巢穴、12 个地球化星区。
- 结论：Argon Prime 到 Earth 为 8 次跳跃；距 Kha'ak 巢穴超过 3 跳的安全星区为 36 个。
- 行为：双语搜索、筛选、缩放、键盘移动、路线深链、舰船本地存档及旧页面地址。
- 环境：Lint、TypeScript、Vitest、Playwright、生产构建和原始归档哈希全部通过。
