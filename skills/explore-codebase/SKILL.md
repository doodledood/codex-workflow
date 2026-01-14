---
name: explore-codebase
description: "Comprehensive codebase exploration and analysis. Discovers architecture, patterns, dependencies, and answers questions about the codebase. Use for understanding unfamiliar code, onboarding, or researching implementation approaches. Triggers: explore codebase, understand code, how does this work, codebase overview."
---

**User request**: $ARGUMENTS

Comprehensive codebase exploration. Discovers architecture, patterns, entry points, dependencies, and answers specific questions about the codebase.

**Exploration log**: `/tmp/explore-{YYYYMMDD-HHMMSS}-{topic-kebab-case}.md` - external memory for findings.

## Phase 1: Scope Definition

### 1.1 Determine Exploration Goal

Parse `$ARGUMENTS` to identify what user wants to learn:

| Request Type | Exploration Focus |
|--------------|------------------|
| "How does X work?" | Trace specific feature/flow |
| "Where is X?" | Locate specific code |
| "Codebase overview" | Architecture discovery |
| "Find files for X" | File identification |
| "Understand X module" | Module deep-dive |
| Vague/empty | Ask user what they want to explore |

### 1.2 Create Todo List

```
- [ ] Initial structure scan
- [ ] Entry point discovery
- [ ] Core module analysis
- [ ] (expand as exploration reveals areas)
- [ ] Synthesize findings
```

### 1.3 Create Exploration Log

Path: `/tmp/explore-{YYYYMMDD-HHMMSS}-{topic-kebab-case}.md`

```markdown
# Codebase Exploration: {topic}
Started: {timestamp}

## Goal
{What we're trying to learn}

## Structure
(populated during exploration)

## Key Files
(populated during exploration)

## Patterns Discovered
(populated during exploration)

## Findings
(populated during exploration)
```

## Phase 2: Structure Discovery

### 2.1 High-Level Scan

Identify project structure:
- Language(s) and frameworks (check package.json, pyproject.toml, go.mod, Cargo.toml, etc.)
- Directory structure (src/, lib/, app/, components/, etc.)
- Configuration files (tsconfig.json, .eslintrc, etc.)
- Documentation files (README.md, AGENTS.md, docs/)

### 2.2 Entry Points

Locate main entry points:
- Application entry (main.ts, index.ts, app.py, main.go)
- Package exports (index.ts files, __init__.py)
- API routes (routes/, api/, handlers/)
- CLI commands (commands/, cli/)

### 2.3 Update Log

```markdown
## Structure

**Language**: {primary language}
**Framework**: {if any}
**Build system**: {npm/yarn/cargo/go/etc.}

### Directory Layout
```
src/
├── components/  - {purpose}
├── services/    - {purpose}
├── utils/       - {purpose}
└── types/       - {purpose}
```

### Entry Points
- `src/index.ts` - Main application entry
- `src/api/` - API route handlers
```

## Phase 3: Focused Exploration

### 3.1 Question-Driven Exploration

For specific questions ("How does X work?"):

1. Search for X in codebase (file names, function names, comments)
2. Read identified files fully
3. Trace execution flow from entry point
4. Identify dependencies and data flow
5. Document findings in log

### 3.2 Module Deep-Dive

For module understanding:

1. Read main file(s) of the module
2. Identify exports and public API
3. Trace internal dependencies
4. Understand data structures and state
5. Find related tests for behavior verification

### 3.3 Pattern Discovery

Look for recurring patterns:
- Error handling approach
- State management
- API communication
- Component structure
- Testing patterns
- Naming conventions

### 3.4 Dependency Mapping

For complex features:

```markdown
## Dependency Graph: {feature}

Feature X
├── depends on: ModuleA (for Y)
├── depends on: ModuleB (for Z)
└── used by: FeatureP, FeatureQ
```

## Phase 4: Iterative Discovery

### Exploration Loop

1. Mark todo `in_progress`
2. Search/read relevant code
3. **Write findings immediately** to exploration log
4. Identify new areas to explore → add todos
5. Mark todo `completed`
6. Repeat until question answered or overview complete

### 4.1 Log Format

After each exploration step:

```markdown
### {timestamp} - {area explored}
**Files read**: {list}
**Key findings**:
- {finding 1}
- {finding 2}
**New areas identified**: {list or "none"}
**Questions answered**: {list or "none"}
```

### 4.2 Todo Expansion

| Discovery Reveals | Add Todo For |
|------------------|--------------|
| Unknown module dependency | Module analysis |
| Complex data flow | Flow tracing |
| Multiple implementation patterns | Pattern comparison |
| External integration | Integration point analysis |
| Unclear test coverage | Test exploration |

## Phase 5: Synthesis

### 5.1 Refresh Context

Read the full exploration log before synthesizing.

### 5.2 Compile Findings

Based on exploration goal:

**For "How does X work?"**:
```markdown
## How {X} Works

### Overview
{1-2 sentence summary}

### Key Files
- `path/to/file.ts` - {role}

### Flow
1. {Step 1}
2. {Step 2}

### Important Details
- {Detail 1}
- {Detail 2}
```

**For "Codebase overview"**:
```markdown
## Codebase Overview

### Architecture
{High-level description}

### Key Modules
| Module | Purpose | Key Files |
|--------|---------|-----------|
| Auth | User authentication | src/auth/ |
| API | REST endpoints | src/api/ |

### Patterns
- {Pattern 1}: {description}
- {Pattern 2}: {description}

### Entry Points
- {Entry 1}: {purpose}
```

**For "Where is X?"**:
```markdown
## Location: {X}

**Found in**: `path/to/file.ts:line`

### Context
{What it does, how it's used}

### Related Files
- `path/to/related.ts` - {relationship}
```

### 5.3 Present Summary

```
## Exploration Complete

**Goal**: {what was explored}
**Files analyzed**: {count}

### Key Findings
{Main discoveries}

### Relevant Files
{Most important files for this topic}

### Architecture Notes
{Any architectural insights}

**Full exploration log**: /tmp/explore-{...}.md
```

## Exploration Techniques

### Finding Code

| Looking For | Technique |
|-------------|-----------|
| Function definition | Search for `function name(` or `name =` |
| Class/type | Search for `class Name` or `type Name` |
| Usage | Search for function/type name as token |
| Related tests | Search in `*.test.*` or `*.spec.*` files |
| Configuration | Check config files, env files |

### Understanding Flow

1. Start from entry point or API endpoint
2. Follow function calls depth-first
3. Note data transformations
4. Identify side effects (DB, API calls, state changes)
5. Map error handling paths

### Common Patterns to Identify

- **Dependency injection**: How dependencies are provided
- **Error handling**: Try/catch patterns, error types
- **State management**: Where state lives, how it's updated
- **API patterns**: REST, GraphQL, RPC conventions
- **Testing patterns**: Unit, integration, mocking approaches

## Edge Cases

| Case | Action |
|------|--------|
| Very large codebase | Focus on user's specific question, don't try to cover everything |
| No clear entry point | Look for README, main files, or ask user |
| Multiple languages | Focus on primary language, note others |
| Generated code | Skip, focus on source |
| Question too vague | Ask user to clarify what specifically they want to understand |

## Principles

- **Write findings immediately** — exploration log is external memory
- **Depth over breadth** — understand one area well rather than many shallowly
- **Follow the data** — trace how data flows through the system
- **Check tests** — tests reveal intended behavior
- **Don't assume** — verify by reading code
