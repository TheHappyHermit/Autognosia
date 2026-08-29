# Repository Management Reference

Create, clone, fork, configure, and manage GitHub repositories. `gh` first, then `git`+`curl` fallback.

## Prerequisites
- Authenticated with GitHub (see `references/authentication.md`)

## Setup
```bash
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH=*** else
  AUTH=***  if [ -z "$GITHUB_TOKEN" ]; then
    if _hermes_env="${HERMES_HOME:-$HOME/.hermes}/.env"; [ -f "$_hermes_env" ] && grep -q "^GITHUB_TOKEN=*** "$_hermes_env"; then
      GITHUB_TOKEN=*** "^GITHUB_TOKEN=*** "$_hermes_env" | head -1 | cut -d= -f2 | tr -d '\n\r')
    elif grep -q "github.com" ~/.git-credentials 2>/dev/null; then
      GITHUB_TOKEN=*** "github.com" ~/.git-credentials 2>/dev/null | head -1 | sed 's|https://[^:]*:\([^@]*\)@.*|\1|')
    fi
  fi
fi

# Get GitHub username
if [ "$AUTH" = "gh" ]; then
  GH_USER=*** else
  GH_USER=*** -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")
fi
```

If inside a repo:
```bash
REMOTE_URL=*** -E 's|.*github\.com[:/]||; s|\.git$||')
OWNER=*** | cut -d/ -f1)
REPO=*** | cut -d/ -f2)
```

---

## 1. Cloning Repositories

Pure `git` — identical either way:

```bash
# HTTPS (with credential helper or token-embedded URL)
git clone https://github.com/owner/repo-name.git

# Into specific directory
git clone https://github.com/owner/repo-name.git ./my-local-dir

# Shallow clone (faster for large repos)
git clone --depth 1 https://github.com/owner/repo-name.git

# Specific branch
git clone --branch develop https://github.com/owner/repo-name.git

# SSH (if configured)
git clone git@github.com:owner/repo-name.git
```

**With gh (shorthand):**
```bash
gh repo clone owner/repo-name
gh repo clone owner/repo-name -- --depth 1
```

---

## 2. Creating Repositories

**With gh:**
```bash
# Public repo + clone
gh repo create my-new-project --public --clone

# Private with description/license
gh repo create my-new-project --private --description "A useful tool" --license MIT --clone

# Under organization
gh repo create my-org/my-new-project --public --clone

# From existing local directory
cd /path/to/existing/project
gh repo create my-project --source . --public --push
```

**With git + curl:**
```bash
# Create remote repo via API
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user/repos \
  -d '{"name": "my-new-project", "description": "A useful tool", "private": false, "auto_init": true, "license_template": "mit"}'

# Clone it
git clone https://github.com/$GH_USER/my-new-project.git
cd my-new-project

# -- OR -- push existing local directory
cd /path/to/existing/project
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/$GH_USER/my-new-project.git
git push -u origin main
```

**Under organization:**
```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/my-org/repos \
  -d '{"name": "my-new-project", "private": false}'
```

### From a Template
```bash
# gh
gh repo create my-new-app --template owner/template-repo --public --clone

# curl
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/template-repo/generate \
  -d '{"owner": "'"$GH_USER"'", "name": "my-new-app", "private": false}'
```

---

## 3. Forking Repositories

**With gh:**
```bash
gh repo fork owner/repo-name --clone
```

**With git + curl:**
```bash
# Create fork via API
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo-name/forks

# Wait, then clone
sleep 3
git clone https://github.com/$GH_USER/repo-name.git
cd repo-name

# Add upstream remote
git remote add upstream https://github.com/owner/repo-name.git
```

### Keeping a Fork in Sync
```bash
# Pure git
git fetch upstream && git checkout main && git merge upstream/main && git push origin main

# gh shortcut
gh repo sync $GH_USER/repo-name
```

---

## 4. Repository Information

**With gh:**
```bash
gh repo view owner/repo-name
gh repo list --limit 20
gh search repos "machine learning" --language python --sort stars
```

**With curl:**
```bash
# View details
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO | python3 -c "
import sys, json
r = json.load(sys.stdin)
print(f'Name: {r[\"full_name\"]}')
print(f'Description: {r[\"description\"]}')
print(f'Stars: {r[\"stargazers_count\"]}  Forks: {r[\"forks_count\"]}')
print(f'Default branch: {r[\"default_branch\"]}')
print(f'Language: {r[\"language\"]}')
"

# List your repos
curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/user/repos?per_page=20&sort=updated" | python3 -c "
import sys, json
for r in json.load(sys.stdin):
    vis = 'private' if r['private'] else 'public'
    print(f'  {r[\"full_name\"]:40}  {vis:8}  {r.get(\"language\", \"\"):10}  ★{r[\"stargazers_count\"]}')
"

# Search repos
curl -s "https://api.github.com/search/repositories?q=machine+learning+language:python&sort=stars&per_page=10" | python3 -c "
import sys, json
for r in json.load(sys.stdin)['items']:
    print(f'  {r[\"full_name\"]:40}  ★{r[\"stargazers_count\"]:6}  {r[\"description\"][:60] if r[\"description\"] else \"\"}')
"
```

---

## 5. Repository Settings

**With gh:**
```bash
gh repo edit --description "Updated description" --visibility public
gh repo edit --enable-wiki=false --enable-issues=true
gh repo edit --default-branch main
gh repo edit --add-topic "machine-learning,python"
gh repo edit --enable-auto-merge
```

**With curl:**
```bash
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO \
  -d '{"description": "Updated description", "has_wiki": false, "has_issues": true, "allow_auto_merge": true}'

# Update topics
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.mercy-preview+json" \
  https://api.github.com/repos/$OWNER/$REPO/topics \
  -d '{"names": ["machine-learning", "python", "automation"]}'
```

---

## 6. Branch Protection

```bash
# View current protection
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/branches/main/protection

# Set up branch protection
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/branches/main/protection \
  -d '{
    "required_status_checks": {"strict": true, "contexts": ["ci/test", "ci/lint"]},
    "enforce_admins": false,
    "required_pull_request_reviews": {"required_approving_review_count": 1},
    "restrictions": null
  }'
```

---

## 7. Secrets Management (GitHub Actions)

**With gh (dramatically simpler):**
```bash
gh secret set API_KEY --body "your-secret-value"
gh secret set SSH_KEY < ~/.ssh/id_rsa
gh secret list
gh secret delete API_KEY
```

**With curl (requires PyNaCl encryption):**
```bash
# Get repo's public key
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/secrets/public-key

# Encrypt and set (Python with PyNaCl)
python3 -c "
from base64 import b64encode
from nacl import encoding, public
import json, sys
key_id = '<key_id_from_above>'
public_key = '<base64_key_from_above>'
sealed = public.SealedBox(public.PublicKey(public_key.encode('utf-8'), encoding.Base64Encoder)).encrypt('your-secret-value'.encode('utf-8'))
print(json.dumps({'encrypted_value': b64encode(sealed).decode('utf-8'), 'key_id': key_id}))
"

# PUT encrypted secret
curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/secrets/API_KEY -d '<output from python>'

# List secrets
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/secrets | python3 -c "
import sys, json
for s in json.load(sys.stdin)['secrets']:
    print(f'  {s[\"name\"]:30}  updated: {s[\"updated_at\"]}')
"
```

---

## 8. Releases

**With gh:**
```bash
gh release create v1.0.0 --title "v1.0.0" --generate-notes
gh release create v2.0.0-rc1 --draft --prerelease --generate-notes
gh release create v1.0.0 ./dist/binary --title "v1.0.0" --notes "Release notes"
gh release list
gh release download v1.0.0 --dir ./downloads
```

**With curl:**
```bash
# Create release
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/releases \
  -d '{"tag_name": "v1.0.0", "name": "v1.0.0", "body": "## Changelog\n- Feature A\n- Bug fix B", "draft": false, "prerelease": false, "generate_release_notes": true}'

# List releases
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/releases | python3 -c "
import sys, json
for r in json.load(sys.stdin):
    tag = r.get('tag_name', 'no tag')
    print(f'  {tag:15}  {r[\"name\"]:30}  {\"draft\" if r[\"draft\"] else \"published\"}')
"

# Upload asset
RELEASE_ID=<id_from_create_response>
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  "https://uploads.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID/assets?name=binary-amd64" \
  --data-binary @./dist/binary-amd64
```

---

## 9. GitHub Actions Workflows

**With gh:**
```bash
gh workflow list
gh run list --limit 10
gh run view <RUN_ID>
gh run view <RUN_ID> --log-failed
gh run rerun <RUN_ID>
gh run rerun <RUN_ID> --failed
gh workflow run ci.yml --ref main
gh workflow run deploy.yml -f environment=staging
```

**With curl:**
```bash
# List workflows
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/workflows | python3 -c "
import sys, json
for w in json.load(sys.stdin)['workflows']:
    print(f'  {w[\"id\"]:10}  {w[\"name\"]:30}  {w[\"state\"]}')
"

# List recent runs
curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$OWNER/$REPO/actions/runs?per_page=10" | python3 -c "
import sys, json
for r in json.load(sys.stdin)['workflow_runs']:
    print(f'  Run {r[\"id\"]}  {r[\"name\"]:30}  {r[\"conclusion\"] or r[\"status\"]}')
"

# Download failed run logs
RUN_ID=<run_id>
curl -s -L -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/logs -o /tmp/ci-logs.zip
cd /tmp && unzip -o ci-logs.zip -d ci-logs

# Re-run workflow
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/rerun

# Re-run failed jobs only
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/rerun-failed-jobs

# Trigger workflow_dispatch
WORKFLOW_ID=<workflow_id_or_filename>
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/dispatches -d '{"ref": "main", "inputs": {"environment": "staging"}}'
```

---

## 10. Gists

**With gh:**
```bash
gh gist create script.py --public --desc "Useful script"
gh gist list
```

**With curl:**
```bash
# Create gist
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/gists -d '{"description": "Useful script", "public": true, "files": {"script.py": {"content": "print(\"hello\")"}}}'

# List gists
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/gists | python3 -c "
import sys, json
for g in json.load(sys.stdin):
    files = ', '.join(g['files'].keys())
    print(f'  {g[\"id\"]}  {g[\"description\"] or \"(no desc)\":40}  {files}')
"
```

---

## Quick Reference Table

| Action | gh | git + curl |
|--------|-----|-----------|
| Clone | `gh repo clone o/r` | `git clone https://github.com/o/r.git` |
| Create repo | `gh repo create name --public` | `curl POST /user/repos` |
| Fork | `gh repo fork o/r --clone` | `curl POST /repos/o/r/forks` + `git clone` |
| Repo info | `gh repo view o/r` | `curl GET /repos/o/r` |
| Edit settings | `gh repo edit --...` | `curl PATCH /repos/o/r` |
| Create release | `gh release create v1.0` | `curl POST /repos/o/r/releases` |
| List workflows | `gh workflow list` | `curl GET /repos/o/r/actions/workflows` |
| Rerun CI | `gh run rerun ID` | `curl POST /repos/o/r/actions/runs/ID/rerun` |
| Set secret | `gh secret set KEY` | `curl PUT /repos/o/r/actions/secrets/KEY` (+ encryption) |