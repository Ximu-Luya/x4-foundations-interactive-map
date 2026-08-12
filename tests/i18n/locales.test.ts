/// <reference types="node" />

import {
  isArgumentElement,
  isDateElement,
  isNumberElement,
  isPluralElement,
  isSelectElement,
  isStructurallySame,
  isTagElement,
  isTimeElement,
  parse,
  type MessageFormatElement,
} from '@formatjs/icu-messageformat-parser'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { universeData } from '../../src/data'
import { localeMetadata, resolveInitialLocale, supportedLocales } from '../../src/i18n'
import enUS from '../../src/locales/en-US.json'
import trackedZhCN from '../../src/locales/zh-CN.json'

const translationFile = process.env.I18N_TRANSLATION_FILE
const requireCompleteTranslations = process.env.I18N_REQUIRE_COMPLETE === '1'
const zhCN = translationFile
  ? (JSON.parse(readFileSync(path.resolve(translationFile), 'utf8')) as typeof trackedZhCN)
  : trackedZhCN

const intentionallySharedWithSource = [
  'factions.ARG.short',
  'factions.BOR.short',
  'factions.PAR.short',
  'factions.QUE.name',
  'factions.QUE.short',
  'factions.RIP.short',
  'factions.TEL.short',
  'factions.TER.short',
  'factions.VIG.short',
  'factions.XEN.name',
  'factions.XEN.short',
  'factions.YAK.name',
  'factions.YAK.short',
  'navigation.star_citizen',
  'navigation.youtube',
  'resources.nividium',
  'sectors.Quettanauts',
  'sectors.Xenon',
  'sectors.Yaki',
  'timeline_ships.xenon_b.name',
  'timeline_ships.xenon_f.name',
  'timeline_ships.xenon_h.name',
] as const

function flattenMessages(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`本地化键 ${prefix || '<root>'} 必须是字符串或对象`)
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) =>
      Object.entries(flattenMessages(child, prefix ? `${prefix}.${key}` : key)),
    ),
  )
}

function collectArguments(elements: MessageFormatElement[], names = new Set<string>()): Set<string> {
  elements.forEach((element) => {
    if (
      isArgumentElement(element) ||
      isNumberElement(element) ||
      isDateElement(element) ||
      isTimeElement(element) ||
      isSelectElement(element) ||
      isPluralElement(element)
    ) {
      names.add(element.value)
    }
    if (isSelectElement(element) || isPluralElement(element)) {
      Object.values(element.options).forEach((option) => collectArguments(option.value, names))
    }
    if (isTagElement(element)) collectArguments(element.children, names)
  })
  return names
}

function parseMessage(locale: string, key: string, message: string): MessageFormatElement[] {
  try {
    return parse(message)
  } catch (error) {
    throw new Error(`${locale} 的 ${key} 不是合法 ICU 消息`, { cause: error })
  }
}

describe('本地化资源', () => {
  it('英文产品文案不包含源站品牌', () => {
    expect(Object.values(flattenMessages(enUS)).filter((message) => /Veanturverse/i.test(message))).toEqual(
      [],
    )
  })

  it('目标语言不包含源语言之外的键，严格模式要求完整覆盖', () => {
    const sourceKeys = Object.keys(flattenMessages(enUS)).sort()
    const translatedKeys = Object.keys(flattenMessages(zhCN)).sort()
    const sourceKeySet = new Set(sourceKeys)

    expect(translatedKeys.filter((key) => !sourceKeySet.has(key))).toEqual([])
    if (requireCompleteTranslations) expect(translatedKeys).toEqual(sourceKeys)
  })

  it('已有译文均符合 ICU 语法且保留源语言变量', () => {
    const sourceMessages = flattenMessages(enUS)
    const translatedMessages = flattenMessages(zhCN)
    Object.entries(sourceMessages).forEach(([key, source]) => parseMessage('en-US', key, source))
    Object.entries(translatedMessages).forEach(([key, translation]) => {
      if (!(key in sourceMessages)) return
      const source = sourceMessages[key]
      const sourceAst = parseMessage('en-US', key, source)
      const translatedAst = parseMessage('zh-CN', key, translation)
      const structure = isStructurallySame(sourceAst, translatedAst)
      if (!structure.success) {
        throw new Error(`zh-CN 的 ${key} 与源语言 ICU 结构不一致`, { cause: structure.error })
      }
      expect([...collectArguments(translatedAst)].sort()).toEqual(
        [...collectArguments(sourceAst)].sort(),
      )
    })
  })

  it('目标语言只允许已审阅的专有名词保留源文', () => {
    const sourceMessages = flattenMessages(enUS)
    const translatedMessages = flattenMessages(zhCN)
    const sharedMessages = Object.keys(sourceMessages)
      .filter((key) => sourceMessages[key] === translatedMessages[key])
      .sort()
    const expectedSharedMessages = intentionallySharedWithSource
      .filter((key) => key in translatedMessages)
      .sort()
    expect(sharedMessages).toEqual(expectedSharedMessages)
  })

  it('语言元数据覆盖所有语言且只有一个源语言', () => {
    expect(Object.keys(localeMetadata).sort()).toEqual([...supportedLocales].sort())
    expect(Object.values(localeMetadata).filter(({ sourceLanguage }) => sourceLanguage)).toHaveLength(1)
  })

  it('覆盖全部星区和阵营', () => {
    universeData.sectors.forEach((sector) => {
      expect(enUS.sectors).toHaveProperty(sector.name)
      if (requireCompleteTranslations) expect(zhCN.sectors).toHaveProperty(sector.name)
    })
    Object.keys(universeData.factions).forEach((code) => {
      expect(enUS.factions).toHaveProperty(code)
      if (requireCompleteTranslations) expect(zhCN.factions).toHaveProperty(code)
    })
  })

  it('没有显式配置时默认使用简体中文', () => {
    window.localStorage.clear()
    expect(resolveInitialLocale()).toBe('zh-CN')
  })
})
