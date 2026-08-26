---
name: hermes-agent-update
category: devops
description: Systematic approach to update Hermes Agent to the newest version from the main branch
---

# Hermes Agent Update Skill

## Purpose
Systematic approach to update Hermes Agent to the newest version from the main branch.

## When to Use
- When user requests to update Hermes to latest version
- Periodically to ensure agent has latest features and security patches
- After hearing about new Hermes releases

## Prerequisites
- Hermes Agent installed in ~/.hermes/hermes-agent/
- Git available in PATH
- Pip available in PATH
- Write permissions to ~/.hermes/ directory

## Steps

### 1. Navigate to Hermes directory
```bash
cd ~/.hermes/hermes-agent
```

### 2. Stash any local changes (if any)
```bash
git stash
```
*Note: This preserves local changes in case they need to be reapplied later*

### 3. Fetch latest from main branch
```bash
git fetch origin main
```

### 4. Reset to latest main branch commit
```bash
git reset --hard origin/main
```

### 5. Pull to ensure local sync
```bash
git pull origin main
```

### 6. Install/update the package in editable mode
```bash
pip install -e .
```

### 7. Verify installation
```bash
hermes --version
```

### 8. Restore stashed changes (optional)
```bash
git stash pop
```
*Note: Only do this if you want to reapply local stashed changes*

## Verification
After update, the version output should show:
```
Hermes Agent vX.X.X (YYYY.MM.DD)
Project: $HOME/.hermes/hermes-agent
Python: X.X.X
OpenAI SDK: X.X.X
Up to date
```

## Pitfalls
- **Local changes lost**: If you have uncommitted changes and don't stash them, the reset will discard them. Always stash first if you have local modifications.
- **Permission issues**: Ensure you have write permissions to the Hermes directory.
- **Network issues**: If git fetch/pull fails, check internet connectivity and GitHub access.
- **Installation errors**: If pip install fails, check Python/pip versions and dependencies.

## Related Skills
- `hermes-agent`: Complete guide to using and extending Hermes Agent
- `hermes-config-yaml-repair`: For fixing YAML formatting issues after updates
- `hermes-fallback-provider-setup`: For configuring fallback providers

## Example Usage
User: "Please update hermes to the newest version"
Agent: Uses this skill to perform the update process and reports success/failure.