# 本地化协作

项目使用 i18next JSON 和 ICU MessageFormat 管理界面及地图内容。英文是源语言，Crowdin 是目标语言译文的权威来源。

## 资源边界

- `src/locales/en-US.json`：开发者和编码模型维护的英文源文，普通代码 PR 可以提交。
- `src/locales/zh-CN.json`：只允许由 Crowdin 的 `l10n_main` PR 回写，普通代码 PR 不得修改。
- `.crowdin-staging/zh-CN.json`：编码模型生成中文译文的本地暂存文件，已被 Git 忽略。
- `src/i18n/index.ts`：语言代码、显示名称等非翻译元数据。
- `crowdin.yml`：源文件、导出路径和语言代码映射，不得写入项目 ID 或访问令牌。

语言文件只能包含嵌套对象和字符串。Crowdin PR 必须使中英文具有完全相同的键集合；普通代码 PR 可以暂时缺少中文键，但中文不得包含英文中不存在的键。

## CLI 安装与认证

Crowdin CLI 以固定版本安装在项目中，统一通过 npm 脚本调用。首次使用前在当前终端配置：

```sh
export CROWDIN_PROJECT_ID='项目数字 ID'
export CROWDIN_PERSONAL_TOKEN='个人访问令牌'
```

令牌必须具有该 Crowdin 项目的源文件和译文写入权限。凭据只保存在本地环境中，不得写入仓库、`.env` 文件或命令参数。

## 翻译与回写流程

普通功能开发采用两阶段合并：

1. 在功能分支中只修改代码和 `src/locales/en-US.json`。
2. 运行 `npm run i18n:stage`，从当前 Crowdin 译文创建被忽略的中文暂存文件。
3. 让编码模型根据本次新增或变化的英文源文，只修改 `.crowdin-staging/zh-CN.json` 中对应译文。
4. 运行 `npm run i18n:check:staging`，严格验证键集合、ICU 结构、变量和未翻译文本。
5. 合并普通代码 PR。此时缺失中文会暂时回退为英文，`src/locales/zh-CN.json` 不随普通 PR 提交。
6. 更新本地 `main`，保留已准备的暂存文件，运行 `npm run i18n:publish`。该命令只允许在与 `origin/main` 完全一致且没有已跟踪文件变更的 `main` 上执行。
7. 发布命令依次上传英文源文件和暂存中文译文，不自动批准导入的译文。
8. 在 Crowdin 的 GitHub 集成中点击“立即同步”，由 `l10n_main` PR 回写 `src/locales/zh-CN.json`。
9. Crowdin PR 通过完整性测试和人工审阅后合并；合并后可删除 `.crowdin-staging/`。

若暂存文件已经存在，`npm run i18n:stage` 会拒绝覆盖；确认不再需要其中内容时才使用 `npm run i18n:stage -- --force`。

## ICU 与占位符

带变量、复数或选择逻辑的消息使用 ICU MessageFormat，例如：

```text
{count} {count, plural, one {jump} other {jumps}}
```

翻译可以调整文字和语序，但不得删除、增加或改名 `{count}`、`{start}`、`{sector}` 等变量。校验会解析每条已有译文，并比较英文和中文的 ICU 结构及变量集合。

目标语言与源文相同只允许用于已审阅的缩写、品牌和专有名词；新增同文项必须先加入测试中的明确白名单。

## CI 规则

- 普通 PR：禁止修改 `src/locales/zh-CN.json`；允许中文暂缺，但检查多余键、ICU 和已有译文质量约束。
- `l10n_main` PR：要求中英文键集合完全一致，并执行全部本地化和项目验证。
- `main` 在普通代码 PR 与 Crowdin PR 之间可能短暂显示英文回退，这是选择不直接提交目标译文后的明确代价。

## Crowdin 项目设置

- Source language：English；Target language：Chinese Simplified。
- GitHub Integration：`Source and translation files mode`，源分支 `main`，服务分支 `l10n_main`。
- 仅首次连接时导入已有翻译，不持续从仓库导入目标译文。
- 保留 24 小时计划同步作为兜底；每次 CLI 上传后手动点击“立即同步”。
- 不使用 Crowdin AI 或机器翻译；译文由编码模型生成并经 CLI 上传。

新增目标语言时，需要同时扩展 `crowdin.yml`、语言元数据、暂存和上传命令，并为新语言建立完整性测试与 Crowdin 回写分支规则。
