# @gentorial/engine-vitepress

## 0.2.1

### Patch Changes

- 放宽 peerDependencies 范围，支持 VitePress 2 与 Mermaid 12。

  `vitepress` 的 peer 范围从 `^1.6.4` 改为 `^1.6.4 || ^2.0.0-alpha.1`，
  `mermaid` 从 `^11.16.0` 改为 `^11.16.0 || ^12.0.0`。

  实际使用面很小：engine 只对 vitepress 做类型导入，theme 只做类型导入，
  两者都不直接调用 vitepress 的运行时 API；mermaid 只调用 `initialize` 和
  `render`，这两个接口在 12 中未变。已在 VitePress 2.0.0-alpha.20 +
  Mermaid 12.2.0 下构建 697 页并验证 11 种图表类型全部渲染。

## 0.2.0

### Minor Changes

- Place generation triggers at the inline end of the author paragraph they explain instead of attaching them to the section heading. Record the new `source-end` trigger placement while continuing to accept stored manifests that use the legacy heading placement.

  Present the learning path as an icon-only floating control whose path panel appears on hover or keyboard focus instead of occupying the generated-content flow.

  Allow course authors to configure an optional `generation.globalPrompt` in `course.config.ts`. Apply it as a system instruction to every structured generation, streamed lesson, and follow-up while preserving Gentorial's scope, grounding, safety, and output constraints.

### Patch Changes

- Updated dependencies
  - @gentorial/core@0.2.0
  - @gentorial/content@0.2.0

## 0.1.0

### Minor Changes

- Publish the first usable Gentorial framework release, including the interactive scaffolder, VitePress integration, learner preferences, BYOK generation pipeline, and default tutorial UI.

### Patch Changes

- Updated dependencies
  - @gentorial/content@0.1.0
  - @gentorial/core@0.1.0
