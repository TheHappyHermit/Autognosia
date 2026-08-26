# PII Scan Pattern Reference

Complete regex patterns for repository PII crawling. Use with the `repo-pii-audit` skill.

## Categories

### Name Patterns
```
\b<OperatorFirstName>\b
\b<OperatorFullName>\b
```

### Email Patterns
```
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

### Phone Patterns
```
\b\d{3}[-.]?\d{3}[-.]?\d{4}\b
```

### API Key Patterns
```
sk-[a-zA-Z0-9]{20,}
ghp_[a-zA-Z0-9]{36}
gho_[a-zA-Z0-9]{36}
github_pat_[a-zA-Z0-9_]{22,}
```

### Token Patterns
```
eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}
Bearer\s+[a-zA-Z0-9._-]{20,}
```

### Password Patterns
```
password\s*[:=]\s*\S+
passwd\s*[:=]\s*\S+
password_hash
```

### IP Address Patterns
```
\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b
```

### Username Patterns (case-insensitive)
```
<operator>434
<operator>
<operator>
<operator>.
```

### Telegram ID Patterns
```
\b<telegram-chat-id>\b
```

### GitHub Handle Patterns
```
<username>
[any github username in issue/pr references]
```

## False Positives to Ignore

| Pattern | Why False Positive |
|---------|-------------------|
| `127.0.0.1` | Localhost — documentation/example usage |
| `0.0.0.0` | Docker bind address — intentional |
| `172.22.0.x` | Docker internal network |
| `@` in `*.jpg` | Compressed image binary data |
| `<username>` | Template variable placeholder |
| Unix timestamps (10+ digits) | Not PII |
| `notifications@github.com` | Generic email, not personal |
| `billing@openai.com` | Generic vendor email |

## Severity Classification

### CRITICAL — Must Fix
- Real names (<operator>, <operator>ua)
- Real email addresses (personal, not vendor)
- Phone numbers
- API keys / tokens (sk-*, ghp_*, etc.)
- Real password hashes
- Telegram user IDs
- GitHub account handles in PR/email subjects

### MEDIUM — Should Fix
- Internal IPs (10.x.x.x, 172.16-31.x.x) → replace with localhost + setup comment
- Default Docker passwords → add security warning header
- Workspace names containing user reference → replace with generic placeholder
- Dashboard usernames → replace with `admin`
- Password hashes → clear to empty string

### LOW / No Action
- `127.0.0.1` (localhost) — safe for public docs
- `0.0.0.0` (bind all) — Docker configuration
- Template placeholders like `<username>`
- Timestamps in metadata files
- Vendor generic emails

## Scan Implementation

```python
import os
import re

pii_patterns = {
    'name': [r'\b<OperatorFirstName>\b', r'\b<OperatorFullName>\b'],
    'email': [r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'],
    'phone': [r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'],
    'api_keys': [r'sk-[a-zA-Z0-9]{20,}', r'ghp_[a-zA-Z0-9]{36}'],
    'passwords': [r'password_hash'],
    'ip_addresses': [r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'],
    'usernames': [r'<operator>434', r'<operator>'],
    'telegram_ids': [r'\b<telegram-chat-id>\b'],
}

for root, dirs, files in os.walk(repo):
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules']]
    for f in files:
        if f.endswith(('.bin', '.db', '.pyc')):
            continue  # skip binary
        with open(filepath) as fh:
            content = fh.read()
        for pattern_type, patterns in pii_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, content)
                if matches:
                    # record file, line, context
```
