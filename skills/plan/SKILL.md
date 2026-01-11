---
name: plan
description: "Create implementation plans from spec via codebase research and strategic questions. Produces mini-PR chunks optimized for iterative development. Use after $spec or when you have clear requirements. Triggers: plan, implementation plan, how to build."
---

**User request**: $ARGUMENTS

Build implementation plan through structured discovery. Takes spec (from `$spec` or inline), researches codebase, asks technical questions → detailed plan.

**Focus**: HOW not WHAT. Spec=what; plan=architecture, files, functions, chunks, dependencies, tests.

**Output files**:
- Plan: `/tmp/plan-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`
- Research log: `/tmp/plan-research-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

## Phase 1: Initial Setup

### 1.1 Create todos

Use `update_plan` with areas to research/decide:

```
- [ ] Read/infer spec requirements
- [ ] Codebase research (patterns, files to modify)
- [ ] Architecture decisions
- [ ] (expand as research reveals new areas)
- [ ] Finalize chunks
```

### 1.2 Create research log

Path: `/tmp/plan-research-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

```markdown
# Research Log: {feature}
Started: {timestamp} | Spec: {path or "inline"}

## Codebase Research
## Architecture Decisions
## Questions & Answers
## Unresolved Items
```

## Phase 2: Context Gathering

### 2.1 Read/infer spec

Extract: requirements, user stories, acceptance criteria, constraints, out-of-scope.

If fewer than 2 concrete requirements, ask user to clarify before proceeding.

### 2.2 Research codebase

Explore: existing implementations, files to modify, patterns, integration points, test patterns.

Use file search and code reading to understand:
- How similar features are implemented
- What files need modification
- Existing patterns and conventions
- Test structure and patterns

### 2.3 Update research log

After EACH step:
```markdown
### {timestamp} - {what researched}
- Explored: {areas}
- Key findings: {files, patterns, integration points}
- New areas: {list}
- Architectural questions: {list}
```

## Phase 3: Iterative Discovery

### Memento Loop

1. Mark todo `in_progress`
2. Research OR ask question
3. **Write findings immediately** to research log
4. Expand todos for new areas discovered
5. Update plan draft
6. Mark todo `completed`
7. Repeat until no pending todos

### Question Priority

| Priority | Type | Examples |
|----------|------|----------|
| 1 | Implementation Phasing | Full impl vs stub? Include migration? |
| 2 | Branching | Sync vs async? Polling vs push? |
| 3 | Technical Constraints | Must integrate with X? Performance requirements? |
| 4 | Architectural | Error strategy? State management? |
| 5 | Detail Refinement | Test coverage scope? Retry policy? |

### Ask vs Decide

**Ask user when**:
- Trade-offs affecting measurable outcomes
- No clear codebase precedent
- Multiple valid approaches with different implications
- Breaking changes

**Decide yourself when**:
- Existing codebase pattern
- Industry standard
- Sensible defaults
- Easily changed later

## Phase 4: Finalize & Present

### 4.1 Refresh context

Read full research log before writing final plan.

### 4.2 Write plan

```markdown
# IMPLEMENTATION PLAN: [Feature]

[1-2 sentences]

Gates: Type checks (0 errors), Tests (pass), Lint (clean)

---

## Requirement Coverage
- [Spec requirement] → Chunk N

---

## 1. [Chunk Name]

Depends on: - | Parallel: -

[What this delivers]

Files to modify:
- path.ts - [changes]

Files to create:
- new.ts - [purpose]

Context files:
- reference.ts - [why relevant]

Tasks:
- Implement fn() - [purpose]
- Tests - [cases]
- Run gates

Acceptance criteria:
- Gates pass
- [Specific verifiable criterion]

Key functions: fn(), helper()
```

### Chunk Sizing

| Complexity | Chunks | Guidance |
|------------|--------|----------|
| Simple | 1-2 | 1-3 functions each |
| Medium | 3-5 | <200 lines per chunk |
| Complex | 5-8 | Each demo-able |

### 4.3 Present summary

```
## Plan Summary

**Plan file**: /tmp/plan-{...}.md

### What We're Building
{1-2 sentences}

### Chunks ({count})
1. {Name} - {description}

### Key Decisions
- {Decision}: {choice}

### Execution Order
{Dependencies, parallel opportunities}

---
Review full plan. Adjust or approve to start implementation.
```

### 4.4 Wait for approval

Do NOT implement until user explicitly approves.

## Never Do

- Proceed without writing findings
- Skip codebase research
- Write to project directories (always `/tmp/`)
- Ask scope/requirements questions (that's spec phase)
- Finalize with `[TBD]` markers
- Implement without approval
