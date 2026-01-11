# AGENTS.md

## Project Overview

Codex workflow skills - quality-focused workflows for OpenAI Codex CLI. Ported from claude-code-plugins vibe-workflow.

## Foundational Documents

Read before building skills:

- **docs/CUSTOMER.md** - Who we build for, messaging guidelines
- **docs/LLM_CODING_CAPABILITIES.md** - LLM strengths/limitations, informs workflow design

## Repository Structure

- `skills/` - Individual skills, each with `SKILL.md`
- `docs/` - Documentation and reference materials

### Skill Structure

Each skill follows the Codex skills format:

```
skills/skill-name/
├── SKILL.md           # Required: name, description, instructions
├── scripts/           # Optional: Python scripts
└── references/        # Optional: supporting docs
```

**Naming convention**: Use kebab-case (`-`) for all skill names (e.g., `review-bugs`, `fix-review-issues`).

### SKILL.md Format

```yaml
---
name: skill-name
description: "What it does. When to use it. Trigger terms."
---

Detailed instructions for the skill...
```

**Limits**:
- `name`: max 100 characters
- `description`: max 500 characters

### Skill Description Best Practices

Skill descriptions drive auto-invocation. Codex uses semantic matching to decide when to invoke a skill.

**Pattern**: What it does + When to use it + Trigger terms

| Do | Don't |
|----|-------|
| Third person: "Compresses documents..." | First/second person: "I can help you..." |
| Include trigger terms users say: "debug, troubleshoot, fix bug" | Use jargon users won't say |
| Specify when to use: "Use when asked to..." | Vague purpose: "Helps with documents" |
| Keep under 500 chars | Verbose implementation details |

**Example**:
```yaml
# Bad - vague, no triggers
description: 'Helps with bugs'

# Good - specific + triggers + when to use
description: 'Investigates and fixes bugs systematically. Use when asked to debug, troubleshoot, fix a bug, or find why something is broken.'
```

### Memento Pattern for Non-Trivial Workflows

Skills with multi-phase workflows MUST use the memento pattern. This pattern directly addresses documented LLM limitations (see `docs/LLM_CODING_CAPABILITIES.md`):

| Step | What | Why (Limitation Addressed) |
|------|------|---------------------------|
| **Create todo list immediately** | `update_plan` with areas to discover | Externalizes state beyond working memory limits (5-10 variables max) |
| **Include expansion placeholder** | e.g., `- [ ] (expand as discovery reveals new areas)` | Prevents premature "declaring done" |
| **External memory file** | Log file in `/tmp/` updated after EACH step | Counters context window degradation |
| **Never proceed without writing findings** | Log is external memory | Working memory limits mean unwritten findings are forgotten |
| **Expand todos dynamically** | As user answers or research reveals new areas | Prevents "going off rails" |
| **Refresh context before finalizing** | Read full log file before writing final output | Converts holistic synthesis into concentrated recent context |

The refresh step is critical: LLMs struggle with holistic tasks across long contexts (<50% accuracy at 32K tokens) but excel at processing recently-read information. Reading the full log immediately before output transforms scattered, degraded context into dense, high-attention input.

See `skills/spec/SKILL.md` or `skills/plan/SKILL.md` for reference implementations.

## Tool Mapping from Claude Code

When porting from claude-code-plugins:

| Claude Code | Codex Equivalent |
|-------------|------------------|
| `TodoWrite` | `update_plan` |
| `Task(subagent)` | N/A - inline execution only |
| `Skill("plugin:skill")` | `$skill-name` |
| `AskUserQuestion` | Standard user prompts |
| `Read/Write/Edit` | File operations (similar) |
| `Glob/Grep` | File search (similar) |
| `Bash` | Shell execution (similar) |
| `WebFetch/WebSearch` | Web tools (if available) |

## Key Differences from Claude Code

1. **No subagents**: Codex skills run inline, not as isolated parallel processes
2. **No hooks**: SessionStart/Stop hooks don't exist in Codex
3. **Simpler structure**: Just SKILL.md with optional scripts/references
4. **Description limits**: name ≤100 chars, description ≤500 chars
5. **Invocation**: `$skill-name` instead of `/command`

## Adding New Skills

1. Create skill directory in `skills/`
2. Create `SKILL.md` with required frontmatter
3. Add optional `scripts/` for Python code
4. Update README.md with skill description
