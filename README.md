# X4 Foundations Interactive Map

[简体中文](./README.md) | [English](./README.en.md)

> 面向 X4: Foundations v9.0 的双语交互式星区地图与免费舰船指南。

[![CI](https://github.com/Ximu-Luya/x4-foundations-interactive-map/actions/workflows/ci.yml/badge.svg)](https://github.com/Ximu-Luya/x4-foundations-interactive-map/actions/workflows/ci.yml)
[![Crowdin](https://img.shields.io/badge/localization-Crowdin-2E3340?logo=crowdin&logoColor=white)](https://crowdin.com/project/x4-foundations-interactive-map)

[在线体验](https://x4.ximustudio.top/) · [参与 Crowdin 翻译](https://crowdin.com/project/x4-foundations-interactive-map) · [源站地图](https://veanturverse.com/guides/x4-universe-map.html)

[![X4 Foundations Interactive Map 中文界面](./docs/images/x4-interactive-map.jpg)](https://x4.ximustudio.top/)

## 项目定位

本项目是 [Veanturverse X4 交互式地图](https://veanturverse.com/guides/x4-universe-map.html)及免费舰船指南的非官方翻译与工程化版本。它保留源站的数据、地图关系和指南内容，将原有页面重构为可持续开发的 Vite + React + TypeScript 单页应用，并补充中文本地化、移动端适配、自动化测试、Crowdin 协作和统一部署能力。

这不是 Egosoft 或 Veanturverse 的官方项目。项目重点是让中文玩家更方便地使用原有内容，同时让地图能够继续迭代、验证和扩展。

## 主要功能

- 收录 152 个星区、179 条星门与超级高速公路连接，覆盖 X4 v9.0 星系布局。
- 支持鼠标拖拽、滚轮缩放、方向键和 WASD 平移，以及移动端浏览。
- 提供中英文界面、双语搜索、阵营筛选和空间站类型筛选。
- 可切换废弃舰船、时间线奖励舰船、Kha'ak 安全区和地球化星区图层。
- 支持资源与空间站信息、跨星区路线规划、URL 深链和本地发现状态。
- 内置免费舰船图文指南，可在舰船详情与地图位置之间双向跳转。
- 兼容原 `/guides/x4-universe-map.html` 路径及 `ship`、`tlship`、`sector`、`from`、`to` 参数。

## 技术栈

- Vite、React、TypeScript
- i18next、ICU MessageFormat
- Vitest、Testing Library、Playwright
- Biome、GitHub Actions
- Crowdin CLI 与 Crowdin GitHub Integration

## 本地开发

需要 Node.js 20.19 或更高版本。

```bash
git clone https://github.com/Ximu-Luya/x4-foundations-interactive-map.git
cd x4-foundations-interactive-map
npm ci
npm run dev
```

应用默认使用简体中文。可通过右上角语言菜单切换英文，也可直接使用 `?lang=zh-CN` 或 `?lang=en-US`。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 类型检查并生成生产构建 |
| `npm test` | 运行 Vitest 单元与组件测试 |
| `npm run test:e2e` | 构建后运行桌面端与移动端 Playwright 测试 |
| `npm run lint` | 运行 Biome 检查 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run verify` | 运行完整项目验证 |

## 通过 Crowdin 贡献本地化

英文是源语言，目标语言统一在 [Crowdin 项目](https://crowdin.com/project/x4-foundations-interactive-map)中翻译和审阅。当前应用内置简体中文与英文；欢迎帮助完善中文，也欢迎为其他语言建立本地化。

1. 打开 Crowdin 项目并加入翻译。
2. 如果目标语言已经开放，选择该语言并翻译英文源文；如果尚未开放，请先[提交语言申请](https://github.com/Ximu-Luya/x4-foundations-interactive-map/issues/new)，注明语言名称、locale 代码以及你愿意维护的范围。
3. 优先采用 X4 游戏内的官方术语，保持星区、阵营、舰船和设施名称一致。
4. 保留 `{count}`、`{sector}`、`{start}` 等 ICU 变量，不要修改变量名、删除占位符或直接翻译 JSON 键。
5. 在 Crowdin 中提交译文并等待审阅。请使用人工翻译，不使用 Crowdin AI 或机器翻译生成最终译文。
6. 当新语言达到可发布质量后，维护者会补充应用语言元数据、构建配置和测试，再由 Crowdin 的本地化 PR 回写译文。

普通代码 PR 只维护英文源文，不应直接修改仓库中的目标语言 JSON。详细的维护者工作流和 ICU 约束见[本地化协作文档](./docs/localization.md)。

## 项目文档

- [本地化协作](./docs/localization.md)
- [架构与实现边界](./docs/architecture.md)

## 来源与声明

地图数据、指南内容与相关素材源自 Veanturverse；X4: Foundations 及相关名称和标识归其各自权利人所有。本仓库当前未声明开源许可证，复制、分发或再发布前请自行确认适用的授权范围。
