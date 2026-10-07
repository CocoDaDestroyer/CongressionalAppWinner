# Third-party agent tooling

- `skills/impeccable/` and `agents/impeccable-finish-reviewer.md`: from
  [pbakaus/impeccable](https://github.com/pbakaus/impeccable) at commit
  `d98b0be4e18321903b13e69c2f2b5df064cb7623` (skill version 4.5.0), copied from its `plugin/` package.
  Apache License 2.0; see `skills/impeccable/LICENSE`. To update, re-copy `plugin/skills/impeccable`
  and `plugin/agents/` from a newer checkout.
- [wshobson/agents](https://github.com/wshobson/agents) (MIT) is used as a Claude Code plugin
  marketplace (`claude-code-workflows`) rather than vendored. `.claude/settings.json` registers it and enables the plugins below; to add it by hand, run
  `/plugin marketplace add wshobson/agents`, then install `ui-design`, `frontend-mobile-development`,
  `javascript-typescript`, `unit-testing`, `accessibility-compliance` and `avoid-ai-writing`.
