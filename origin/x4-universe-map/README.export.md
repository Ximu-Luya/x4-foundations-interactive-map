# X4 Universe Map 本地项目

本目录是从 `https://veanturverse.com/guides/x4-universe-map.html` 镜像的本地副本，已包含页面使用的 HTML、CSS、JavaScript、字体引用和动态舰船图片。

入口文件：`guides/x4-universe-map.html`

建议通过本地 HTTP 服务预览（比直接双击 HTML 更稳定）：

```powershell
python -m http.server 8000
```

然后打开 <http://localhost:8000/guides/x4-universe-map.html>。

后续中文化主要涉及：

- 页面正文和控件文字：`guides/x4-universe-map.html`
- 地图、阵营、区域及舰船数据文字：`assets/x4/*.js`
- 视觉样式：`fonts.css`、`assets/tailwind.css`
- 地图交互逻辑：`assets/x4/map.js`
