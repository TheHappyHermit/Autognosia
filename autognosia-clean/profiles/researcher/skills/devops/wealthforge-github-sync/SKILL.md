---
name: wealthforge-github-sync
description: Synchronize WealthForge AI codebase from Paperclip workspace to GitHub repositories, handling complex submodule structure
category: devops
---
# WealthForge AI GitHub Sync Skill

## Description
Skill for synchronizing the WealthForge AI codebase from the Paperclip workspace to GitHub repositories, handling the complex submodule structure where wealthforge-core and wealthforge-compliance are submodules of the Financial-Planning repository.

## When to Use
When you need to push local changes from the Paperclip workspace to GitHub repositories, particularly when:
- The Financial-Planning repository has submodules pointing to gitlinks with no remotes
- Local submodule directories have accumulated changes not tracked in GitHub
- You need to create or update GitHub repositories for submodule content
- You want to establish automatic synchronization via cron jobs
- Repositories already exist and you need to synchronize changes (alternative to the detailed setup procedure)

## Prerequisites
- GitHub CLI (`gh`) authenticated with appropriate permissions
- Access to create repositories under your GitHub account
- Local Paperclip workspace at `~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/`

## Step-by-Step Procedure

### 1. Prepare the Main Project Repository (wealthforge-ai)
```bash
# Navigate to the main project
cd ~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/6cb69cf1-ac3e-4a21-8f44-b1b526e16275/_default

# Check status
git status

# Add changes (be selective to avoid caching directories and build artifacts)
git add Financial-Planning/backend/app/planning/
git add app/api/crm_routes.py
git add app/schemas/crm_schemas.py
git add app/main.py
git add test_crm_import.py
git add tests/test_rebalancing_pipeline.py

# Commit and push
git commit -m "Descriptive commit message"
git push origin main
```

### 2. Create and Push Submodule Repositories

#### Create wealthforge-core repository:
```bash
# Create the repository on GitHub
gh repo create openclaw434/wealthforge-core --public --description "WealthForge Core Engine - Rust wag-engine + Python analytics, rebalancing, compliance"

# Navigate to submodule directory
cd ~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/49a3c6f6-3f90-4bca-b397-f0e08e9fef3c/_default/wealthforge-core

# Set remote
git remote add origin https://github.com/openclaw434/wealthforge-core.git

# Add source files (avoid __pycache__, target, .venv, node_modules)
git reset HEAD  # Clear index to start fresh
git add src/ wag-engine/ tests/ pyproject.toml .dockerignore .gitignore Dockerfile docker-compose.yml data/

# Remove any accidentally added cache directories
git rm -r --cached src/ai/__pycache__ src/analytics/__pycache__ src/data/__pycache__ src/rebalancing/__pycache__ 2>/dev/null || true

# Commit and push
git commit -m "Initial push of wealthforge-core submodule: wag-engine Rust package, Python analytics/rebalancing/compliance modules"
git push -u origin master
```

#### Create wealthforge-compliance repository:
```bash
# Create the repository on GitHub
gh repo create openclaw434/wealthforge-compliance --public --description "WealthForge Compliance Engine - AML, suitability, KYC, wire approval, concentration checks"

# Navigate to submodule directory
cd ~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/49a3c6f6-3f90-4bca-b397-f0e08e9fef3c/_default/wealthforge-compliance

# Set remote
git remote add origin https://github.com/openclaw434/wealthforge-compliance.git

# Add source files
git reset HEAD
git add src/ tests/ compliance/ .gitignore

# Remove cache directories
git rm -r --cached src/__pycache__/ compliance/__pycache__/ tests/__pycache__/ 2>/dev/null || true

# Commit and push
git commit -m "Update wealthforge-compliance submodule: compliance engine, API endpoints, tests"
git push -u origin master
```

### 3. Update Parent Repository Submodule Pointers
```bash
# Navigate to parent directory
cd ~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/49a3c6f6-3f90-4bca-b397-f0e08e9fef3c/_default

# Get latest commit hashes from submodules
cd wealthforge-core
CORE_COMMIT=$(git rev-parse HEAD)
cd ..
cd wealthforge-compliance
COMP_COMMIT=$(git rev-parse HEAD)
cd ..

# Create .gitmodules if it doesn't exist
if [ ! -f .gitmodules ]; then
cat > .gitmodules <<EOF
[submodule "wealthforge-core"]
    path = wealthforge-core
    url = https://github.com/openclaw434/wealthforge-core.git
    branch = master
[submodule "wealthforge-compliance"]
    path = wealthforge-compliance
    url = https://github.com/openclaw434/wealthforge-compliance.git
    branch = master
EOF
fi

# Update submodule pointers in index
git update-index --add --cacheinfo 160000 $CORE_COMMIT wealthforge-core
git update-index --add --cacheinfo 160000 $COMP_COMMIT wealthforge-compliance

# Verify the updates
git ls-files --stage | grep -E 'wealthforge-(core|compliance)'

# Commit and push parent repository
git add .gitmodules
git commit -m "Update submodules to latest commits: wealthforge-core=$CORE_COMMIT, wealthforge-compliance=$COMP_COMMIT"
git push origin main
```

### 4. Alternative: Update Existing Submodules (if repos already exist)
If the GitHub repositories already exist and you just need to update them:
```bash
# For wealthforge-core
cd ~/.paperclip/instances/default/projects/f9eed7bd-177d-4bac-8a1d-a7a5aaa02f7f/49a3c6f6-3f90-4bca-b397-f0e08e9fef3c/_default/wealthforge-core
git add -A
git rm -r --cached src/ai/__pycache__ src/analytics/__pycache__ src/data/__pycache__ src/rebalancing/__pycache__ 2>/dev/null || true
git commit -m "Update wealthforge-core with latest changes"
git push origin master

# Repeat for wealthforge-compliance
# Then update parent repository pointers as in step 3
```

## Common Issues and Solutions

### Issue: "src refspec main does not match any"
**Solution:** The repository might be on `master` branch instead of `main`. Check with `git branch` and push to the correct branch:
```bash
git push -u origin master  # if on master branch
```

### Issue: Submodule directory shows as modified but git submodule status shows no changes
**Solution:** The submodule pointer in the parent repository needs updating. Get the latest commit from the submodule and update the parent's index:
```bash
cd path/to/submodule
SUBMODULE_COMMIT=$(git rev-parse HEAD)
cd ..
git update-index --add --cacheinfo 160000 $SUBMODULE_COMMIT path/to/submodule
```

### Issue: Large data files causing push failures
**Solution:** Consider adding large files to `.gitignore` or using Git LFS. For SQLite databases in development, you might want to exclude them:
```bash
echo "data/*.db" >> .gitignore
git rm --cached data/wealthforge.db  # if already added
```

### Issue: Missing .gitmodules file
**Solution:** Create it manually as shown in step 3 above.

## Verification Steps
After pushing, verify that:
1. All three repositories exist on GitHub with correct content
2. The Financial-Planning repository shows the submodules as directories pointing to specific commits
3. Cloning the Financial-Planning repository with `--recurse-submodules` works correctly
4. The submodule directories contain the expected source code

## Automation
This process has been automated via a cron job (`github-sync-nightly`) that runs daily at 3:00 AM to keep the GitHub repositories synchronized with the Paperclip workspace.

## Related Skills
- `paperclip-integration`: For general Paperclip API interactions
- `application-cleanup-verification`: For verifying clean states before/after operations