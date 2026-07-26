# @gentorial/core

## 0.2.0

### Minor Changes

- Place generation triggers at the inline end of the author paragraph they explain instead of attaching them to the section heading. Record the new `source-end` trigger placement while continuing to accept stored manifests that use the legacy heading placement.

  Present the learning path as an icon-only floating control whose path panel appears on hover or keyboard focus instead of occupying the generated-content flow.

  Allow course authors to configure an optional `generation.globalPrompt` in `course.config.ts`. Apply it as a system instruction to every structured generation, streamed lesson, and follow-up while preserving Gentorial's scope, grounding, safety, and output constraints.

## 0.1.1

### Patch Changes

- Add an explicit course option and scaffolding prompt for rendering raw AI-generated HTML.
- 1bb4bd4: Preserve generated structure by treating browser streams as standard Markdown. Runtime Markdown is incrementally parsed into safe Vue nodes, retains its source through follow-up conversations and copy actions, and delegates Mermaid fences to the default VitePress theme without exposing author-defined custom containers to AI generation. Add a framework-neutral Web Standards server adapter with JSON lessons, SSE Markdown, authorization, error transport, and cancellation propagation.

## 0.1.0

### Minor Changes

- Publish the first usable Gentorial framework release, including the interactive scaffolder, VitePress integration, learner preferences, BYOK generation pipeline, and default tutorial UI.
