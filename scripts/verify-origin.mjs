import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const originDirectory = path.resolve('origin')
const failures = []

async function findManifests(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const manifests = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) manifests.push(...(await findManifests(absolutePath)))
    if (entry.isFile() && entry.name === 'SHA256SUMS') manifests.push(absolutePath)
  }
  return manifests
}

const manifestPaths = await findManifests(originDirectory)
if (!manifestPaths.length) failures.push('origin: 未找到 SHA256SUMS')

for (const manifestPath of manifestPaths.sort()) {
  const manifestDirectory = path.dirname(manifestPath)
  const manifestName = path.relative(originDirectory, manifestPath)
  const manifest = await readFile(manifestPath, 'utf8')

  for (const line of manifest.split('\n').filter(Boolean)) {
    const [expected, relativePath] = line.trim().split(/\s{2,}/)
    if (!expected || !relativePath) {
      failures.push(`${manifestName}: 无效清单行 ${line}`)
      continue
    }
    const absolutePath = path.resolve(manifestDirectory, relativePath)
    if (!absolutePath.startsWith(`${manifestDirectory}${path.sep}`)) {
      failures.push(`${manifestName}/${relativePath}: 路径超出归档目录`)
      continue
    }
    try {
      const content = await readFile(absolutePath)
      const actual = createHash('sha256').update(content).digest('hex')
      if (actual !== expected) {
        failures.push(`${manifestName}/${relativePath}: ${actual} != ${expected}`)
      }
    } catch (error) {
      failures.push(`${manifestName}/${relativePath}: ${error.message}`)
    }
  }
}

if (failures.length) {
  console.error(`原始归档校验失败：\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`原始归档 SHA-256 校验通过：${manifestPaths.length} 份清单。`)
}
