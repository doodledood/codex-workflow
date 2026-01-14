---
name: sync-from-vibe-workflow
description: "Sync skills from claude-code-plugins vibe-workflow to this codex-workflow repo. Adapts Claude Code features to Codex equivalents. Use when vibe-workflow has updates to sync."
---

**User request**: $ARGUMENTS

Sync skills from the source vibe-workflow (in claude-code-plugins) to this codex-workflow repository, adapting Claude Code features to Codex equivalents.

## Phase 1: Setup & Discovery

### 1.1 Clone Source Repository

```bash
git clone https://github.com/doodledood/claude-code-plugins /tmp/claude-code-plugins
```

If already exists, pull latest:
```bash
cd /tmp/claude-code-plugins && git pull
```

### 1.2 List Skill Directories (names only)

**Source location**: `/tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/`
**Destination location**: `./skills/`

List directory names only (NOT file contents):
```bash
ls /tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/
ls ./skills/
```

### 1.3 Categorize Skills

Compare the two lists and categorize:

| Category | Criteria | Example |
|----------|----------|---------|
| **ADD** | Exists in source, not in destination | New skill from upstream |
| **MODIFY** | Exists in both locations | Existing skill to sync |
| **REMOVE** | Exists only in destination | Orphaned skill (ask user) |

**Special mappings** (treat as MODIFY despite name difference):
- Source `implement-inplace` → Destination `implement`
- Source `review-claude-md-adherence` → Destination `review-agents-md-adherence`

### 1.4 Create Todo List

Create structured todos based on categorization:

```
[ ] Clone/update source repository
[ ] List and categorize skills
```

**For each skill to ADD**:
```
[ ] Add {skill-name}: copy from source and adapt
```

**For each skill to MODIFY** (TWO todos per skill):
```
[ ] Read {skill-name}: compare source and destination
[ ] Update {skill-name}: apply changes if needed
```

**For skills to REMOVE** (after user confirmation):
```
[ ] Remove {skill-name}: delete from destination
```

**Finalization**:
```
[ ] Update README if skills added/removed
[ ] Commit and push changes
```

**Example todo list**:
```
[x] Clone/update source repository
[x] List and categorize skills
[ ] Read bugfix: compare source and destination
[ ] Update bugfix: apply changes if needed
[ ] Read plan: compare source and destination
[ ] Update plan: apply changes if needed
[ ] Add new-skill: copy from source and adapt
[ ] Update README if skills added/removed
[ ] Commit and push changes
```

## Phase 2: Adaptation Rules

When syncing skills, apply these transformations:

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

**review-claude-md-adherence**: Maps to `review-agents-md-adherence` - update all references from `CLAUDE.md` to `AGENTS.md`.

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

## Phase 3: Sync Process

### 3.1 For Skills to ADD

1. Mark "Add {skill-name}" todo as `in_progress`
2. Copy skill directory from source:
   ```bash
   cp -r /tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/<skill-name> ./skills/
   ```
3. Read the copied SKILL.md
4. Apply adaptation rules from Phase 2
5. Write adapted skill
6. Mark todo `completed`

### 3.2 For Skills to MODIFY (Two-Step Process)

**Step 1: Read and Compare**
1. Mark "Read {skill-name}" todo as `in_progress`
2. Read source: `/tmp/claude-code-plugins/claude-plugins/vibe-workflow/skills/{skill-name}/SKILL.md`
3. Read destination: `./skills/{skill-name}/SKILL.md`
4. Identify differences:
   - Content changes in source that should be synced
   - Codex-specific adaptations in destination to preserve
   - Already up-to-date sections (no change needed)
5. Note findings (what needs updating, what's already correct)
6. Mark todo `completed`

**Step 2: Update**
1. Mark "Update {skill-name}" todo as `in_progress`
2. If no changes needed → mark `completed`, move on
3. If changes needed:
   - Apply source changes while preserving Codex adaptations
   - Use Edit tool for targeted updates (not full rewrites)
4. Mark todo `completed`

### 3.3 For Skills to REMOVE

1. Ask user for confirmation before removing
2. If confirmed, delete skill directory
3. Note removal for README update

### 3.4 Preserve Codex-Specific Content

When updating, preserve:
- `AGENTS.md` references (don't revert to `CLAUDE.md`)
- `update_plan` (don't revert to `TodoWrite`)
- `$skill-name` invocation format
- Inline execution patterns (don't add subagent references)
- Expanded implementations (destination may have fuller versions than source's brief delegations)

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
git commit -m "Sync skills from vibe-workflow"
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
| Source skill uses subagents | Adapt to inline execution |
| Source has brief delegation, dest has full impl | Preserve destination's fuller implementation |
| Conflicting content | Prefer source logic, apply Codex adaptations |

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
