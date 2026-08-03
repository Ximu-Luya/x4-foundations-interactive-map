import { execFileSync } from 'node:child_process'
import { accessSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const stagingFile = path.join(projectRoot, '.crowdin-staging/zh-CN.json')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const requiredEnvironment = ['CROWDIN_PROJECT_ID', 'CROWDIN_PERSONAL_TOKEN']

function run(command, args, capture = false) {
  return execFileSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  })
}

function main() {
  const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name])
  if (missingEnvironment.length > 0) {
    throw new Error(`缺少 Crowdin 环境变量：${missingEnvironment.join(', ')}`)
  }

  const branch = run('git', ['branch', '--show-current'], true).trim()
  if (branch !== 'main') throw new Error('译文只能在已更新的 main 分支上发布到 Crowdin')

  const trackedChanges = run('git', ['status', '--porcelain', '--untracked-files=no'], true).trim()
  if (trackedChanges) throw new Error('发布前必须提交或清理全部已跟踪文件变更')

  accessSync(stagingFile)

  run('git', ['fetch', 'origin', 'main'])
  const head = run('git', ['rev-parse', 'HEAD'], true).trim()
  const remoteMain = run('git', ['rev-parse', 'origin/main'], true).trim()
  if (head !== remoteMain) throw new Error('本地 main 与 origin/main 不一致，请先执行 git pull --ff-only')

  run(npmCommand, ['run', 'i18n:check:staging'])
  run('crowdin', ['upload', 'sources', '--branch', 'main', '--no-progress'])
  run('crowdin', [
    'upload',
    'translations',
    '--branch',
    'main',
    '--language',
    'zh-CN',
    '--source',
    'src/locales/en-US.json',
    '--translation',
    '.crowdin-staging/%locale%.json',
    '--preserve-hierarchy',
    '--import-eq-suggestions',
    '--no-auto-approve-imported',
    '--no-progress',
  ])

  console.log('英文源文和暂存中文译文已上传；请在 Crowdin GitHub 集成中点击“立即同步”。')
}

try {
  main()
} catch (error) {
  console.error(`错误：${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
