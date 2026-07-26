# 课程配置参考

课程配置位于项目根目录的 `course.config.ts`，使用 `defineCourse()` 创建。

```ts
export default defineCourse({
  schemaVersion: '1',
  id: 'my-course',
  title: 'My course',
  lang: 'zh-CN',
  contentDir: 'content',
  generation: {
    mode: 'hybrid',
    defaultLocale: 'zh-CN',
    globalPrompt: '先给出结论，再循序渐进地解释；术语首次出现时给出定义。'
  },
  rendering: {
    allowUnsafeHtml: false
  },
  accuracy: {
    policies: ['概念锚点的结论不可被反转']
  }
})
```

## 顶层字段

| 字段 | 作用 |
| --- | --- |
| `schemaVersion` | 当前课程协议版本，现为 `'1'` |
| `id` | 稳定课程 ID |
| `title` | 课程标题 |
| `lang` | 课程语言 |
| `contentDir` | 作者 Markdown 所在目录 |
| `generation` | 生成模式、默认语言和可选的全局提示词 |
| `rendering` | AI 输出渲染策略 |
| `accuracy` | 提供给生成模型的准确性策略和标准 |

## 全局提示词

`generation.globalPrompt` 是可选的任意课程级提示词。配置后，它会作为系统指令进入本课程的每次初始生成与后续问答，适合统一规定讲解顺序、表达风格、术语处理和示例偏好。

```ts
generation: {
  mode: 'hybrid',
  defaultLocale: 'zh-CN',
  globalPrompt: [
    '先给出结论，再循序渐进地解释。',
    '术语首次出现时给出定义，并优先使用本课程已有示例。'
  ].join('\n')
}
```

该提示词不能解除 Gentorial 对章节范围、概念锚点、安全边界和输出协议的约束。未配置时，生成行为与以前一致。

::: concept unsafe-html-config title="原始 HTML 权限"
`rendering.allowUnsafeHtml: true` 会让 AI 输出的原始 HTML 以当前站点的同源权限渲染。该字段默认应为 `false`，只有课程作者明确接受此权限边界时才开启。
:::

::: generate course-config-review kind=example concepts=unsafe-html-config
给出一个面向 C 语言教程的 course.config.ts 示例，保持字段集合与本页原文一致，并解释 generation.globalPrompt 与 accuracy.policies 各自适合承载什么内容。
:::
