---
name: fix-review-issues
description: "Orchestrate fixing issues found by review skills. Takes review report as input, creates fix plan, and implements fixes with verification. Use after running review skills. Triggers: fix review issues, fix findings, address review feedback."
---

**User request**: $ARGUMENTS

Orchestrate fixing issues identified by review skills (`$review-bugs`, `$review-coverage`, `$review-maintainability`, etc.).

## Phase 1: Parse Review Report

### 1.1 Identify input

**If review report provided**: Parse issues from the report.

**If no report**: Ask user which review to run first, or specify issues to fix.

### 1.2 Extract issues

From the review report, extract:
- Issue severity (Critical, High, Medium, Low)
- Issue location (file:line)
- Issue description
- Suggested fix (if provided)

### 1.3 Create fix plan

Use `update_plan` to create prioritized todo list:

```
- [ ] [CRITICAL] Fix: {issue description} in {file}
- [ ] [HIGH] Fix: {issue description} in {file}
- [ ] [MEDIUM] Fix: {issue description} in {file}
- [ ] Verify all fixes
```

**Priority order**: Critical → High → Medium → Low

## Phase 2: Fix Loop

For each issue, in priority order:

### 2.1 Mark in progress

Update todo status.

### 2.2 Read context

Read the full file containing the issue. Understand the context before making changes.

### 2.3 Implement fix

Apply the fix following:
- Suggested fix from review (if provided)
- Minimal change principle
- Existing code patterns

### 2.4 Verify fix

**For bug fixes**:
- Confirm the bug condition is handled
- Run related tests if they exist

**For coverage fixes**:
- Write the suggested test
- Run the test to verify it passes

**For maintainability fixes**:
- Confirm duplication is removed / code is simplified
- Ensure no new issues introduced

**For type safety fixes**:
- Run type checker
- Confirm type errors resolved

**For doc fixes**:
- Update documentation
- Verify accuracy against code

### 2.5 Run quality gates

After each fix:
```bash
# Run applicable quality checks
# tsc --noEmit (TypeScript)
# npm run lint
# npm test
```

### 2.6 Handle failures

**If gates fail**:
1. Analyze the error
2. Fix the issue
3. Re-run gates
4. Max 5 attempts before escalating

### 2.7 Mark complete

Update todo, proceed to next issue.

## Phase 3: Final Verification

### 3.1 Run all quality gates

Full pass after all fixes:
- Type check
- Lint
- Tests

### 3.2 Summarize changes

```markdown
## Fix Summary

### Issues Fixed

| Severity | Issue | File | Status |
|----------|-------|------|--------|
| CRITICAL | {description} | {file} | FIXED |
| HIGH | {description} | {file} | FIXED |
| ... | ... | ... | ... |

### Files Modified
- `file1.ts`: {what changed}
- `file2.ts`: {what changed}

### Quality Gates
- Type check: PASS
- Lint: PASS
- Tests: PASS

### Issues Not Fixed
[If any issues couldn't be fixed, explain why]

### Follow-up Needed
[Any items requiring additional attention]
```

## Guidelines

### Fix Principles

**DO**:
- Fix one issue at a time
- Verify each fix before moving on
- Follow existing code patterns
- Keep changes minimal and focused
- Run quality gates frequently

**DON'T**:
- Fix multiple issues in one change
- Refactor beyond the fix scope
- Skip verification
- Ignore failing tests
- Make unrelated changes

### When to Skip

Skip fixing an issue if:
- It's outside the current scope
- It requires architectural changes
- It needs user decision
- It would break other functionality

Mark skipped issues with reason in summary.

### Escalation

Escalate to user if:
- Fix attempts exceed 5 failures
- Issue requires design decision
- Fix would have broad impact
- Uncertainty about correct approach

## No Issues to Fix

If review report shows no issues:

```markdown
## Fix Summary

No issues to fix. The review report indicates all checks passed.
```
