# Codex Workflow Skills

First-principles workflows for OpenAI Codex CLI. Built by developers who understand LLM limitations.

## Who This Is For

Experienced developers frustrated by hype-driven AI coding tools. If you're tired of chasing the latest "game-changing" prompt that produces code you spend hours debugging, these skills offer a grounded alternative.

**Our approach:**
- Workflows designed around how LLMs actually work, not how we wish they worked
- Quality over speed—invest upfront, ship with confidence
- Simple to use, sophisticated under the hood

## Installation

### Via Skill Installer (Recommended)

Install individual skills using `$skill-installer`:

```
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/spec
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/plan
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/implement
```

Or install all skills:
```
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/spec
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/plan
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/implement
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-bugs
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-coverage
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-type-safety
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-maintainability
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-docs
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/review-agents-md
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/fix-review-issues
$skill-installer install https://github.com/doodledood/codex-workflow/tree/main/skills/web-research
```

Restart Codex after installing to pick up new skills.

### Manual Installation

Copy skills to your Codex skills directory:

```bash
# Clone repo
git clone https://github.com/doodledood/codex-workflow.git
cd codex-workflow

# User-scoped (applies to all repos)
cp -r skills/* ~/.codex/skills/

# Or repo-scoped
cp -r skills/* .codex/skills/
```

Enable skills if not already enabled:
```bash
codex --enable skills
```

## Available Skills

### Core Workflow

- **`$spec`** - Interactive requirements builder through structured discovery interview
- **`$plan`** - Create implementation plans with codebase research
- **`$implement`** - Execute plans in-place with auto-fix loops

### Code Review

- **`$review-bugs`** - Audit for logical bugs, race conditions, edge cases
- **`$review-coverage`** - Verify test coverage for changes
- **`$review-type-safety`** - Type safety audit (TypeScript/typed languages)
- **`$review-maintainability`** - DRY violations, dead code, complexity
- **`$review-docs`** - Documentation accuracy audit
- **`$review-agents-md`** - AGENTS.md compliance check

### Utilities

- **`$fix-review-issues`** - Orchestrate fixing issues found by review skills
- **`$web-research`** - Web research with structured hypothesis tracking

## Repository Structure

```
codex-workflow/
├── skills/              # Codex skills (SKILL.md files)
│   ├── spec/
│   ├── plan/
│   ├── implement/
│   ├── review-bugs/
│   └── ...
├── docs/                # Documentation
│   ├── CUSTOMER.md      # Who we build for
│   └── LLM_CODING_CAPABILITIES.md
├── AGENTS.md            # Development guidelines
└── README.md
```

## Development

See [AGENTS.md](./AGENTS.md) for skill development guidelines.

## License

MIT

---

*Ported from [claude-code-plugins](https://github.com/doodledood/claude-code-plugins) vibe-workflow*
