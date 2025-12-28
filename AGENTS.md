# Agent Instructions

## Workflow Overview

When you start a session, follow this pattern:

1. **Task Selection** - Find or create a task
2. **Implementation** - Make code changes
3. **Testing** - Run tests, create new ones if needed
4. **Commit & Push** - Land changes with proper git workflow

---

## 1. Task Management with Beads

### Find Work
```bash
bd ready              # Show unblocked tasks ready to work
bd show <id>          # View task details
```

### Create New Task
When user requests new work:
```bash
bd create --title="Short description" --type=task --priority=2
```

**Task Types**: task, bug, feature, epic, question, docs  
**Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers)

### Claim Task
```bash
bd update <id> --status=in_progress
```

---

## 2. Code Implementation

### Test Scope
**We only test API surfaces in:**
- `pkgs/api-ts` - All public API functions
- `pkgs/react` - All exported React components and hooks

### Code Style
- **Formatter**: Biome (100 char line width, 2 spaces, double quotes)
- **Types**: Full TypeScript with explicit types
- **Error Handling**: Return `Msg<T>` (none/some/err), log errors with tags. Never throw.
- **Imports**: Relative paths for local files
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces
- **Comments**: JSDocs for API surface functions only

---

## 3. Testing Protocol

### Run Tests
```bash
cd pkgs/api-ts && bun test                    # All api-ts tests
cd pkgs/api-ts && bun test <pattern>          # Specific test file(s)
cd pkgs/api-ts && bun test -t <pattern>       # Tests matching name

cd pkgs/react && bun test                     # All react tests (when applicable)
```

### When Tests Fail
1. Fix the code
2. Re-run tests
3. Repeat until green

### When Tests Don't Exist
If changing API surface with no test coverage:
1. **ASK USER**: "This API has no test coverage. Should I create tests?"
2. If YES: Write tests following existing patterns in `src/_tests/`
3. Run tests to verify

### Quality Gates
```bash
cd pkgs/api-ts && bunx biome check --write .  # Format and lint
cd pkgs/api-ts && bun run build               # Type check
cd pkgs/api-ts && bun test                    # Run all tests
```

---

## 4. Commit & Push Protocol

### Complete Task
```bash
bd close <id>                                 # Mark task done
```

### Commit Changes
```bash
git status                                    # Review changes
git add <files>                               # Stage code changes
git commit -m "Clear, descriptive message"    # Commit code
bd sync                                       # Sync beads metadata
git pull --rebase                             # Get latest changes
git push                                      # Push to remote
git status                                    # Verify "up to date with origin"
```

### Commit Message Style
- Be specific and descriptive
- Focus on what and why
- Examples:
  - ✅ "Add pagination support to thread queries"
  - ✅ "Fix vote count race condition in postgres adapter"
  - ❌ "Update code"
  - ❌ "Fix bug"

---

## 5. Session Completion Checklist

Before ending ANY session:

- [ ] All tests passing
- [ ] Code formatted (`biome check --write`)
- [ ] Types checked (`bun run build`)
- [ ] Task closed in beads (`bd close <id>`)
- [ ] Changes committed to git
- [ ] Beads synced (`bd sync`)
- [ ] Changes pushed to remote (`git push`)
- [ ] Git status shows "up to date with origin"

**CRITICAL**: Work is not complete until `git push` succeeds.

---

## Quick Reference

```bash
# Task workflow
bd ready → bd update <id> --status=in_progress → [work] → bd close <id>

# Test workflow (pkgs/api-ts)
bun test → [fix if needed] → bun test → [repeat until green]

# Commit workflow
git add . → git commit -m "..." → bd sync → git pull --rebase → git push
```
