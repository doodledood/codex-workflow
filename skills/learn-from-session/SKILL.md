---
name: learn-from-session
description: 'Analyzes Claude Code sessions to identify workflow gaps and suggest skill improvements. Use when asked to analyze a session, learn from a session, review workflow effectiveness, or find what went wrong.'
---

**User request**: $ARGUMENTS

Analyze a Claude Code session to identify what went well and what could be improved, then suggest high-confidence fixes to skills in this repository.

**Input formats**:
- Session ID (UUID): `184078b7-2609-46e0-a1f2-bb42367a8d34`
- Session file path: `~/.claude/projects/.../session-id.jsonl`
- Inline commentary: Text description of what happened

**Output**: High-confidence issues only with evidence-based suggestions for skill improvements.

**Signal quality bar**: Only recommend changes that would have **measurably changed the session outcome** (prevented a specific iteration, correction, or rework). A fix is high-signal if you can answer: "If this change existed, which specific retry or correction would NOT have happened?"

---

## Phase 1: Parse Input & Setup

### 1.1 Identify input type

| Input Pattern | Type | Action |
|---------------|------|--------|
| UUID format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) | Session ID | Find and read session file |
| Path ending in `.jsonl` | Session file | Read directly |
| Other text | Commentary | Analyze inline (skip to Phase 3, adapt detection to narrative analysis) |

### 1.2 Locate session file (if session ID)

Session files are stored at:
```
~/.claude/projects/{project-path-encoded}/{session-id}.jsonl
```

Use shell to find:
```bash
find ~/.claude/projects -name "*{session-id}*" -type f 2>/dev/null | head -1
```

**If multiple matches**: Use the most recently modified file (`ls -t` to sort).

**If no matches**: Report error: "Session file not found for ID: {session-id}. Verify the session ID or provide the file path directly."

### 1.3 Create analysis log (Memento pattern)

Path: `/tmp/session-analysis-{first-8-chars-of-session-id}-{timestamp}.md`

**Purpose**: External memory that persists findings beyond working memory limits. Write to this file AFTER completing EACH detection subsection (3.1, 3.2, etc.)—this externalizes findings before they decay in context.

**Why this matters**: LLMs have limited working memory (~5-10 items). Without externalizing, early findings get "pushed out" by later processing. The log file acts as permanent storage that the refresh step (5.1) brings back into high-attention context.

```markdown
# Session Analysis Log

Session: {id or "inline commentary"}
Started: {timestamp}
Status: IN_PROGRESS

---

## Session Overview
<!-- Write after Phase 2 parsing -->

**Initial request**:
**Skills invoked**:
**Outcome**:
**Session length**:

---

## Pattern Detection

### Iterations Found
<!-- Write after completing 3.1 -->

### User Corrections Found
<!-- Write after completing 3.2 -->

### Workflow Deviations Found
<!-- Write after completing 3.3 -->

### Missing Questions Found
<!-- Write after completing 3.4 -->

### Post-Implementation Fixes Found
<!-- Write after completing 3.5 -->

---

## Skill Comparison

### Skills Discovered
<!-- Write after discovering which skills were used -->

### Skill: {name}
<!-- Write after analyzing EACH skill separately -->

---

## Potential Issues
<!-- Write each issue as identified during comparison -->

---

## Counterfactual Analysis
<!-- Write results of 3/3 test for each issue -->

---

## Final Recommendations
<!-- Populated after refresh step -->
```

### 1.4 Create todo list (Memento pattern)

```
- [ ] Create analysis log file
- [ ] Parse session / read commentary
- [ ] Write session overview to log file
- [ ] Detect iteration patterns (3.1)
- [ ] Write iteration findings to log file
- [ ] Detect user corrections (3.2)
- [ ] Write correction findings to log file
- [ ] Detect workflow deviations (3.3)
- [ ] Write deviation findings to log file
- [ ] Detect missing questions (3.4)
- [ ] Write missing question findings to log file
- [ ] Detect post-implementation fixes (3.5)
- [ ] Write post-impl findings to log file
- [ ] Extract skill names from session
- [ ] Write discovered skills to log file
- [ ] (expand: add "Analyze {skill} skill" + "Write {skill} findings to log" for each skill found)
- [ ] Refresh context: read FULL analysis log
- [ ] Apply counterfactual test to each potential fix
- [ ] Write final recommendations to log file
- [ ] Output final report
```

**Expansion rule**: When you discover skills `plan` and `implement` were used, add:
```
- [ ] Analyze plan skill: read SKILL.md, extract rules, compare to session
- [ ] Write plan skill findings to log file
- [ ] Analyze implement skill: read SKILL.md, extract rules, compare to session
- [ ] Write implement skill findings to log file
```

---

## Phase 2: Parse Session

### 2.1 Session file structure

Claude Code sessions are JSONL files with these record types:

| Type | Contains |
|------|----------|
| `user` | User messages, `message.content` field |
| `assistant` | Claude responses, tool calls, thinking |
| `system` | System events, commands, hooks |
| `file-history-snapshot` | File state tracking |

### 2.2 Extract key events

**Primary method** (requires jq):
```bash
# User messages
cat {session-file} | jq -r 'select(.type == "user") | .message.content' 2>/dev/null

# Tool calls
cat {session-file} | jq -r 'select(.type == "assistant") | .message.content | if type == "array" then .[] | select(.type == "tool_use") | .name else empty end' 2>/dev/null

# Skill invocations
grep -o '"skill":"[^"]*"' {session-file} | sort | uniq -c
```

**Fallback method** (if jq unavailable):
```bash
# User messages (basic extraction)
grep '"type":"user"' {session-file} | head -20

# Skill invocations
grep -oE '"skill":"[^"]+"' {session-file} | sort | uniq -c

# Tool calls
grep -oE '"type":"tool_use","name":"[^"]+"' {session-file} | sort | uniq -c
```

### 2.3 Build session overview

Extract and log:
- **Initial request**: First user message (the goal)
- **Workflow used**: Which skills invoked (`$spec`, `$plan`, `$implement`, etc.)
- **Workflow skipped**: Expected skills NOT invoked based on task complexity
- **Outcome**: Success, partial, or required rework
- **Session length**: Message count (count lines with `type`)

**For large session files (>10MB)**: Sample first 1000 and last 1000 lines rather than full read. Note "Sampled analysis" in log.

---

## Phase 3: Pattern Detection

Analyze the session for these patterns. Each pattern has evidence requirements and specific thresholds.

### 3.1 Iteration patterns (things that didn't work first time)

**Evidence required**: Same file edited multiple times, OR error → fix → retry sequence

**Detection threshold**: 3+ edits to same file OR 2+ error-fix cycles = notable iteration

Look for:
- TypeScript errors followed by fixes
- Test failures followed by code changes
- Lint errors followed by formatting changes
- Same function/file touched 3+ times

**Log format**:
```markdown
### Iteration: {description}
- Files affected: {list}
- Attempts: {count}
- Root cause: {why it didn't work first time}
- Potential skill gap: {what could have prevented this}
```

**Write findings to log file NOW, before proceeding to 3.2.**

### 3.2 User corrections ("no, I meant...")

**Evidence required**: User message containing correction language

Correction indicators:
- "no", "not what I meant", "actually", "instead", "I meant"
- "let's go back", "undo", "revert"
- "that's wrong", "incorrect"

**Log format**:
```markdown
### User Correction: {what was corrected}
- Original action: {what Claude did}
- User feedback: {correction text}
- Missing context: {what Claude should have asked/known}
```

**Write findings to log file NOW, before proceeding to 3.3.**

### 3.3 Workflow deviations

**Evidence required**: Expected workflow step skipped or out-of-order

Check for:
- Multi-phase skill invoked but phases skipped (compare to skill's documented phases)
- Skill with prerequisites invoked without those prerequisites
- Ordered steps executed out of order
- Verification/validation steps skipped

**How to detect**: Read skill's SKILL.md, extract phase list, compare to session sequence.

**Log format**:
```markdown
### Workflow Deviation: {what was skipped/reordered}
- Skill: {which skill's workflow}
- Expected flow: {phases from skill definition}
- Actual flow: {what happened in session}
- Impact: {did this cause issues later? YES/NO/UNCLEAR}
```

**Write findings to log file NOW, before proceeding to 3.4.**

### 3.4 Missing questions

**Evidence required**: Information discovered during implementation that should have been asked upfront

Look for:
- Design decisions made mid-implementation
- Assumptions that were later corrected
- "The user confirmed..." appearing late in session
- Post-implementation "actually, let's change..." patterns

**Log format**:
```markdown
### Missing Question: {what should have been asked}
- Discovered at: {phase where it came up}
- Impact: {rework required}
- Skill gap: {which skill should have asked this}
```

**Write findings to log file NOW, before proceeding to 3.5.**

### 3.5 Post-implementation fixes

**Evidence required**: Changes made AFTER "implementation complete" or PR creation

Look for:
- Commits/changes after PR URL appears
- Refactoring after "done" or "complete" messages
- Review findings that required code changes
- User requesting changes after seeing "finished"

**Log format**:
```markdown
### Post-Implementation Fix: {what was fixed}
- Original implementation: {what was done}
- Fix required: {what changed}
- Should have been caught by: {which phase/skill}
```

**Write findings to log file NOW, before proceeding to Phase 4.**

---

## Phase 4: Skill Comparison

### 4.1 Discover skills used in session

**Step 1**: Extract skill invocations from session:

```bash
# Find all Skill tool invocations
grep -o '"skill":"[^"]*"' {session-file} | sort | uniq -c

# Find slash command patterns in user messages
grep -oE '\$(spec|plan|implement|review|bugfix|[a-z-]+)' {session-file} | sort | uniq -c
```

**Step 2**: Locate skill files for each skill found.

For each skill name, search in:
1. `./skills/{skill-name}/SKILL.md` (primary location)
2. `./.claude/skills/{skill-name}/SKILL.md` (user-level skills)

```bash
# Find skill definition
find ./skills ./.claude/skills -name "SKILL.md" -path "*/{skill-name}/*" 2>/dev/null
```

**If no skills found**: Note "No explicit skill invocations detected. Analyzing session as ad-hoc workflow." and proceed to Phase 5.

**Step 3**: Log discovered skills:

```markdown
## Skills Used in Session

### {skill-name}
- **SKILL.md**: {path}
- **Invoked**: {count} times
```

**Write discovered skills to log file NOW, before proceeding to 4.2.**

### 4.2 Extract actionable rules from each skill

For each skill file, extract:

**Rule indicators** (look for these patterns):
- `must`, `should`, `never`, `always` → mandatory behaviors
- `## Phase N:` or `### Step N:` → workflow phases
- `questions:` or prompts asking user → required user prompts
- `| Condition | Action |` tables → decision rules
- `**CRITICAL**`, `**IMPORTANT**` → high-priority rules
- `- [ ]` todo templates → expected workflow steps
- `Acceptance:` or `Validation:` → verification requirements

**Extract and log**:
```markdown
### Skill: {name}
**File**: {path}

**Mandatory behaviors**:
- {rule with line number}

**Workflow phases**:
1. {phase name} - expected outputs: {list}

**Required questions** (when applicable):
- {question topic}

**Verification steps**:
- {what should be checked}
```

### 4.3 Compare documented vs actual

For each skill used in the session:

| Aspect | Documented | Actual | Gap? | Impact |
|--------|------------|--------|------|--------|
| Questions asked | {from skill} | {from session} | Y/N | {would have prevented X} |
| Phases followed | {from skill} | {from session} | Y/N | {would have caught Y} |
| Validations run | {from skill} | {from session} | Y/N | {would have avoided Z} |
| Outputs produced | {from skill} | {from session} | Y/N | {required later but missing} |

**Key comparison questions**:
1. Did the skill ask all documented questions? If not, did missing answers cause issues?
2. Were all phases executed in order? If skipped, did it matter?
3. Were validations run? If skipped, did bugs slip through?
4. Did outputs match documented format? If not, did downstream steps suffer?

### 4.4 Log skill gaps with impact

```markdown
### Skill Gap: {skill name}
- **Rule violated**: {what skill says to do, with line reference}
- **What happened**: {actual behavior in session}
- **Evidence**: {specific session content showing gap}
- **Impact**: {did this cause iteration/correction/rework? YES with detail / NO}
- **Counterfactual**: {if rule was followed, would outcome differ?}
- **Confidence**: HIGH | MEDIUM | LOW
```

**Only log gaps where**:
1. Evidence is clear (specific session content)
2. Impact is documented (caused measurable problem)
3. Counterfactual is plausible (fix would have helped)

**Write skill gap findings to log file after analyzing EACH skill separately.**

---

## Phase 5: Synthesize Recommendations

### 5.1 Refresh context (mandatory step)

**Read the FULL analysis log file NOW before any synthesis.**

**Why this step exists**: Findings from Phase 3 have decayed in context—they're far from current position. The log file contains ALL findings. Reading it:
- Moves ALL findings to context END (highest attention)
- Converts distributed information into dense recent context
- Restores details that would otherwise be missed in synthesis

**Action**: Read entire log file at `/tmp/session-analysis-{id}-{timestamp}.md`. Do NOT proceed to 5.2 until complete.

### 5.2 Counterfactual analysis (the signal filter)

For each potential issue, apply this 3-part test:

```
IF this skill change existed BEFORE the session:
  1. WOULD a specific iteration/correction/rework NOT have happened?
  2. CAN you name the exact moment it would have intervened?
  3. WOULD the change have been triggered (conditions met in session)?
```

**Scoring**:
| Score | Criteria | Confidence | Action |
|-------|----------|------------|--------|
| 3/3 | All YES | HIGH | Include in recommendations |
| 2/3 | Two YES | MEDIUM | Deferred section |
| 1/3 | One YES | LOW | Not Actionable section |
| 0/3 | None YES | NONE | Discard entirely |

**Example counterfactual**:
```
Issue: Plan skill should ask about time filtering
Test:
  1. WOULD iteration have been avoided? YES - 90-day filter added post-implementation
  2. CAN I name exact moment? YES - during "Files to modify" phase
  3. WOULD change have triggered? YES - requirement mentioned "recent refunds"
Score: 3/3 → HIGH confidence, include
```

### 5.3 Disqualifiers (even with 3/3 score)

| Disqualifier | Description | Example |
|--------------|-------------|---------|
| **Compliance failure** | Skill already documents this; LLM didn't follow | "Skill says ask about auth, Claude didn't" |
| **One-off context** | Unusual situation unlikely to recur | User typo caused confusion |
| **Scope creep** | Fix adds complexity disproportionate to benefit | Adding 50 lines to prevent 1-line fix |
| **Side effects** | Fix would break other documented behavior | Change conflicts with another rule |

If a potential fix hits ANY disqualifier, move to "Not Actionable" regardless of score.

### 5.4 Format recommendations

For each HIGH confidence issue (3/3 score, no disqualifiers):

```markdown
## Issue: {short title}

**Confidence**: HIGH
**Counterfactual score**: 3/3

### Evidence
{Quote or describe specific session content}

### What Happened
{Brief description of the problem}

### Root Cause
{Why the current skill didn't prevent this - be specific about what's missing}

### Counterfactual
- **Iteration avoided**: {which rework/correction would NOT have happened}
- **Intervention point**: {exact moment the fix would have triggered}
- **Trigger condition**: {why the fix would have applied to this session}

### Suggested Fix
**File**: {skill file path}
**Section**: {phase/section name}
**Line**: ~{approximate line number}

**Current behavior**:
{What the skill does now}

**Proposed behavior**:
{What the skill should do instead}

```diff
- {old text}
+ {new text}
```

### Risk Assessment
- **Side effects**: {could this break other flows? NONE/LOW/MEDIUM/HIGH}
- **Complexity added**: {minimal/moderate/significant}
- **Test approach**: {how to verify the fix works}
```

---

## Phase 6: Output

### 6.1 Final report structure

```markdown
# Session Analysis: {session id or description}

## Summary
- **Session outcome**: {success/partial/rework needed}
- **Workflow used**: {skills invoked}
- **Iterations observed**: {count of retry/fix cycles}
- **High-signal fixes**: {count} (3/3 counterfactual score)

## What Went Well
{List of things that worked correctly - be specific about which skill behaviors succeeded}

## Iteration Timeline
{Chronological list of corrections/retries observed}

1. {description}: {what was attempted}
2. {description}: {what went wrong}
3. {description}: {how it was fixed}

## High-Confidence Improvements

### Fix 1: {title}
{Full format from 5.4}

### Fix 2: {title}
...

## Deferred (2/3 Counterfactual Match)
{Issues that scored 2/3 - might help but not definitively causal}

| Issue | Missing Criterion | Why Deferred |
|-------|-------------------|--------------|
| {title} | {which of the 3 failed} | {brief explanation} |

## Not Actionable
{Issues that scored <2/3, or hit disqualifiers}

| Issue | Reason |
|-------|--------|
| {title} | {disqualifier or low score} |

---
Analysis log: {log file path}
```

### 6.2 Handle "no issues found" case

If no HIGH confidence issues are identified:

```markdown
# Session Analysis: {session id}

## Summary
- **Session outcome**: {success}
- **High-signal fixes**: 0

## Analysis
No high-confidence skill improvements identified. The session either:
1. Followed skill guidelines correctly, OR
2. Encountered issues not addressable through skill changes (user-specific, one-off context)

## What Went Well
{List specific skill behaviors that worked correctly}

## Observations (informational only)
{Any patterns noticed that don't meet the 3/3 counterfactual bar}
```

### 6.3 Return report

Output the final report. User can then decide which fixes to implement.

---

## Key Principles

| Principle | Rule |
|-----------|------|
| Counterfactual-driven | Every fix must pass the 3/3 test |
| Evidence-based | Quote or cite specific session content |
| Iteration-focused | Primary signal = things that required retry/correction |
| Skill-focused | Goal is improving skills, not critiquing user or session |
| Memento | Write findings to log as you go, refresh before synthesis |
| Write-then-proceed | Never continue to next detection without logging current findings |

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No input provided | Error: "Usage: $learn-from-session <session-id> OR <file-path> OR <description>" |
| Session file not found | Error: "Session file not found: {path}. Verify path or provide session ID." |
| No skills invoked | Note in log, analyze as ad-hoc workflow, focus on iteration patterns only |
| Very large session (>10MB) | Sample first/last 1000 lines, note "Sampled analysis" |
| No issues found | Output "no improvements" report with positive observations |
| jq not available | Use fallback grep-based extraction |
| Multiple session files match | Use most recently modified |
| Session from different plugin | Note mismatch, analyze available skill files only |

## Never Do

- Suggest changes without specific session evidence
- Include fixes that score <3/3 in main recommendations
- Skip the counterfactual test ("it seems like it would help")
- Skip reading the full analysis log before synthesis
- Critique user behavior (focus on skill gaps, not user mistakes)
- Suggest fixes that would break other documented behavior
- Recommend changes to skills that weren't used in the session
- Batch multiple detection sections before writing to log
