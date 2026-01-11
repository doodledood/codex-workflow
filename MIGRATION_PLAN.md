# Vibe Workflow → Codex Skills Migration Plan

## Overview

Port Claude Code vibe-workflow commands to OpenAI Codex skills format. Using the simpler `implement-inplace` approach (no subagents) and individual review skills.

## Skills to Create

| # | Skill | Source | Status |
|---|-------|--------|--------|
| 1 | `$spec` | `/spec` command | Pending |
| 2 | `$plan` | `/plan` command | Pending |
| 3 | `$implement` | `/implement-inplace` command | Pending |
| 4 | `$review-bugs` | `/review-bugs` + `code-bugs-reviewer` agent | Pending |
| 5 | `$review-coverage` | `/review-coverage` + agent | Pending |
| 6 | `$review-type-safety` | `/review-type-safety` + agent | Pending |
| 7 | `$review-maintainability` | `/review-maintainability` + agent | Pending |
| 8 | `$review-docs` | `/review-docs` + agent | Pending |
| 9 | `$review-agents-md` | `/review-claude-md-adherence` | Pending |
| 10 | `$fix-review-issues` | `/fix-review-issues` command | Pending |
| 11 | `$research` | `/web-research` + `web-researcher` agent | Pending |

## NOT Migrating

- **`$explore`** - Codex has built-in exploration, not needed
- **`$review` (consolidated)** - Using individual review skills instead
- **`chunk-implementor` / `chunk-verifier`** - Using simpler implement-inplace
- **Hooks** - No equivalent in Codex

## Directory Structure

```
codex-workflow/
├── skills/
│   ├── spec/
│   │   └── SKILL.md
│   ├── plan/
│   │   └── SKILL.md
│   ├── implement/
│   │   └── SKILL.md
│   ├── review-bugs/
│   │   └── SKILL.md
│   ├── review-coverage/
│   │   └── SKILL.md
│   ├── review-type-safety/
│   │   └── SKILL.md
│   ├── review-maintainability/
│   │   └── SKILL.md
│   ├── review-docs/
│   │   └── SKILL.md
│   ├── review-agents-md/
│   │   └── SKILL.md
│   ├── fix-review-issues/
│   │   └── SKILL.md
│   └── research/
│       └── SKILL.md
├── docs/
│   ├── CUSTOMER.md
│   └── LLM_CODING_CAPABILITIES.md
├── AGENTS.md
├── README.md
└── LICENSE
```

## Key Adaptations

### 1. No Subagents
- `implement-inplace` already works inline - direct port
- Review agents become inline skill instructions (no Task tool calls)
- `web-researcher` becomes inline in `$research`

### 2. Tool Mapping
| Claude Code | Codex |
|-------------|-------|
| `TodoWrite` | `update_plan` |
| `Task(subagent)` | N/A - inline execution |
| `Skill("plugin:skill")` | `$skill-name` |
| `AskUserQuestion` | Standard user prompts |
| Other tools | Similar equivalents |

### 3. AGENTS.md vs CLAUDE.md
- `$review-agents-md` checks compliance with AGENTS.md (Codex equivalent of CLAUDE.md)
- Update all references from CLAUDE.md → AGENTS.md
- Same audit methodology, different target file

### 4. Description Limits
Codex skills have strict limits:
- `name`: max 100 characters
- `description`: max 500 characters

Each skill description must be concise but include trigger terms for auto-invocation.

## Sources

- [Codex Skills Documentation](https://developers.openai.com/codex/skills)
- [Create Skills Guide](https://developers.openai.com/codex/skills/create-skill/)
- [OpenAI Skills Repository](https://github.com/openai/skills)
