---
name: github-workflow
description: Complete GitHub workflow — authentication, repository management, PR lifecycle, code review, and issue tracking. Single umbrella skill replacing github-auth, github-repo-management, github-pr-workflow, github-code-review, and github-issues.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [GitHub, Git, PR, Issues, Code-Review, Releases, CI/CD]
    related_skills: []
---

# GitHub Workflow

Complete GitHub workflow covering authentication, repository management, PR lifecycle, code review, and issue tracking. This umbrella skill consolidates five previously separate skills into one class-level instruction set.

## Quick Navigation

| Section | Covers |
|---------|--------|
| [Authentication](#authentication) | HTTPS tokens, SSH keys, gh CLI login |
| [Repository Management](#repository-management) | Clone, create, fork, configure, releases, secrets, Actions |
| [Pull Request Workflow](#pull-request-workflow) | Branch, commit, open, CI monitoring, auto-fix, merge |
| [Code Review](#code-review) | Local diff review, PR review, inline comments, formal reviews |
| [Issue Tracking](#issue-tracking) | Create, triage, label, assign, comment, close, bulk ops |

---

## Authentication

See `references/authentication.md` for complete setup including HTTPS token, SSH key, and gh CLI methods. Both `gh` and `git`+`curl` fallbacks covered.

**Quick check:**
```bash
gh auth status 2>/dev/null || git config --global credential.helper
```

---

## Repository Management

See `references/repository-management.md` for:
- Cloning (HTTPS/SSH, shallow, specific branch)
- Creating repos (public/private, org, from template, from local dir)
- Forking and keeping forks in sync
- Repository settings (description, visibility, topics, branch protection)
- Secrets management (gh vs curl with encryption)
- Releases (create, list, upload assets)
- GitHub Actions workflows (list, run, rerun, view logs)

---

## Pull Request Workflow

See `references/pr-workflow.md` for:
1. Branch creation with conventional naming
2. Commits with Conventional Commits format
3. Push and PR creation (gh or curl)
4. CI status monitoring (checks, check-runs, polling)
5. Auto-fix loop for CI failures
6. Merge options (squash, rebase, merge) with auto-merge

---

## Code Review

See `references/code-review.md` for:
- **Local pre-push review**: `git diff main...HEAD`, security scans, structured feedback format
- **PR review on GitHub**: View diff, checkout locally, leave inline comments, submit formal review (APPROVE/REQUEST_CHANGES/COMMENT)
- **Review checklist**: Correctness, Security, Code Quality, Testing, Performance, Documentation
- **Pre-push workflow** and **end-to-end PR review workflow**

---

## Issue Tracking

See `references/issue-tracking.md` for:
- Viewing issues (list, filter by label/assignee, search)
- Creating issues (bug template, feature template)
- Managing labels, assignment, comments
- Closing/reopening with reasons
- Linking issues to PRs
- Triage workflow (needs-triage → categorize → label → assign)
- Bulk operations

---

## Templates & References

| File | Purpose |
|------|---------|
| `templates/bug-report.md` | Bug issue template |
| `templates/feature-request.md` | Feature request template |
| `templates/pr-body-bugfix.md` | PR body for bug fixes |
| `templates/pr-body-feature.md` | PR body for features |
| `references/conventional-commits.md` | Commit message format |
| `references/ci-troubleshooting.md` | CI failure diagnosis |
| `references/review-output-template.md` | Structured review feedback format |
| `references/github-api-cheatsheet.md` | API endpoint quick reference |