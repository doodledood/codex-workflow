---
name: implement
description: "Execute implementation plans in-place with verification loops. Implements chunks sequentially, runs quality gates, auto-fixes failures. Use after $plan or with clear implementation instructions. Triggers: implement, build, code, execute plan."
---

**User request**: $ARGUMENTS

Execute implementation based on plan or instructions. Implements in-place with verification after each chunk.

**Fully autonomous**: No pauses except blocking issues: (1) git conflicts with overlapping changes in the same lines, (2) package manager failures (any package install command returning non-zero), (3) OS permission errors on file read/write. No other issues are blocking.

**Gates**: Automated verification commands (typecheck, lint, test) detected from project config. See "Gate Detection" section for resolution order. If no gates detected, verification passes based on acceptance criteria only.

## Phase 1: Parse Plan & Setup

### 1.1 Resolve Input

**Review flag**: Review workflow runs by default after implementation. If arguments contain `--no-review` (case-insensitive), disable it. Remove flag from arguments before processing below.

**Priority order:**
1. **`--progress <path>`** → resume from progress file
2. **File path** (ends in `.md` or starts with `/`) → use plan file, optionally with `--spec <path>`
3. **Inline task** (any other text) → create ad-hoc single chunk:
   ```
   ## 1. [Task summary - first 50 chars (if longer, truncate at last space before char 50 if that space is at position 10+; otherwise truncate at char 47 and append "..."; if 50 chars or fewer, use as-is)]
   - Depends on: -
   - Tasks: [user's description]
   - Files: (list as created/modified during execution)
   - Acceptance criteria: task completed AND gates pass
   ```
4. **Empty** → search `/tmp/plan-*.md` (most recent by file modification time; if tied, use alphabetically last filename); if none found, ask user what they want to implement

### 1.2 Parse Chunks

For each `## N. [Name]` header, extract:
- Dependencies (`Depends on:` field, `-` = none)
- Files to modify/create with descriptions
- Context files (paths, optional line ranges)
- Implementation tasks (bullet list)
- Acceptance criteria (if missing: derive from tasks by converting each task to a verifiable statement, e.g., "Add login button" → "Login button exists and is clickable". Always include "all gates pass" as baseline)
- Key functions/types (for context; not used for verification)

**Invalid plan**: Empty file, missing `## N. [Name]` chunk headers, or malformed Depends on/Tasks fields (Depends on must be `-` or comma-separated chunk numbers; Tasks must be a bullet list with at least one item) → Error with path + expected structure.

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
Confidence: -
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

Build flat todo list (Memento pattern—granular progress, resumable):
```
[ ] Read context for [Chunk]
[ ] [Task 1]...[ ] [Task N]
[ ] Run gates for [Chunk]
[ ] Commit chunk: [Chunk]
...
# Unless --no-review, append:
[ ] Run review on implemented changes
[ ] (Fix review issues - expand as findings emerge)
```

### 1.6 Handle Resume

If `--progress` argument provided:
1. Read progress file
2. Skip chunks with status `COMPLETE`
3. Resume from first `PENDING` or `IN_PROGRESS` chunk
4. For `IN_PROGRESS` chunks: check current state; if gates pass, mark complete; if fail, enter fix loop from current attempt count. If files were partially modified without git: read current state and complete remaining work rather than overwriting.

**Spec file** (`--spec <path>`): Read before implementation for requirements/acceptance criteria. If path doesn't exist, add to Notes: "Warning: Spec not found: [path]" and continue. Spec is only used when explicitly provided via --spec.

## Phase 2: Execute Chunks

**CRITICAL**: Execute continuously without pauses.

For each chunk in dependency order:

### 2.1 Mark In Progress

1. Mark implement todo `in_progress`
2. **Update progress file**: chunk status → `IN_PROGRESS`, `Last updated` timestamp

### 2.2 Gather Context

Read all context files listed in plan + files-to-modify, respect line ranges. Understand existing patterns before writing code.

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

**Run gates in order**: typecheck, then tests, then lint. Stop at first failure and iterate on that gate until it passes before proceeding to the next gate.

**Gate command detection**:
1. Check AGENTS.md for explicit commands (look for sections labeled "Development Commands", "Scripts", or "Gates"; identify typecheck/test/lint by command names like `tsc`, `jest`, `eslint`, `mypy`, `pytest`, `ruff`)
2. If AGENTS.md commands fail with "command not found", "not recognized", or exit code 127 → fall back to config detection
3. Use fallback detection (see Gate Detection section)

### 2.5 Handle Failures

**On failure—iterate**:
1. Analyze: parse errors, identify files/lines, understand root cause
2. Fix by addressing root cause (not by suppressing errors, skipping tests, or adding `// @ts-ignore`)
3. Re-run the failing gate
4. Track attempts per issue by error message and file:line; if same error persists after 3 distinct fix strategies, escalate

**Distinct fix strategy**: A strategy is distinct if it modifies different lines OR uses a categorically different technique: (1) adding/changing type annotations, (2) type assertions/casts, (3) refactoring logic/control flow, (4) adding null/undefined checks, (5) changing function signatures, (6) adding/modifying imports.

**Direct issues**: Errors in files this chunk created/modified - fix directly
**Indirect issues**: Errors in files NOT touched by chunk (your changes broke these) - fix in your files if possible, else edit the affected files

**Pause ONLY when**:
- Same error message and file:line persists after 3 distinct fix strategies
- Need info not available in codebase or context (API keys, credentials, external service configs)
- Fix requires modifying files not listed in the chunk's "Files:" field (creating new files is allowed only if they are: helper/utility modules, type definition files, or test files directly testing the chunk's code)
- Plan requirements contradict each other (both can't be satisfied simultaneously)

Report: what tried, why failed, what's needed.

### 2.6 Commit Chunk

After verification passes:
1. Mark commit todo `in_progress`
2. Stage files from chunk: `git add [files created/modified]`
3. Commit with message: `feat(plan): implement chunk N - [Name]`
4. **Do NOT push** - push happens at end or on user request
5. **Update progress file**: add commit SHA to chunk notes
6. Mark commit todo `completed`

**If git operation fails** (conflicts, dirty state, etc.):
1. Log issue in progress file
2. Attempt automated resolution only for: dirty working directory (`git stash`), unstaged changes (`git stash`). If stash succeeds, pop after git operation completes (`git stash pop`); if pop conflicts, leave stash intact and log in Notes. If stash operation fails, treat as unresolvable. Never attempt conflict resolution, branch switching, or rebase operations.
3. If unresolvable, report to user with specific error
4. Stop execution - user must resolve before resuming

### 2.7 Log Completion & Continue

Update progress file: chunk status → `COMPLETE`, increment `Completed: N/M`

```markdown
### {timestamp} - Chunk {N} Complete
- Files modified: {list}
- Files created: {list}
- Gates: PASS
- Confidence: HIGH | MEDIUM | LOW
- Commit: {SHA}
- Notes: {any observations}
```

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

Chunks: N | Files created: [list] | Files modified: [list]

### Chunk Summary
1. [Name] - [files touched]
2. [Name] - [files touched] - ⚠️ [uncertainty reason if LOW confidence]

### Quality Gates
- Type check: PASS
- Lint: PASS
- Tests: PASS

### Notes
{Any observations, LOW confidence items, or follow-up items}

Run `$review` for quality verification.
```

Unless `--no-review` → proceed to Phase 4

## Phase 4: Review Workflow (default, skip with --no-review)

Skip if `--no-review` was set.

### 4.1 Run Review

1. Mark "Run review" todo `in_progress`
2. Invoke: `$review --autonomous`
3. Mark "Run review" todo `completed`
4. If no issues → mark fix placeholder `completed`, done; else → 4.2

### 4.2 Fix Review Issues

1. Expand fix placeholder:
   ```
   [x] (Fix review issues - expand as findings emerge)
   [ ] Fix critical/high severity issues
   [ ] Re-run review to verify fixes
   [ ] (Additional fix iterations - expand if needed)
   ```
2. Mark "Fix critical/high" `in_progress`
3. Invoke: `$fix-review-issues --severity critical,high --autonomous`
4. Mark "Fix critical/high" `completed`, mark "Re-run review" `in_progress`
5. Invoke: `$review --autonomous`
6. Mark "Re-run review" `completed`
7. If issues remain → expand placeholder, repeat (max 3 cycles)
8. After 3 cycles or clean → mark placeholders `completed`, report status

## Edge Cases

| Case | Action |
|------|--------|
| Invalid plan (empty file, missing `## N. [Name]` headers, or malformed fields) | Error with path + expected structure |
| Circular dependencies in plan | Error: "Circular dependency detected: [chunk A] ↔ [chunk B]. Fix plan dependencies." |
| Missing context file | Add to Notes: "Warning: Context file not found: [path]", continue |
| Chunk fails (gates fail after 3 distinct fix strategies OR task requires unavailable info) | Leave todos pending, skip dependents, continue independents, report in summary |
| Partial gate success (e.g., typecheck passes but tests fail after 3 strategies) | Chunk fails; require all gates to pass for chunk completion |
| Same error detected | Stop immediately, escalate with recommendation |
| No acceptance criteria in plan | Auto-infer from tasks |
| Interrupted mid-chunk | Progress file shows IN_PROGRESS, resume re-starts that chunk |
| Resume with progress file | Skip COMPLETE chunks, start from first non-complete |
| Dependency not met (prior chunk FAILED or BLOCKED) | Mark BLOCKED (cascade to all dependents immediately), skip to next independent chunk |
| Inline task provided | Create ad-hoc single chunk, proceed normally |
| No input + no recent plan | Ask user what they want to implement |
| All remaining chunks blocked by dependencies | Mark overall status → `FAILED`, report blocked chunks and unmet dependencies, suggest re-planning or manual intervention |
| AGENTS.md gate commands fail | Fall back to config-based detection (see Gate Detection) |
| Spec file doesn't exist | Add to Notes: "Warning: Spec not found: [path]", continue without spec |

## Principles

- **Autonomous**: No prompts/pauses/approval except blocking issues listed in Phase 2.5 and Edge Cases
- **Memento todos**: One todo per action, granular visibility, resumable
- **Persistent auto-fix**: Iterate until gates pass (up to 3 distinct strategies per issue), escalate only when stuck
- **Dependency order**: Execute in order, skip failed chunk's dependents
- **Gates non-negotiable**: Fix root cause (no `@ts-ignore`, test skips, or suppressions); skip chunk only after 3 failed strategies
- **Commit per chunk**: Each successful chunk gets its own commit (no push until end); provides rollback points for recovery

## Gate Detection

**Priority**: AGENTS.md → package.json scripts → Makefile → config detection

Skip any source that doesn't define relevant commands (test/lint/typecheck).

**Fallback** (if AGENTS.md doesn't specify or commands fail with exit code 127):
- TS/JS: `tsconfig.json`→`tsc --noEmit`, `eslint.config.*`→`eslint .`, `jest/vitest.config.*`→`npm test`
- Python: `pyproject.toml`→`mypy`/`ruff check`, pytest config→`pytest`
- Go: `go.mod`→`go build ./...`, `golangci.yml`→`golangci-lint run`
- Rust: `Cargo.toml`→`cargo check`, `cargo test`
- Other languages: Skip gates with warning "No gate commands detected for [language]; specify in AGENTS.md"
