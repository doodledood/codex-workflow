# Vibe Workflow → Codex Skills Migration Plan

## Overview

This document outlines the strategy for porting the Claude Code vibe-workflow plugin to OpenAI Codex skills format.

## Key Differences Between Systems

| Aspect | Claude Code (vibe-workflow) | OpenAI Codex Skills |
|--------|---------------------------|---------------------|
| **Entry Point** | `/command` slash commands | `$skill` invocation |
| **Parallel Execution** | Task tool with `subagent_type` spawns isolated agents | ❌ No subagents - all execution is inline/sequential |
| **Agent Isolation** | Each agent runs in isolation with declared tools | All skills run in same context, inherit tools |
| **Hooks** | SessionStart, Stop hooks for system integration | ❌ No hook equivalent |
| **Structure** | `commands/`, `agents/`, `skills/` directories | Single `SKILL.md` per skill with optional `scripts/` |
| **Tool Declaration** | Agents must declare tools; commands inherit | Skills inherit all tools (no declaration) |
| **File Format** | YAML frontmatter + Markdown body | YAML frontmatter (name ≤100, description ≤500) + Markdown body |

## Critical Migration Challenge: No Subagents

The `/implement` command heavily relies on subagents:
```
For each chunk:
  → spawn chunk-implementor (isolated agent)
  → spawn chunk-verifier (isolated agent)
  → fix loop with re-spawns
```

**Codex Constraint**: Skills run inline, not as isolated parallel processes.

### Solution: Sequential Inline Execution

Convert the orchestration pattern from parallel subagents to sequential skill invocation:

```
For each chunk:
  → Execute implement-chunk skill inline (writes log)
  → Execute verify-chunk skill inline (reads log, runs gates)
  → Fix loop with repeated skill calls
```

This loses parallelism but maintains the workflow structure.

---

## Component Mapping

### Commands → Skills

| Claude Code Command | Codex Skill | Notes |
|---------------------|-------------|-------|
| `/spec` | `$spec` | Direct port, AskUserQuestion → user prompts |
| `/plan` | `$plan` | Direct port, remove codebase-explorer subagent calls |
| `/implement` | `$implement` | Major rewrite: inline execution instead of Task tool |
| `/implement-inplace` | `$implement-simple` | Simpler, good starting point |
| `/review` | `$review` | Consolidate all review variants into one skill |
| `/explore-codebase` | `$explore` | Convert from agent to inline execution |
| `/bugfix` | `$bugfix` | Remove bug-fixer agent dependency |
| `/web-research` | `$research` | Remove web-researcher agent dependency |

### Agents → Skills (Inline Execution)

| Claude Code Agent | Codex Skill | Migration Strategy |
|-------------------|-------------|-------------------|
| `chunk-implementor` | `$implement-chunk` | Convert to inline skill, keep Memento pattern |
| `chunk-verifier` | `$verify-chunk` | Convert to inline skill, runs gates directly |
| `codebase-explorer` | `$explore` | Merge into main explore skill |
| `code-bugs-reviewer` | (merged into `$review`) | Consolidate review logic |
| `code-coverage-reviewer` | (merged into `$review`) | Consolidate review logic |
| `code-maintainability-reviewer` | (merged into `$review`) | Consolidate review logic |
| `type-safety-reviewer` | (merged into `$review`) | Consolidate review logic |
| `docs-reviewer` | (merged into `$review`) | Consolidate review logic |
| `claude-md-adherence-reviewer` | (merged into `$review`) | Consolidate review logic |
| `bug-fixer` | `$bugfix` | Merge into bugfix skill |
| `web-researcher` | `$research` | Merge into research skill |

### Hooks → Workarounds

| Hook | Workaround |
|------|------------|
| `SessionStart` (reminder to use agents) | Add to SKILL.md instructions as inline reminders |
| `Stop` (todo enforcement) | Cannot replicate - document as limitation |

---

## Proposed Skill Directory Structure

```
.codex/skills/
├── spec/
│   └── SKILL.md                    # Requirements discovery interview
├── plan/
│   └── SKILL.md                    # Implementation planning
├── implement/
│   ├── SKILL.md                    # Main orchestrator (replaces /implement)
│   └── scripts/
│       └── gate_detector.py        # Detect typecheck/lint/test commands
├── implement-chunk/
│   └── SKILL.md                    # Single chunk implementation (was agent)
├── verify-chunk/
│   └── SKILL.md                    # Chunk verification (was agent)
├── review/
│   ├── SKILL.md                    # Consolidated code review
│   └── references/
│       └── review-checklist.md     # Review criteria reference
├── explore/
│   └── SKILL.md                    # Codebase exploration
├── bugfix/
│   └── SKILL.md                    # Bug investigation and fixing
└── research/
    └── SKILL.md                    # Web research with hypothesis tracking
```

---

## Migration Phases

### Phase 1: Core Skills (Foundation)
1. **`$explore`** - Simplest, no dependencies. Port codebase-explorer inline.
2. **`$spec`** - Discovery interview. Replace AskUserQuestion with user prompts.
3. **`$plan`** - Planning. Remove subagent calls, inline exploration.

### Phase 2: Implementation Skills
4. **`$implement-chunk`** - Port chunk-implementor agent as inline skill.
5. **`$verify-chunk`** - Port chunk-verifier agent as inline skill with gate detection.
6. **`$implement`** - Orchestrator rewrite using inline skill calls instead of Task tool.

### Phase 3: Review & Utilities
7. **`$review`** - Consolidate all review agents into single configurable skill.
8. **`$bugfix`** - Bug investigation with inline execution.
9. **`$research`** - Web research (if Codex has web access).

---

## Detailed Skill Specifications

### $spec

```yaml
---
name: spec
description: "Build requirements through discovery interview. Use when defining scope, gathering requirements, or specifying WHAT work should accomplish."
---
```

**Key changes**:
- Remove `Task(subagent_type: "codebase-explorer")` → inline file exploration
- Remove `Task(subagent_type: "web-researcher")` → web search tool directly
- AskUserQuestion → standard user interaction
- Keep Memento pattern (todo + external memory files)

### $plan

```yaml
---
name: plan
description: "Create implementation plan from spec. Researches codebase, outputs dependency-ordered chunks with acceptance criteria."
---
```

**Key changes**:
- Remove subagent-based exploration → inline codebase reading
- Keep chunk structure output format
- Keep dependency graph generation

### $implement

```yaml
---
name: implement
description: "Execute implementation plans. Implements chunks sequentially with verification and fix loops."
---
```

**Major rewrite required**:
```
# OLD (Claude Code)
For each chunk:
  Task(subagent_type: chunk-implementor)  # isolated
  Task(subagent_type: chunk-verifier)     # isolated

# NEW (Codex)
For each chunk:
  # Execute inline (no isolation)
  [implement-chunk instructions inline]
  [verify-chunk instructions inline]
  # OR use $implement-chunk, $verify-chunk skills
```

**Options**:
1. **Monolithic**: Embed all logic in single $implement skill
2. **Modular**: Call $implement-chunk and $verify-chunk skills via explicit invocation
3. **Hybrid**: Core loop in $implement, complex logic in sub-skills

Recommendation: **Option 3 (Hybrid)** - keeps modularity while working within Codex constraints.

### $review

```yaml
---
name: review
description: "Comprehensive code review. Checks bugs, type safety, test coverage, maintainability, and documentation."
---
```

**Consolidation strategy**:
- Combine 6 review agents into single skill
- Add `--focus` argument for specific review types
- Run all checks sequentially (no parallel agents)

---

## Tool Mapping

| Claude Code Tool | Codex Equivalent | Notes |
|------------------|------------------|-------|
| `TodoWrite` | `update_plan` | Task tracking |
| `Task` (subagent) | ❌ None | Must inline execution |
| `Skill` | `$skill-name` | Direct invocation |
| `Bash` | Shell execution | Similar |
| `Read/Write/Edit` | File operations | Similar |
| `Glob/Grep` | File search | Similar |
| `WebFetch/WebSearch` | Web tools | If available in Codex |
| `AskUserQuestion` | User prompts | Different interaction model |

---

## Limitations & Trade-offs

### Lost Capabilities

1. **Parallel Agent Execution**: Codex runs sequentially; no concurrent chunk processing
2. **Agent Isolation**: No isolated contexts; state pollution possible
3. **Stop Hook**: Cannot enforce todo completion before session end
4. **SessionStart Hook**: Cannot inject reminders at session start

### Workarounds

1. **Parallelism**: Accept sequential execution; optimize skill efficiency
2. **Isolation**: Use explicit state cleanup between skill invocations
3. **Stop Hook**: Document in skill instructions: "Do not stop until todos complete"
4. **SessionStart**: Add reminders directly in skill instructions

---

## Implementation Priority

1. **$explore** - Foundation skill, simple port
2. **$spec** - High value, tests user interaction
3. **$plan** - Depends on explore, tests output format
4. **$implement-chunk** - Core building block
5. **$verify-chunk** - Pairs with implement-chunk
6. **$implement** - Orchestrator, depends on 4-5
7. **$review** - Independent, can parallelize with 1-6
8. **$bugfix** - Lower priority
9. **$research** - Depends on Codex web capabilities

---

## Next Steps

1. [ ] Set up `.codex/skills/` directory structure
2. [ ] Port `$explore` as proof-of-concept
3. [ ] Port `$spec` with inline exploration
4. [ ] Port `$plan` with inline exploration
5. [ ] Port `$implement-chunk` and `$verify-chunk`
6. [ ] Build `$implement` orchestrator
7. [ ] Consolidate review agents into `$review`
8. [ ] Port utility skills ($bugfix, $research)
9. [ ] Write user documentation
10. [ ] Test end-to-end workflow

---

## Sources

- [Codex Skills Documentation](https://developers.openai.com/codex/skills)
- [Create Skills Guide](https://developers.openai.com/codex/skills/create-skill/)
- [OpenAI Skills Repository](https://github.com/openai/skills)
- [Skills for OpenAI Codex Blog](https://blog.fsck.com/2025/10/27/skills-for-openai-codex/)
- [Simon Willison on OpenAI Skills](https://simonwillison.net/2025/Dec/12/openai-skills/)
