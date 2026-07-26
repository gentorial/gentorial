import { defineCourse } from '@gentorial/core'

export default defineCourse({
  schemaVersion: '1',
  id: 'gentorial-docs',
  title: 'Gentorial 技术文档',
  lang: 'zh-CN',
  contentDir: 'content',
  generation: {
    mode: 'hybrid',
    defaultLocale: 'zh-CN',
    globalPrompt: '使用清晰、循序渐进的中文讲解；首次出现的 Gentorial 专有名词应结合当前章节给出简短定义。'
  },
  rendering: {
    allowUnsafeHtml: false
  },
  accuracy: {
    policies: [
      '不得虚构 Gentorial 当前不存在的配置字段、包或运行时能力',
      '生成内容不得改变作者原文给出的 API 边界、安全要求和缓存语义',
      '涉及版本与部署的解释必须以当前文档原文为准'
    ]
  }
})
