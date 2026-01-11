---
name: spec
description: "Build requirements specification through structured discovery interview. Use when starting a new feature, defining scope, gathering requirements, or specifying WHAT work should accomplish. Triggers: spec, requirements, define scope, what to build."
---

**User request**: $ARGUMENTS

Build requirements specification through structured discovery. Asks questions to understand the full scope before implementation.

**Focus**: WHAT and WHY, not HOW. Spec defines requirements; planning defines implementation.

**Output file**: `/tmp/spec-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

## Phase 1: Initial Setup

### 1.1 Create todos immediately

Use `update_plan` to track areas to discover:

```
- [ ] Understand core goal/problem
- [ ] Identify user personas and use cases
- [ ] Define functional requirements
- [ ] Define non-functional requirements (performance, security)
- [ ] Identify constraints and out-of-scope items
- [ ] (expand as discovery reveals new areas)
```

### 1.2 Create interview log

Path: `/tmp/spec-interview-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

```markdown
# Interview Log: {feature}
Started: {timestamp}

## Questions Asked
## Answers Received
## Requirements Extracted
## Open Items
```

## Phase 2: Discovery Interview

### Interview Rules

**Unbounded loop**: Continue until ALL requirements are captured. No fixed round limit.

**Question priority order**:

| Priority | Type | Purpose |
|----------|------|---------|
| 1 | Goal Clarification | Core problem being solved |
| 2 | User/Persona | Who uses this, what's their context |
| 3 | Functional | What must it do |
| 4 | Edge Cases | What happens when things go wrong |
| 5 | Non-Functional | Performance, security, scalability |
| 6 | Constraints | What's explicitly out of scope |

### Memento Loop

1. Mark todo `in_progress`
2. Ask clarifying question
3. **Write answer immediately** to interview log
4. Extract requirements from answer
5. Expand todos for new areas discovered
6. Mark todo `completed`
7. Repeat until no pending todos

**NEVER proceed without writing findings** — interview log = external memory.

### Question Guidelines

**DO**:
- Ask one focused question at a time
- Provide options when helpful: "Would you prefer A) X or B) Y?"
- Ask about edge cases: "What should happen if..."
- Clarify ambiguity: "When you say X, do you mean..."

**DON'T**:
- Ask implementation questions (that's planning phase)
- Make assumptions without confirming
- Skip edge cases and error handling
- Proceed when requirements are unclear

### When User Delegates

If user says "just decide", "you pick", or similar:
1. Document decision with `[INFERRED: {choice} - {rationale}]`
2. Continue with next question
3. Note inference in final spec

## Phase 3: Finalize & Present

### 3.1 Refresh context

Read the full interview log to restore all findings before writing final spec.

### 3.2 Write specification

Path: `/tmp/spec-{YYYYMMDD-HHMMSS}-{name-kebab-case}.md`

```markdown
# SPECIFICATION: {Feature Name}

## Overview
{1-2 sentence summary of what this feature does}

## Problem Statement
{What problem does this solve? Why is it needed?}

## User Personas
{Who will use this? What's their context?}

## Functional Requirements

### Must Have (P0)
- [ ] {Requirement with clear acceptance criteria}

### Should Have (P1)
- [ ] {Requirement}

### Nice to Have (P2)
- [ ] {Requirement}

## Non-Functional Requirements
- Performance: {criteria}
- Security: {considerations}
- Scalability: {needs}

## Constraints & Out of Scope
- NOT doing: {explicit exclusions}
- Assumes: {dependencies, prerequisites}

## Open Questions
{Any unresolved items for future clarification}

## Acceptance Criteria
{How do we know this is done?}
```

### 3.3 Present summary

```
## Spec Summary

**Spec file**: /tmp/spec-{...}.md

### What We're Building
{1-2 sentences}

### Key Requirements
- {Top 3-5 requirements}

### Out of Scope
- {Key exclusions}

---
Review spec. Adjust or approve to proceed to planning.
```

### 3.4 Wait for approval

Do NOT proceed to planning until user explicitly approves spec.

## Never Do

- Skip questions to move faster
- Assume requirements without confirming
- Proceed without writing findings to log
- Include implementation details (that's planning)
- Finalize with unresolved ambiguity
