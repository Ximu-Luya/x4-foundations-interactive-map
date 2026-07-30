# X4 Foundations Interactive Map

本仓库将 Veanturverse 发布的 X4 v9.0 交互式星区地图与免费舰船指南重构为可开发、可测试、可本地化的 Vite + React + TypeScript 前端工程。地图是根主页，完整舰船图文指南位于 `/free-ships/`。

原站发布物完整保存在 [`origin/`](./origin/README.md)，新应用不会在运行时加载其中的全局脚本。原站内容、图片和品牌素材的再发布授权未在仓库中确认，对外部署前需自行核对许可范围。

## 本地开发

要求 Node.js 20.19 或更高版本。

```bash
npm install
npm run dev
```

默认打开简体中文界面，可通过页面右上角的语言下拉框切换英文，也可使用 `?lang=zh-CN` 或 `?lang=en-US`。

目标语言通过 Crowdin 协作和审核，具体约束见 [`docs/localization.md`](./docs/localization.md)。

## 常用命令

```bash
npm run build          # 类型检查并生成 dist/
npm test               # Vitest 单元及组件测试
npm run test:e2e       # 构建后运行桌面与移动端 Playwright 测试
npm run lint           # Biome
npm run typecheck      # TypeScript
npm run verify:origin  # 校验原始归档 SHA-256
npm run verify         # 全量验证
```

## 功能

- 152 个星区、179 条星门与超级高速公路连接。
- 鼠标拖拽、滚轮缩放、方向键和 WASD 平移；Shift 为三倍移动速度。
- 中英文界面、双语搜索、阵营及空间站筛选。
- 废弃舰船、时间线舰船、Kha'ak 安全区与地球化星区图层。
- 资源和空间站信息、路线规划、URL 深链和本地发现状态。
- 独立的免费舰船指南，包含排行、认领步骤、舰船与位置截图，并可与地图双向跳转。
- 兼容原 `/guides/x4-universe-map.html` 地址及 `ship`、`tlship`、`sector`、`from`、`to` 参数。

更详细的实现边界和原逻辑映射见 [`docs/architecture.md`](./docs/architecture.md)。
