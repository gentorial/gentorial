import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import markdownItContainer from 'markdown-it-container'
import { parseLessonSource, type ParsedLessonSource } from '@gentorial/content'
import type { LessonBlock } from '@gentorial/core'

type DirectiveInfo = {
  id: string
  attributes: Map<string, string>
}

function parseInfo(info: string): DirectiveInfo {
  const trimmed = info.trim()
  const idMatch = /^([^\s]+)/.exec(trimmed)
  const id = idMatch?.[1] ?? ''
  const attributes = new Map<string, string>()
  const rest = trimmed.slice(id.length)
  const pattern = /([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(rest))) {
    attributes.set(match[1] ?? '', match[2] ?? match[3] ?? match[4] ?? '')
  }

  return { id, attributes }
}

const parsedSourceKey = '__gentorialParsedSource'

function parsedSourceFromEnvironment(environment: unknown): ParsedLessonSource | undefined {
  if (typeof environment !== 'object' || environment === null) return undefined
  return Reflect.get(environment, parsedSourceKey) as ParsedLessonSource | undefined
}

function expressionAttribute(md: MarkdownIt, value: unknown): string {
  return md.utils.escapeHtml(JSON.stringify(value))
}

function sourcePathFromEnvironment(environment: Record<string, unknown>): string {
  return typeof environment.relativePath === 'string'
    ? environment.relativePath.replaceAll('\\', '/')
    : '<markdown>'
}

function openTokenInfo(tokens: Token[], index: number): DirectiveInfo {
  const token = tokens[index]
  return parseInfo((token?.info ?? '').trim().replace(/^(concept|generate)\s+/, ''))
}

function triggerMarkup(md: MarkdownIt, generateId: string, label: string): string {
  return (
    ` <GentorialGenerateTrigger generate-id="${md.utils.escapeHtml(generateId)}"` +
    ` label="${md.utils.escapeHtml(label)}" />`
  )
}

function precedingAuthorParagraph(
  tokens: Token[],
  generateIndex: number
): { index: number; token: Token } | undefined {
  let generateDepth = 0

  for (let index = generateIndex - 1; index >= 0; index -= 1) {
    const token = tokens[index]
    if (!token) continue

    if (token.type === 'container_generate_close') {
      generateDepth += 1
      continue
    }
    if (generateDepth > 0) {
      if (token.type === 'container_generate_open') generateDepth -= 1
      continue
    }

    if (token.type === 'paragraph_close') {
      const inline = tokens[index - 1]
      const paragraph = tokens[index - 2]
      if (inline?.type === 'inline' && inline.children && paragraph?.type === 'paragraph_open') {
        return { index: index - 1, token: inline }
      }
      return undefined
    }

    if (token.type === 'heading_close') return undefined
    if (token.nesting === -1) continue
    return undefined
  }

  return undefined
}

function enclosingConceptTitle(tokens: Token[], targetIndex: number): string | undefined {
  let title: string | undefined

  for (let index = 0; index <= targetIndex; index += 1) {
    const token = tokens[index]
    if (token?.type === 'container_concept_open') {
      title = openTokenInfo(tokens, index).attributes.get('title')
    } else if (token?.type === 'container_concept_close') {
      title = undefined
    }
  }

  return title
}

export function installGentorialMarkdown(md: MarkdownIt): void {
  const renderFence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
    const token = tokens[index]
    if (token?.info.trim() === 'mermaid') {
      return `<GentorialMermaid :graph="${expressionAttribute(md, token.content)}" />\n`
    }
    return renderFence
      ? renderFence(tokens, index, options, environment, renderer)
      : renderer.renderToken(tokens, index, options)
  }

  md.core.ruler.before('block', 'gentorial_parse_source', (state) => {
    const environment = state.env as Record<string, unknown>
    const file = sourcePathFromEnvironment(environment)
    const parsed = parseLessonSource(state.src, { file })
    environment[parsedSourceKey] = parsed

    const error = parsed.diagnostics.find((item) => item.severity === 'error')
    if (error) {
      const location = error.source ? `${error.source.file}:${error.source.line}` : file
      throw new Error(`${location} [${error.code}] ${error.message}`)
    }
  })

  md.core.ruler.after('inline', 'gentorial_source_end_triggers', (state) => {
    const parsed = parsedSourceFromEnvironment(state.env)
    if (!parsed) return

    for (let index = 0; index < state.tokens.length; index += 1) {
      const token = state.tokens[index]
      if (token?.type !== 'container_generate_open') continue

      const info = openTokenInfo(state.tokens, index)
      const generate = parsed.generates.find((item) => item.id === info.id)
      if (!generate) continue

      const target = precedingAuthorParagraph(state.tokens, index)
      if (!target) continue

      const trigger = new state.Token('html_inline', '', 0)
      trigger.content = triggerMarkup(
        md,
        generate.id,
        enclosingConceptTitle(state.tokens, target.index) ?? generate.scope.heading
      )
      target.token.children?.push(trigger)
      token.meta = { ...token.meta, gentorialTriggerInjected: true }
    }
  })

  md.use(markdownItContainer, 'concept', {
    validate(parameters: string) {
      return /^\s*concept\s+[^\s]+/.test(parameters)
    },
    render(tokens: Token[], index: number) {
      if (tokens[index]?.nesting === -1) return '</section>\n'

      const info = openTokenInfo(tokens, index)
      const id = md.utils.escapeHtml(info.id)
      const title = info.attributes.get('title')
      return [
        `<section class="gentorial-concept" data-concept-id="${id}">`,
        title ? `<h3>${md.utils.escapeHtml(title)}</h3>` : ''
      ].join('')
    }
  })

  md.use(markdownItContainer, 'generate', {
    validate(parameters: string) {
      return /^\s*generate\s+[^\s]+/.test(parameters)
    },
    render(tokens: Token[], index: number, _options: unknown, environment: unknown) {
      if (tokens[index]?.nesting === -1) return '</GentorialGeneratedRegion>\n'

      const info = openTokenInfo(tokens, index)
      const parsed = parsedSourceFromEnvironment(environment)
      const generate = parsed?.generates.find((item) => item.id === info.id)
      if (!generate) {
        throw new Error(`无法从已校验的页面清单中找到生成区块 ${info.id}`)
      }
      const conceptIds = new Set(generate.concepts)
      const concepts = parsed?.concepts.filter((concept) => conceptIds.has(concept.id)) ?? []
      const fallback: LessonBlock[] = [
        {
          type: 'callout',
          tone: 'info',
          title: '静态回退',
          text: '个性化讲解暂时不可用；上方作者原文仍可正常阅读。'
        }
      ]
      return [
        ...(tokens[index]?.meta?.gentorialTriggerInjected
          ? []
          : [triggerMarkup(md, generate.id, generate.scope.heading)]),
        `<GentorialGeneratedRegion :spec="${expressionAttribute(md, generate)}"`,
        ` :concepts="${expressionAttribute(md, concepts)}"`,
        ` :fallback="${expressionAttribute(md, fallback)}">`
      ].join('')
    }
  })
}

export const gentorialMarkdown = installGentorialMarkdown
