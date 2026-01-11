---
name: implement
description: "Execute implementation plans in-place with verification loops. Implements chunks sequentially, runs quality gates, auto-fixes failures. Use after $plan or with clear implementation instructions. Triggers: implement, build, code, execute plan."
---

**User request**: $ARGUMENTS

Execute implementation based on plan or instructions. Implements in-place with verification after each chunk.

## Phase 1: Setup

### 1.1 Determine scope

**If plan file provided**: Read plan, extract chunks and acceptance criteria.

**If no plan**: Treat user request as implementation instructions. Break into logical chunks if complex.

### 1.2 Create todos

Use `update_plan` with implementation chunks:

```
- [ ] Chunk 1: {description}
- [ ] Chunk 2: {description}
- [ ] ...
- [ ] Final verification
```

### 1.3 Create progress log

Path: `/tmp/implement-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

```markdown
# Implementation Progress: {feature}
Started: {timestamp}
Plan: {path or "inline instructions"}

## Chunks
| # | Name | Status | Notes |
|---|------|--------|-------|

## Activity Log
```

## Phase 2: Implementation Loop

For each chunk:

### 2.1 Mark in progress

Update todo status and log.

### 2.2 Gather context

Read all context files listed in plan. Understand existing patterns before writing code.

### 2.3 Implement

Write code following:
- Existing codebase patterns and conventions
- Plan specifications
- AGENTS.md guidelines if present

**Implementation principles**:
- Match existing code style exactly
- Keep changes minimal and focused
- Don't refactor unrelated code
- Add tests as specified in plan

### 2.4 Run quality gates

After each chunk, run applicable gates:

```bash
# Detect and run project's quality checks
# TypeScript: tsc --noEmit
# Lint: npm run lint / eslint / ruff
# Tests: npm test / pytest / go test
```

**Gate detection**: Check `package.json`, `pyproject.toml`, `Makefile`, etc. for available commands.

### 2.5 Handle failures

**If gates fail**:

1. Analyze error output
2. Identify root cause
3. Fix the issue
4. Re-run gates
5. Repeat up to 5 attempts

**After 5 failures**: Stop and report blocker to user with:
- What was attempted
- Error messages
- What's blocking progress

### 2.6 Log completion

Update progress log:

```markdown
### {timestamp} - Chunk {N} Complete
- Files modified: {list}
- Files created: {list}
- Gates: PASS
- Notes: {any observations}
```

### 2.7 Mark complete and continue

Update todo, proceed to next chunk.

## Phase 3: Final Verification

### 3.1 Run all gates

Full quality gate pass on complete implementation:
- Type checking
- Linting
- All tests

### 3.2 Verify acceptance criteria

Check each acceptance criterion from plan:
- [ ] Criterion 1: verified how
- [ ] Criterion 2: verified how

### 3.3 Report completion

```
## Implementation Complete

**Progress file**: /tmp/implement-{...}.md

### Summary
- Chunks completed: {N}
- Files modified: {list}
- Files created: {list}

### Quality Gates
- Type check: PASS
- Lint: PASS
- Tests: PASS

### Acceptance Criteria
- [x] {criterion}: verified
- [x] {criterion}: verified

### Notes
{Any observations or follow-up items}
```

## Handling Blockers

### Types of blockers

| Blocker | Action |
|---------|--------|
| Missing dependency | Ask user to install |
| Unclear requirement | Ask user to clarify |
| Git conflict | Report and wait |
| Test environment issue | Report and suggest fix |
| Architectural issue | Report, suggest alternatives |

### When blocked

1. Document what's blocking in progress log
2. Report to user with context
3. Wait for resolution
4. Continue when unblocked

## Guidelines

**DO**:
- Run gates after every chunk
- Keep chunks small and verifiable
- Log progress continuously
- Fix failures before proceeding
- Match existing code style

**DON'T**:
- Skip quality gates
- Implement multiple chunks without verification
- Ignore test failures
- Make changes outside plan scope
- Proceed past 5 fix attempts without user input

## Confidence Levels

When implementing, note confidence:

- **HIGH**: Clear requirements, familiar patterns, straightforward implementation
- **MEDIUM**: Some ambiguity, but reasonable interpretation possible
- **LOW**: Significant uncertainty, multiple valid approaches

For LOW confidence items, document uncertainty and consider asking user before proceeding.
