---
name: web-research
description: "Conduct structured web research with hypothesis tracking. Synthesizes information from multiple sources into actionable findings. Use for technical research, API docs, best practices. Triggers: web research, look up, search for, find documentation."
metadata:
  short-description: "Structured web research"
---

**User request**: $ARGUMENTS

Conduct structured web research to gather external information, synthesize findings, and provide actionable recommendations.

## Phase 1: Setup

### 1.1 Define research scope

Identify:
- **Primary question**: What are we trying to learn?
- **Context**: Why do we need this information?
- **Success criteria**: What would a good answer include?

### 1.2 Create research log

Path: `/tmp/research-{YYYYMMDD-HHMMSS}-{topic-kebab-case}.md`

```markdown
# Research Log: {topic}
Started: {timestamp}

## Research Question
{Primary question}

## Context
{Why we need this}

## Hypotheses
## Sources Consulted
## Findings
## Synthesis
```

### 1.3 Form initial hypotheses

Before searching, document initial hypotheses:

```markdown
## Hypotheses

1. H1: {What we think might be true}
2. H2: {Alternative possibility}
3. H3: {Another angle}
```

This prevents confirmation bias and ensures thorough research.

## Phase 2: Research Loop

### 2.1 Search strategically

For each hypothesis/question:

1. **Formulate search queries**
   - Start broad, then narrow
   - Use technical terms
   - Include version numbers for versioned tools

2. **Prioritize sources**
   - Official documentation (highest priority)
   - GitHub repos and issues
   - Stack Overflow (with date filtering)
   - Technical blogs from reputable authors
   - Avoid: outdated content, SEO-optimized fluff

3. **Evaluate source quality**
   - Is it official/authoritative?
   - Is it current (check dates)?
   - Does it cite sources?
   - Do multiple sources agree?

### 2.2 Document findings

After each source, update research log:

```markdown
### Source: {URL or title}
**Date**: {publication date}
**Credibility**: High | Medium | Low
**Relevant to**: H1, H2

**Key findings**:
- {Finding 1}
- {Finding 2}

**Quotes**:
> "{Relevant quote}" - {source}

**Contradicts**: {any conflicting info from other sources}
```

### 2.3 Update hypotheses

As findings come in:
- Mark hypotheses as CONFIRMED, REFUTED, or NEEDS MORE DATA
- Add new hypotheses discovered during research
- Note confidence level (high/medium/low)

### 2.4 Know when to stop

Stop researching when:
- Primary question is answered with high confidence
- Multiple authoritative sources agree
- Further searching yields diminishing returns
- Time/effort exceeds value

## Phase 3: Synthesis

### 3.1 Refresh context

Read full research log before synthesizing.

### 3.2 Write synthesis

```markdown
## Synthesis

### Answer to Primary Question
{Direct answer with confidence level}

### Key Findings
1. {Most important finding}
2. {Second finding}
3. {Third finding}

### Evidence Summary
- {Finding} supported by {N} sources: {source list}
- {Finding} has conflicting information: {explain}

### Caveats and Limitations
- {What we couldn't verify}
- {Where information was sparse}
- {Potential biases in sources}

### Recommendations
1. {Actionable recommendation}
2. {Alternative approach}
3. {What to watch out for}

### Sources
1. {Source 1 with URL}
2. {Source 2 with URL}
...
```

### 3.3 Present summary

```markdown
## Research Summary

**Question**: {Primary question}
**Confidence**: High | Medium | Low
**Research log**: /tmp/research-{...}.md

### Answer
{Concise answer}

### Key Findings
- {Finding 1}
- {Finding 2}
- {Finding 3}

### Recommendations
1. {What to do}
2. {What to avoid}

### Top Sources
- {Most authoritative source}
- {Second source}
```

## Guidelines

### DO
- Document hypotheses BEFORE searching
- Record ALL sources consulted
- Note contradictions between sources
- Cite specific sources for claims
- Acknowledge uncertainty

### DON'T
- Cherry-pick sources that confirm expectations
- Trust single sources for important claims
- Ignore publication dates
- Present opinions as facts
- Skip the synthesis step

### Source Hierarchy

1. **Official docs** - Highest authority
2. **GitHub/source code** - Ground truth for implementation
3. **GitHub issues** - Real-world problems and solutions
4. **Stack Overflow** - Community knowledge (check dates!)
5. **Technical blogs** - Insights but verify
6. **General articles** - Background only

### Handling Conflicting Information

When sources disagree:
1. Check dates (newer often better)
2. Check authority (official > community)
3. Check specificity (exact version > general)
4. Note the conflict in findings
5. Present both perspectives if unresolved
