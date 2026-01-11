---
name: fix-review-issues
description: "Orchestrate fixing issues found by review skills. Takes review report as input, creates fix plan, and implements fixes with verification. Use after running review skills. Triggers: fix review issues, fix findings, address review feedback."
metadata:
  short-description: "Fix issues from code reviews"
---

**User request**: $ARGUMENTS

Orchestrate fixing issues identified by review skills (`$review-bugs`, `$review-coverage`, `$review-maintainability`, `$review-type-safety`, `$review-docs`, `$review-agents-md`).

**Output file**: `/tmp/fix-progress-{YYYYMMDD-HHMMSS}.md`

## Phase 1: Parse Review Report

### 1.1 Identify Input

**Priority order:**
1. **Review report provided** (markdown content or file path) → parse issues
2. **Issue list provided** (inline) → parse directly
3. **Neither** → ask user: "Please provide a review report or run a review skill first (e.g., `$review-bugs`, `$review-coverage`)"

### 1.2 Extract Issues

From review report, extract each issue with:
- **Severity**: Critical | High | Medium | Low
- **Location**: file:line (if available)
- **Category**: bugs | coverage | maintainability | type-safety | docs | agents-md
- **Description**: Clear statement of the issue
- **Suggested fix**: From reviewer (if provided)
- **Evidence**: Code snippet showing the problem

**Deduplication**: If same file:line appears multiple times with similar descriptions, merge into single issue.

### 1.3 Create Progress File

Path: `/tmp/fix-progress-{YYYYMMDD-HHMMSS}.md`

```markdown
# Fix Progress: {review type}
Started: {timestamp}
Source: {review report path or "inline"}

## Issues to Fix

### Critical
- [ ] {file}:{line} - {description}

### High
- [ ] {file}:{line} - {description}

### Medium
- [ ] {file}:{line} - {description}

### Low
- [ ] {file}:{line} - {description}

## Fix Log
```

### 1.4 Create Todo List

Use `update_plan` to create prioritized todo list:

```
- [ ] [CRITICAL] Fix: {issue description} in {file}
- [ ] [HIGH] Fix: {issue description} in {file}
- [ ] [MEDIUM] Fix: {issue description} in {file}
- [ ] Verify all fixes
```

**Priority order**: Critical → High → Medium → Low

**Scope boundary**: Only fix issues from this review. If you notice other problems while fixing, do NOT fix them—note them in "Observations" section of progress file for future review.

## Phase 2: Fix Loop

For each issue, in priority order:

### 2.1 Mark In Progress

Update todo status and progress file.

### 2.2 Read Context

Read the full file containing the issue. Understand the context before making changes:
- What is the function/component doing?
- What are the existing patterns?
- What might the fix affect?

### 2.3 Implement Fix

Apply the fix following:
- Suggested fix from review (if provided and appropriate)
- Minimal change principle (smallest change that fixes the issue)
- Existing code patterns and style

**Fix strategies by category:**

| Category | Strategy |
|----------|----------|
| **Bugs** | Add guards, fix logic, handle edge cases |
| **Coverage** | Write suggested test, verify it catches the issue |
| **Maintainability** | Extract function, remove duplication, simplify |
| **Type Safety** | Add types, narrow types, remove `any` |
| **Docs** | Update docs/comments to match code |
| **AGENTS.md** | Follow documented patterns |

### 2.4 Verify Fix

**For bug fixes**:
- Confirm the bug condition is now handled
- Trace through the fix mentally
- Run related tests if they exist

**For coverage fixes**:
- Write the suggested test
- Run the test to verify it passes
- Verify test would fail without the fix

**For maintainability fixes**:
- Confirm duplication is removed / code is simplified
- Ensure no new issues introduced
- Check that behavior is unchanged

**For type safety fixes**:
- Run type checker (`tsc --noEmit`)
- Confirm type errors resolved
- Verify no new type errors introduced

**For doc fixes**:
- Verify docs now match code behavior
- Check examples still work
- Confirm no new inaccuracies

**For AGENTS.md fixes**:
- Verify compliance with quoted rule
- Check related rules weren't violated

### 2.5 Run Quality Gates

After each fix:
```bash
# Run applicable quality checks
# TypeScript: tsc --noEmit
# Lint: npm run lint
# Tests: npm test
```

**Gate detection**: Check AGENTS.md first, then package.json scripts, then config files.

### 2.6 Handle Failures

**If gates fail**:
1. Analyze the error
2. Identify root cause (fix introduced new issue vs pre-existing)
3. Fix the issue
4. Re-run gates
5. Max 5 attempts before escalating

**Same-error detection**: If same error persists after fix attempt, escalate immediately.

### 2.7 Log Completion

Update progress file:

```markdown
### {timestamp} - Fixed: {issue description}
- File: {path}
- Change: {what was changed}
- Verification: {how verified}
- Gates: PASS
```

### 2.8 Mark Complete

Update todo, proceed to next issue.

## Phase 3: Final Verification

### 3.1 Run All Quality Gates

Full pass after all fixes:
- Type check
- Lint
- Tests

### 3.2 Summarize Changes

```markdown
## Fix Summary

**Progress file**: /tmp/fix-progress-{...}.md

### Issues Fixed

| Severity | Issue | File | Status |
|----------|-------|------|--------|
| CRITICAL | {description} | {file} | FIXED |
| HIGH | {description} | {file} | FIXED |
| MEDIUM | {description} | {file} | FIXED |

### Files Modified
- `file1.ts`: {what changed}
- `file2.ts`: {what changed}

### Quality Gates
- Type check: PASS
- Lint: PASS
- Tests: PASS

### Issues Not Fixed
[If any issues couldn't be fixed, explain why with specific reason]

### Observations
[Any other issues noticed but not fixed - out of scope]

### Follow-up Needed
[Any items requiring additional attention]
```

## Edge Cases

| Case | Action |
|------|--------|
| No review report provided | Ask user to provide report or run review skill |
| Empty review (no issues) | Report "No issues to fix" |
| Issue location not found | Search for matching code pattern, ask if ambiguous |
| Suggested fix would break other code | Note in progress file, escalate |
| Fix attempt causes new gate failures | Analyze, fix if related; escalate if unrelated |
| Issue requires design decision | Escalate with options |
| Issue is outside current scope | Note in Observations, do not fix |

## Guidelines

### Fix Principles

**DO**:
- Fix one issue at a time
- Verify each fix before moving on
- Follow existing code patterns
- Keep changes minimal and focused
- Run quality gates frequently
- Log progress continuously

**DON'T**:
- Fix multiple issues in one change
- Refactor beyond the fix scope
- Skip verification
- Ignore failing tests
- Make unrelated changes
- Fix issues not in the review report

### When to Skip

Skip fixing an issue if:
- It's outside the current review scope
- It requires architectural changes beyond the fix
- It needs user decision on approach
- It would break other functionality
- The original issue assessment was incorrect

Mark skipped issues with specific reason in summary.

### Escalation

Escalate to user if:
- Fix attempts exceed 5 failures
- Issue requires design decision
- Fix would have broad impact
- Uncertainty about correct approach
- Contradictory requirements

## No Issues to Fix

If review report shows no issues:

```markdown
## Fix Summary

**Source**: {review report}
**Status**: NO ISSUES TO FIX

The review report indicates all checks passed. No fixes needed.
```
