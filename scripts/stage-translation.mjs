import { access, copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const sourceFile = path.join(projectRoot, 'src/locales/zh-CN.json')
const stagingDirectory = path.join(projectRoot, '.crowdin-staging')
const stagingFile = path.join(stagingDirectory, 'zh-CN.json')
const force = process.argv.includes('--force')

async function fileExists(file) {
  try {
    await access(file)
    return true
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

async function main() {
  if ((await fileExists(stagingFile)) && !force) {
    throw new Error('暂存译文已存在；如需重新覆盖，请运行 npm run i18n:stage -- --force')
  }

  await mkdir(stagingDirectory, { recursive: true })
  await copyFile(sourceFile, stagingFile)

  console.log(`已创建 Crowdin 译文暂存文件：${path.relative(projectRoot, stagingFile)}`)
}

main().catch((error) => {
  console.error(`错误：${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
