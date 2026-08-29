# GitHub Authentication Reference

Complete authentication setup for GitHub operations. Supports both `gh` CLI and `git`+`curl` fallbacks.

## Detection Flow

```bash
# Check what's available
git --version
gh --version 2>/dev/null || echo "gh not installed"

# Check if already authenticated
gh auth status 2>/dev/null || echo "gh not authenticated"
git config --global credential.helper 2>/dev/null || echo "no git credential helper"
```

**Decision tree:**
1. If `gh auth status` shows authenticated → use `gh` for everything
2. If `gh` installed but not authenticated → use "gh auth" method
3. If `gh` not installed → use "git-only" method (no sudo needed)

---

## Method 1: Git-Only Authentication (No gh, No sudo)

Works on any machine with `git` installed. No root access needed.

### Option A: HTTPS with Personal Access Token (Recommended)

Most portable method — works everywhere, no SSH config needed.

**Step 1: Create a personal access token**
- Go to: **https://github.com/settings/tokens**
- Click "Generate new token (classic)"
- Name: "hermes-agent"
- Scopes: `repo`, `workflow`, `read:org`
- Expiration: 90 days default
- Copy token — won't be shown again

**Step 2: Configure git credential helper**

```bash
# Store credentials persistently (plaintext in ~/.git-credentials)
git config --global credential.helper store

# Test - git will prompt for credentials once
# Username: <github-username>
# Password: <paste-token-not-password>
git ls-remote https://github.com/<username>/<any-repo>.git
```

**Alternative: cache helper (expires from memory)**
```bash
git config --global credential.helper 'cache --timeout=28800'  # 8 hours
```

**Alternative: embed token in remote URL (per-repo)**
```bash
git remote set-url origin https://<username>:<token>@github.com/<owner>/<repo>.git
```

**Step 3: Configure git identity**
```bash
git config --global user.name "Their Name"
git config --global user.email "their-email@example.com"
```

**Step 4: Verify**
```bash
git ls-remote https://github.com/<username>/<any-repo>.git
git config --global user.name
git config --global user.email
```

### Option B: SSH Key Authentication

Good for users who prefer SSH or already have keys.

**Step 1: Check for existing keys**
```bash
ls -la ~/.ssh/id_*.pub 2>/dev/null || echo "No SSH keys found"
```

**Step 2: Generate key if needed**
```bash
ssh-keygen -t ed25519 -C "their-email@example.com" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```
Add public key at: **https://github.com/settings/keys**

**Step 3: Test connection**
```bash
ssh -T git@github.com
# Expected: "Hi <username>! You've successfully authenticated..."
```

**Step 4: Configure git to use SSH for GitHub**
```bash
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

**Step 5: Configure git identity**
```bash
git config --global user.name "Their Name"
git config --global user.email "their-email@example.com"
```

---

## Method 2: gh CLI Authentication

If `gh` is installed, handles both API access and git credentials.

### Interactive Browser Login (Desktop)
```bash
gh auth login
# Select: GitHub.com → HTTPS → Authenticate via browser
```

### Token-Based Login (Headless / SSH Servers)
```bash
echo "<THEIR_TOKEN>" | gh auth login --with-token
gh auth setup-git
```

### Verify
```bash
gh auth status
```

---

## Using GitHub API Without gh

When `gh` unavailable, use `curl` with personal access token.

### Setting the Token
```bash
# Option 1: Export as env var (preferred)
export GITHUB_TOKEN="<token>"
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Option 2: Extract from git credential store
grep "github.com" ~/.git-credentials 2>/dev/null | head -1 | sed 's|https://[^:]*:\([^@]*\)@.*|\1|'
```

### Helper: Detect Auth Method
```bash
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH_METHOD=gh
elif [ -n "$GITHUB_TOKEN" ]; then
  AUTH_METHOD=curl
elif _hermes_env="${HERMES_HOME:-$HOME/.hermes}/.env"; [ -f "$_hermes_env" ] && grep -q "^GITHUB_TOKEN=" "$_hermes_env"; then
  export GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" "$_hermes_env" | head -1 | cut -d= -f2 | tr -d '\n\r')
  AUTH_METHOD=curl
elif grep -q "github.com" ~/.git-credentials 2>/dev/null; then
  export GITHUB_TOKEN=$(grep "github.com" ~/.git-credentials | head -1 | sed 's|https://[^:]*:\([^@]*\)@.*|\1|')
  AUTH_METHOD=curl
else
  AUTH_METHOD=none
  echo "Need to set up authentication first"
fi
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `git push` asks for password | GitHub disabled password auth. Use PAT as password or switch to SSH |
| `remote: Permission to X denied` | Token lacks `repo` scope — regenerate with correct scopes |
| `fatal: Authentication failed` | Cached credentials stale — run `git credential reject` then re-authenticate |
| `ssh: connect to host github.com port 22: Connection refused` | Try SSH over HTTPS port: add `Host github.com` with `Port 443` and `Hostname ssh.github.com` to `~/.ssh/config` |
| Credentials not persisting | Check `git config --global credential.helper` — must be `store` or `cache` |
| Multiple GitHub accounts | Use SSH with different keys per host alias in `~/.ssh/config`, or per-repo credential URLs |
| `gh: command not found` + no sudo | Use git-only Method 1 above — no installation needed |