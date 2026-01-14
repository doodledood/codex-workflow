---
name: sync-from-vibe-workflow
description: "Sync skills from claude-code-plugins vibe-workflow to this codex-workflow repo. Adapts Claude Code features to Codex equivalents. Use when vibe-workflow has updates to sync."
---

**User request**: $ARGUMENTS

Sync skills from the source vibe-workflow (in claude-code-plugins) to this codex-workflow repository, adapting Claude Code features to Codex equivalents.

## Phase 1: Setup

### 1.1 Clone Source Repository

```bash
git clone https://github.com/doodledood/claude-code-plugins /tmp/claude-code-plugins
```

If already exists, pull latest:
```bash
cd /tmp/claude-code-plugins && git pull
```

### 1.2 Identify Skills

**Source location**: `/tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/`
**Destination location**: `./skills/`

List skills in both locations and identify:
- Skills to add (exist in source, not in destination)
- Skills to update (exist in both)
- Skills to remove (exist only in destination - verify with user first)

### 1.3 Create Todo List

```
[ ] Compare skill lists
[ ] Sync each skill (one todo per skill)
[ ] Update README if needed
[ ] Commit and push
```

## Phase 2: Adaptation Rules

When copying skills from vibe-workflow to codex-workflow, apply these transformations:

### 2.1 Tool Mappings

| Claude Code | Codex Equivalent |
|-------------|------------------|
| `TodoWrite` | `update_plan` |
| `Task(subagent)` | N/A - inline execution only |
| `Skill("vibe-workflow:skill-name")` | `$skill-name` |
| `AskUserQuestion` | Standard user prompts |

### 2.2 File Reference Changes

| Claude Code | Codex |
|-------------|-------|
| `CLAUDE.md` | `AGENTS.md` |
| `/claude-code-plugins/...` | Local paths |

### 2.3 Special Cases

**implement**: Since Codex has no subagents, `implement` here should match `implement-inplace` from source (not the orchestrator `implement` that uses subagents).

**review-claude-md-adherence**: Rename to `review-agents-md-adherence` and update all references from `CLAUDE.md` to `AGENTS.md`.

### 2.4 Skill Format

Source uses Claude Code skill format. Destination uses Codex format:

```yaml
---
name: skill-name
description: "Description under 500 chars. Include triggers."
---

Skill instructions...
```

**Limits**:
- `name`: max 100 characters
- `description`: max 500 characters

## Phase 3: Sync Each Skill

### 3.0 Adding New Skills

For skills that exist in source but not destination, **copy first, then adapt**:

```bash
# Copy the skill directory from cloned repo
cp -r /tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/<skill-name> ./skills/

# Then read and apply Codex adaptations to the copied file
```

This ensures you start with the full source content and only modify what's needed for Codex compatibility.

### 3.1 Sync Process

For each skill:

1. Mark todo `in_progress`
2. **New skill**: Copy from source first (see 3.0)
3. **Existing skill**: Read both source and destination
4. Apply adaptation rules from Phase 2
5. Write updated skill to destination
6. Mark todo `completed`

### 3.3 Diff Approach

Compare structure and content:
- Phase structure (Phase 1, 2, 3...)
- Edge cases table
- Principles section
- Tool invocations
- File references

### 3.4 Preserve Codex-Specific Content

If destination has Codex-specific adaptations not in source (e.g., `AGENTS.md` references already correct), preserve them.

## Phase 4: Finalize

### 4.1 Update README

If skills were added or removed, update `README.md`:
- Available Skills section
- Repository Structure (if directories changed)

### 4.2 Commit Changes

For each logical group of changes:
```bash
git add <files>
git commit -m "Sync <skill-name> from vibe-workflow"
```

Or batch commit:
```bash
git add skills/
git commit -m "Sync skills from vibe-workflow and add missing skills"
```

### 4.3 Push

```bash
git push -u origin <branch>
```

## Edge Cases

| Case | Action |
|------|--------|
| Skill exists only in destination | Ask user before removing |
| Skill renamed in source | Create new, ask about removing old |
| Major structural changes | Document changes, proceed with sync |
| Source skill uses subagents | Adapt to inline execution (see implement example) |
| Conflicting content | Prefer source, apply Codex adaptations |

## Verification Checklist

After sync, verify:
- [ ] All `Skill("vibe-workflow:...")` calls converted to `$skill-name`
- [ ] All `TodoWrite` references converted to `update_plan`
- [ ] All `CLAUDE.md` references converted to `AGENTS.md`
- [ ] No subagent Task() calls remain
- [ ] No AskUserQuestion tool references remain
- [ ] Description under 500 chars
- [ ] Name under 100 chars

## Source Reference

- **Source repo**: https://github.com/doodledood/claude-code-plugins
- **Source path**: `claude-plugins/vibe-workflow/skills/`
- **Note**: vibe-workflow is the upstream/source of truth for skill logic
