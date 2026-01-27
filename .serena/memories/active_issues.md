# Active Issues

## How to Use This Memory

This memory tracks active GitHub Issues for context sharing with Claude Code.
Update this file when:
- Starting work on a new Issue
- Completing an Issue
- Changing priority of the backlog

## Current Sprint

| Issue # | Title | Type | Priority | Status |
|---------|-------|------|----------|--------|
| - | (No active sprint items) | - | - | - |

## Backlog

| Issue # | Title | Type | Priority |
|---------|-------|------|----------|
| - | (Run `gh issue list` to populate) | - | - |

## Recently Completed

| Issue # | Title | Completed |
|---------|-------|-----------|
| - | - | - |

## Quick Commands

```bash
# List open issues
gh issue list

# View issue details
gh issue view <number>

# Create PR linking to issue
gh pr create --title "feat: ..." --body "Closes #<number>"
```

## Labels Reference

| Label | Meaning |
|-------|---------|
| `claude-ready` | Issue has enough context for Claude Code |
| `task` | Development task |
| `bug` | Bug report |
| `enhancement` | Feature request |
| `priority:high` | High priority |
