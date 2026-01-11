---
name: implement
description: "Execute implementation plans in-place with verification loops. Implements chunks sequentially, runs quality gates, auto-fixes failures. Use after $plan or with clear implementation instructions. Triggers: implement, build, code, execute plan."
metadata:
  short-description: "Execute plans with auto-fix loops"
---

**User request**: $ARGUMENTS

Execute implementation based on plan or instructions. Implements in-place with verification after each chunk.

**Fully autonomous**: No pauses except blocking issues: (1) git conflicts with overlapping changes in the same lines, (2) package manager failures (any package install command returning non-zero), (3) OS permission errors on file read/write. No other issues are blocking.

**Gates**: Automated verification commands (typecheck, lint, test) detected from project config. See "Gate Detection" section for resolution order. If no gates detected, verification passes based on acceptance criteria only.

## Phase 1: Parse Plan & Setup

### 1.1 Resolve Input

**Priority order:**
1. **`--progress <path>`** → resume from progress file
2. **File path** (ends in `.md` or starts with `/`) → use plan file
3. **Inline task** (any other text) → create ad-hoc single chunk:
   ```
   ## 1. [First 50 characters of task, truncated at last space before character 50]
   - Depends on: -
   - Tasks: [full user text]
   - Files: (discover during implementation)
   - Acceptance criteria: derived from task text; all detected gates must pass
   ```
4. **Empty** → error: "Provide plan path, inline task, or run $plan first"

### 1.2 Parse Chunks

For each `## N. [Name]` header, extract:
- Dependencies (`Depends on:` field, `-` = none)
- Files to modify/create with descriptions
- Context files (paths, optional line ranges)
- Implementation tasks (bullet list)
- Acceptance criteria (if missing: derive from tasks by converting each task to a verifiable statement, e.g., "Add login button" → "Login button exists and is clickable". Always include "all gates pass" as baseline)
- Key functions/types (for context; not used for verification)

### 1.3 Build Dependency Graph

Order: No-dependency chunks first (by chunk number: ## 1 before ## 2), then topological order (ties broken by chunk number).

### 1.4 Create Progress File

Path: `/tmp/implement-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

**Timestamp format**: All timestamps use ISO 8601: `YYYY-MM-DDTHH:MM:SS` (e.g., `2026-01-09T14:30:00`).

```markdown
# Implementation Progress: [Plan Name]

Started: [timestamp]
Plan: [path to plan file]
Status: IN_PROGRESS

## Chunks

### Chunk 1: [Name]
Status: PENDING
Attempts: 0
Files created: []
Files modified: []
Notes:

### Chunk 2: [Name]
Status: PENDING
...

## Summary
Completed: 0/N chunks
Last updated: [timestamp]
```

### 1.5 Create Todo List

Build todos with items per chunk:
```
[ ] Implement chunk 1: [Name]
[ ] Verify chunk 1: [Name]
[ ] Implement chunk 2: [Name]
[ ] Verify chunk 2: [Name]
...
[ ] Final verification
```

### 1.6 Handle Resume

If `--progress` argument provided:
1. Read progress file
2. Skip chunks with status `COMPLETE`
3. Resume from first `PENDING` or `IN_PROGRESS` chunk
4. For `IN_PROGRESS` chunks: check current state; if gates pass, mark complete; if fail, enter fix loop from current attempt count

## Phase 2: Execute Chunks

**CRITICAL**: Execute continuously without pauses.

For each chunk in dependency order:

### 2.1 Mark In Progress

1. Mark implement todo `in_progress`
2. **Update progress file**: chunk status → `IN_PROGRESS`, `Last updated` timestamp

### 2.2 Gather Context

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

**Confidence levels**:
- **HIGH**: All tasks completed exactly as specified with no interpretation needed
- **MEDIUM**: All tasks completed but required interpreting ambiguous requirements or choosing between valid approaches
- **LOW**: Tasks completed but required deviation that changes approach/architecture

For LOW confidence items, document uncertainty in progress file.

### 2.4 Run Quality Gates

After each chunk, run applicable gates:

```bash
# Detect and run project's quality checks
# TypeScript: tsc --noEmit
# Lint: npm run lint / eslint / ruff
# Tests: npm test / pytest / go test
```

**Gate detection priority**: AGENTS.md → package.json scripts → Makefile → config detection

**Fallback** (if AGENTS.md doesn't specify):
- TS/JS: `tsconfig.json`→`tsc --noEmit`, `eslint.config.*`→`eslint .`, `jest/vitest.config.*`→`npm test`
- Python: `pyproject.toml`→`mypy`/`ruff check`, pytest config→`pytest`
- Other languages: check for standard config files (Makefile, build.gradle, Cargo.toml, etc.) and infer commands. If no recognizable config, verification passes based on acceptance criteria only (no gates).

### 2.5 Handle Failures

**If gates fail**:

1. Analyze error output
2. Identify root cause (Direct issues in chunk's files vs Indirect issues in other files)
3. Fix the issue
4. Re-run gates
5. Repeat up to 5 attempts

**Direct issues**: Errors in files this chunk created/modified - fix directly
**Indirect issues**: Errors in files NOT touched by chunk (your changes broke these) - fix in your files if possible, else edit the affected files

**After 5 failures**: Stop and report blocker to user with:
- What was attempted
- Error messages
- Attempts history
- Recommendation (specific code fix, "Review [file:line]", or "Re-plan chunk")

**Same-error detection**: If the same error persists after a fix attempt (same file + same error code/message), escalate immediately instead of retrying.

### 2.6 Log Completion

Update progress log:

```markdown
### {timestamp} - Chunk {N} Complete
- Files modified: {list}
- Files created: {list}
- Gates: PASS
- Confidence: HIGH | MEDIUM | LOW
- Notes: {any observations}
```

### 2.7 Mark Complete and Continue

Update progress file: chunk status → `COMPLETE`, increment `Completed: N/M`
Update todo, proceed to next chunk.

## Phase 3: Final Verification

### 3.1 Run All Gates

Full quality gate pass on complete implementation:
- Type checking
- Linting
- All tests

### 3.2 Verify Acceptance Criteria

Check each acceptance criterion from plan:
- [ ] Criterion 1: verified how
- [ ] Criterion 2: verified how

### 3.3 Report Completion

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
{Any observations, LOW confidence items, or follow-up items}
```

## Edge Cases

| Case | Action |
|------|--------|
| Invalid plan (no `## N.` chunk headers) | Error: "Plan must contain at least one chunk (## 1. Name)" |
| Circular dependencies in plan | Error: "Circular dependency detected: [chunk A] ↔ [chunk B]. Fix plan dependencies." |
| Missing context file | Log warning in progress file Notes, continue execution |
| Chunk fails after 5 attempts | Mark FAILED, stop, report which chunk and why |
| Same error detected | Stop immediately, escalate with recommendation |
| No acceptance criteria in plan | Auto-infer from tasks |
| Interrupted mid-chunk | Progress file shows IN_PROGRESS, resume re-starts that chunk |
| Resume with progress file | Skip COMPLETE chunks, start from first non-complete |
| Dependency not met (prior chunk FAILED) | Mark dependent chunks BLOCKED, skip to next independent chunk |
| Inline task provided | Create ad-hoc single chunk, proceed normally |
| No input provided | Error: "Provide plan path, inline task, or run $plan first" |
| All remaining chunks blocked by dependencies | Mark overall status → `FAILED`, report blocked chunks and unmet dependencies |

## Handling Blockers

### Types of Blockers

| Blocker | Action |
|---------|--------|
| Missing dependency | Ask user to install |
| Unclear requirement | Ask user to clarify |
| Git conflict | Report and wait |
| Test environment issue | Report and suggest fix |
| Architectural issue | Report, suggest alternatives |

### When Blocked

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
- Update progress file after each step

**DON'T**:
- Skip quality gates
- Implement multiple chunks without verification
- Ignore test failures
- Make changes outside plan scope
- Proceed past 5 fix attempts without user input
- Continue after same-error detection

## Principles

- **Progress tracking**: Update progress file after every step
- **Autonomous**: No prompts/pauses/approval except blocking issues
- **Retry heavily**: 5 attempts before giving up, escalation is last resort
- **Same-error aware**: Detect loops, don't wall-slam
- **Acceptance-focused**: Gates + criteria must pass
