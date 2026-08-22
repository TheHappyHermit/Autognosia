---
name: hermes-config-yaml-repair
description: Skill for diagnosing and fixing YAML formatting issues in Hermes Agent configuration file, particularly MCP server sections
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Hermes Config YAML Repair Skill

This skill provides guidance for diagnosing and fixing YAML formatting issues in the Hermes Agent configuration file (`~/.hermes/config.yaml`), with specific focus on MCP server configuration sections.

## Overview
Hermes Agent uses a YAML configuration file at `~/.hermes/config.yaml` to define MCP servers, API keys, and other settings. YAML is sensitive to indentation and structure, and misconfigurations can cause persistent warnings or prevent Hermes from loading properly.

## When to Use This Skill
Use this skill when you see warnings like:
- "Failed to load config: while scanning a simple key"
- "could not find expected ':'"
- YAML parsing errors when starting Hermes
- MCP tools not appearing despite configuration
- Duplicate sections in the config file

## Common Issues & Symptoms

### 0. Provider/API Key Mismatch (Most Common Recent Issue)
**Symptoms**: 401 Unauthorized errors when Hermes tries to connect to the model provider, cron jobs failing with authentication errors, or model calls returning unauthorized responses.
**Cause**: Mismatch between the specified provider and the API key environment variable being used. Common patterns:
- Using `provider: lmstudio` but specifying `api_key_env: OPENROUTER_API_KEY` (LMStudio runs locally and doesn't need an API key)
- Using `provider: openrouter` but not setting the OPENROUTER_API_KEY environment variable
- Specifying an API key for a provider that doesn't require one, or vice versa

**Examples of problematic configurations**:
```yaml
# PROBLEMATIC: LMStudio provider with OpenRouter API key (causes 401 errors)
model:
  default: qwen/qwen3.6-35b-a3b
  provider: lmstudio
  base_url: http://10.1.1.151:1234/v1
  api_key_env: OPENROUTER_API_KEY  # <-- MISMATCH! LMStudio doesn't use this

# PROBLEMATIC: OpenRouter provider but missing API key in environment
model:
  default: openrouter/anthropic/claude-sonnet-4
  provider: openrouter
  base_url: https://openrouter.ai/api/v1
  api_key_env: OPENROUTER_API_KEY  # <-- Will fail if OPENROUTER_API_KEY not set

# PROBLEMATIC: Wrong base_url for provider
model:
  provider: lmstudio
  base_url: https://api.openai.com/v1  # <-- Wrong! LMStudio uses local URL
```

**Correct Configurations**:
```yaml
# CORRECT: LMStudio local setup (no API key needed)
model:
  default: qwen/qwen3.6-35b-a3b
  provider: lmstudio
  base_url: http://10.1.1.151:1234/v1
  # No api_key_env needed for LMStudio

# CORRECT: OpenRouter setup (requires API key)
model:
  default: openrouter/anthropic/claude-sonnet-4
  provider: openrouter
  base_url: https://openrouter.ai/api/v1
  api_key_env: OPENROUTER_API_KEY  # <-- Correct pairing

# CORRECT: Mistral direct API
model:
  provider: mistral
  base_url: https://api.mistral.ai/v1
  api_key_env: MISTRAL_API_KEY
```

**Diagnostic Steps**:
1. Check the error message - 401 Unauthorized usually indicates authentication/provider mismatch
2. Look at your `model:` section in `~/.hermes/config.yaml`
3. Verify the provider matches the base_url and api_key_env:
   - `lmstudio`: typically local URL like `http://localhost:1234/v1`, no API key needed
   - `openrouter`: `https://openrouter.ai/api/v1`, requires `OPENROUTER_API_KEY`
   - `mistral`: `https://api.mistral.ai/v1`, requires `MISTRAL_API_KEY`
   - `anthropic`: `https://api.anthropic.com`, requires `ANTHROPIC_API_KEY`
4. Check if the specified environment variable is actually set: `echo $OPENROUTER_API_KEY`

### 1. Indentation Mismatch
**Symptoms**: Warnings about missing colons or unable to parse simple keys
**Cause**: Mixing tabs and spaces, or inconsistent indentation levels
**Example**: 
```yaml
mcp_servers:
  n8n-mcp:
    url: "https://example.com"   # 4 spaces - CORRECT
  home-assistant:
   url: "http://example.com"     # 3 spaces - INCORRECT
```

### 2. Duplicate Sections\n**Symptoms**: Configuration seems ignored, or tools from only one section work; YAML parsing errors about mapping values\n**Cause**: Accidentally defining the same section multiple times, or duplicating entire blocks\n**Example**: Multiple `mcp_servers:` sections or duplicated server blocks throughout the file\n**Specific patterns we encountered**:\n- Having the same `mcp_servers:` configuration repeated 3-4 times in the file, each with slight variations\n- Finding entire MCP server configurations appearing on single lines (e.g., \"mcp_servers: n8n-mcp: url: \"...\" headers: {...} timeout: 180\" all on one line)\n- Mixed duplication where some sections are properly formatted while others are malformed### 3. Missing Colons
**Symptoms**: "could not find expected ':'" errors
**Cause**: Forgetting the colon after a key
**Example**:
```yaml
mcp_servers:
  n8n-mcp
    url: "https://example.com"   # Missing colon after n8n-mcp
```

### 4. Incorrect Structure Under Keys
**Symptops**: Values not being recognized
**Cause**: Putting values at wrong indentation level
**Example**:
```yaml
mcp_servers:
  n8n-mcp:          # This key expects a mapping
  url: "https://..." # This is at same level as n8n-mcp, not under it
```

### 5. Mixed Content Types
**Symptoms**: "mapping values are not allowed here" errors
**Cause**: Having inline key-value pairs after a mapping key, or mixing block and flow styles incorrectly
**Example from our experience**:
```yaml
mcp_servers:  n8n-mcp:    url: "https://example.com"    headers:      Authorization: "Bearer token"    timeout: 180    connect_timeout: 60  home-assistant:    url: "http://example.com"    headers:      Authorization: "Bearer token"    timeout: 30    connect_timeout: 10
```
(Notice how everything is on one line after the mcp_servers key - this is invalid YAML)

## Diagnostic Steps

### Step 1: Backup Your Config
```bash
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.backup
```

### Step 2: Check for Obvious Issues Visually
Look for:
- Sections that look duplicated
- Entire blocks repeated on single lines (like "mcp_servers: n8n-mcp: url: ..." all on one line)
- Inconsistent indentation (mix of 2 and 4 spaces)
- Missing colons after keys
- Values not properly indented under their keys

### Step 3: Use Python to Validate YAML
```bash
# Install PyYAML if needed
pip3 install --break-system-packages pyyaml

# Validate the YAML
python3 -c "
import yaml
try:
    with open('~/.hermes/config.yaml', 'r') as f:
        data = yaml.safe_load(f)
    print('✅ YAML is valid!')
    if data.get('mcp_servers'):
        print(f'✅ Found {len(data[\\\"mcp_servers\\\"])} MCP servers configured')
        for name, config in data['mcp_servers'].items():
            print(f'  - {name}: {config.get(\\\"url\\\", \\\"No URL\\\")}')
except Exception as e:
    print(f'❌ YAML Error: {e}')
    print(f'   Error type: {type(e).__name__}')
"
```

### Step 4: Use yamllint (if available)
```bash
# Install yamllint
pip3 install --break-system-packages yamllint

# Check for issues
yamllint ~/.hermes/config.yaml
```

## Repair Procedure

### For MCP Server Section Issues (Most Common)

#### Case 1: Duplicate home-assistant Section
**Problem**: You see two `home-assistant:` entries under `mcp_servers:`

**Solution**:
1. Find the MCP Servers Configuration section (look for the comment)
2. Identify which home-assistant section is the duplicate (usually the one NOT properly indented under mcp_servers)
3. Remove the entire duplicate section including its url, headers, timeout, and connect_timeout lines
4. Ensure only one home-assistant section exists, properly indented under mcp_servers

#### Case 2: Incorrect Indentation
**Problem**: Mixing 2-space and 4-space indentation

**YAML Indentation Rules for MCP Servers**:
- `mcp_servers:`: 0 spaces (root level)
- `  n8n-mcp:`: 2 spaces (under mcp_servers)
- `    url:`: 4 spaces (under n8n-mcp)
- `    headers:`: 4 spaces (under n8n-mcp)
- `      Authorization:`: 6 spaces (under headers)
- (Repeat same pattern for home-assistant)

**Correct Structure**:
```yaml
mcp_servers:
  n8n-mcp:
    url: "https://n8n.wineandgecko.com/mcp-server/http"
    headers:
      Authorization: "Bearer YOUR_TOKEN_HERE"
    timeout: 180
    connect_timeout: 60

  home-assistant:
    url: "http://10.1.1.13:8123/api/mcp"
    headers:
      Authorization: "Bearer YOUR_HA_TOKEN_HERE"
    timeout: 30
    connect_timeout: 10
```

#

#### Case 4: Entire Configuration on One Line (Our Specific Experience)
**Problem**: The entire mcp_servers configuration was on a single line after the key, causing "mapping values are not allowed" errors
**Example of what we fixed**:
```yaml
# BEFORE (broken):
mcp_servers:  n8n-mcp:    url: "https://n8n.wineandgecko.com/mcp-server/http"    headers:      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"    timeout: 180    connect_timeout: 60  home-assistant:    url: "http://10.1.1.13:8123/api/mcp"    headers:      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4ZmEyODk2NjY5Y2Y0NWM0YTg2ZWUyYmFlYTg2ZDA4NiIsImlhdCI6MTc3NTI1NzU2MSwiZXhwIjoyMDkwNjE3NTYxfQ.xqkJssmUdaGkfh3PHIQw6ALxX-MI1DT9Uqouch1V_TM"    timeout: 30    connect_timeout: 10
```
(Notice how everything is on one line after the mcp_servers key - this is invalid YAML)

**Solution**:
1. Replace the entire malformed line with properly indented YAML structure
2. Ensure each level is indented correctly (2 spaces for server names, 4 for properties under servers, 6 for headers properties)
3. Put each server configuration on its own properly indented block

**Correct Structure** (what we ended up with):
```yaml
# AFTER (fixed):
mcp_servers:
  n8n-mcp:
    url: "https://n8n.wineandgecko.com/mcp-server/http"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"
    timeout: 180
    connect_timeout: 60

  home-assistant:
    url: "http://10.1.1.13:8123/api/mcp"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4ZmEyODk2NjY5Y2Y0NWM0YTg2ZWUyYmFlYTg2ZDA4NiIsImlhdCI6MTc3NTI1NzU2MSwiZXhwIjoyMDkwNjE3NTYxfQ.xqkJssmUdaGkfh3PHIQw6ALxX-MI1DT9Uqouch1V_TM"
    timeout: 30
    connect_timeout: 10
```### Case 3: Missing Section Header
**Problem**: The `mcp_servers:` key is missing or malformed

**Solution**:
1. Find the "# MCP Servers Configuration" comment
2. Ensure the next line is exactly `mcp_servers:` with no leading spaces
3. Then add the properly formatted sections below it

#### Case 4: Entire Configuration on One Line (Our Specific Experience)
**Problem**: The entire mcp_servers configuration was on a single line after the key, causing "mapping values are not allowed" errors
**Example of what we fixed**:
```yaml
# BEFORE (broken):
mcp_servers:  n8n-mcp:    url: "https://n8n.wineandgecko.com/mcp-server/http"    headers:      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"    timeout: 180    connect_timeout: 60  home-assistant:    url: "http://10.1.1.13:8123/api/mcp"    headers:      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4ZmEyODk2NjY5Y2Y0NWM0YTg2ZWUyYmFlYTg2ZDA4NiIsImlhdCI6MTc3NTI1NzU2MSwiZXhwIjoyMDkwNjE3NTYxfQ.xqkJssmUdaGkfh3PHIQw6ALxX-MI1DT9Uqouch1V_TM"    timeout: 30    connect_timeout: 10
```

**Solution**:
1. Replace the entire malformed line with properly indented YAML structure
2. Ensure each level is indented correctly (2 spaces for server names, 4 for properties under servers, 6 for headers properties)
3. Put each server configuration on its own properly indented block

**Correct Structure** (what we ended up with):
```yaml
# AFTER (fixed):
mcp_servers:
  n8n-mcp:
    url: "https://n8n.wineandgecko.com/mcp-server/http"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"
    timeout: 180
    connect_timeout: 60

  home-assistant:
    url: "http://10.1.1.13:8123/api/mcp"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4ZmEyODk2NjY5Y2Y0NWM0YTg2ZWUyYmFlYTg2ZDA4NiIsImlhdCI6MTc3NTI1NzU2MSwiZXhwIjoyMDkwNjE3NTYxfQ.xqkJssmUdaGkfh3PHIQw6ALxX-MI1DT9Uqouch1V_TM"
    timeout: 30
    connect_timeout: 10
```

### Step-by-Step Repair Example

Here's how I fixed the severely malformed config we encountered:

```bash
# 1. Backup first
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.backup.$(date +%s)

# 2. Identify the problematic section (we found repeated blocks and single-line configurations)

# 3. Replace the entire MCP servers section with a clean version

# Using a heredoc to write the correct section:
cat > /tmp/mcp_fix.yaml << 'EOF'
# MCP Servers Configuration
mcp_servers:
  n8n-mcp:
    url: "https://n8n.wineandgecko.com/mcp-server/http"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"
    timeout: 180
    connect_timeout: 60

  home-assistant:
    url: "http://10.1.1.13:8123/api/mcp"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4ZmEyODk2NjY5Y2Y0NWM0YTg2ZWUyYmFlYTg2ZDA4NiIsImlhdCI6MTc3NTI1NzU2MSwiZXhwIjoyMDkwNjE3NTYxfQ.xqkJssmUdaGkfh3PHIQw6ALxX-MI1DT9Uqouch1V_TM"
    timeout: 30
    connect_timeout: 10
EOF

# 4. Replace the section in the actual config
# Find the lines between "# MCP Servers Configuration" and the next major section
# Replace that entire block with the content from /tmp/mcp_fix.yaml

# Alternative: For our specific case, we directly edited the malformed line
# We found the problematic line and replaced it with properly formatted YAML
```

### Verification After Repair
```bash
# Check that warnings are gone
# (You should no longer see YAML parsing warnings in Hermes output)

# Verify MCP tools are available
mcp_n8n_mcp_list_tools
mcp_home_assistant_list_tools

# Test a simple operation
mcp_home_assistant_HassGetStates --domain "light"  # Should return your lights
```

## Prevention Tips

### 1. Use Consistent Indentation
- Always use spaces (never tabs) in YAML
- Be consistent: either 2 spaces per level or 4 spaces per level
- For Hermes config, the standard appears to be:
  - Level 1 (under mcp_servers): 2 spaces
  - Level 2 (under server name): 4 spaces  
  - Level 3 (under headers): 6 spaces

### 2. Make Small, Tested Changes
- Edit one section at a time
- Validate after each change using the Python YAML check
- Test that Hermes still works and MCP tools are available

### 3. Use Comments Wisely
- YAML comments start with `#`
- Keep the "# MCP Servers Configuration" comment to help locate the section
- Don't put comments on the same line as YAML keys/values (can cause issues)

### 4. Watch for Copy-Paste Issues
- When copying configuration examples, check that indentation is preserved
- Remove any stray characters that might have been copied
- Ensure quotes are straight quotes (" ") not curly quotes (“ ”)

### 5. Regular Validation
- Periodically run the Python YAML validation check
- Especially after making manual edits to the config
- Consider adding this to your cron job for monthly checks

## Quick Reference Commands

### Validate YAML
```bash
python3 -c "import yaml; yaml.safe_load(open('~/.hermes/config.yaml')); print('Valid YAML')"
```

### List MCP Tools (to verify config is working)
```bash
# List all n8n MCP tools
mcp_n8n_mcp_list_tools

# List all Home Assistant MCP tools  
mcp_home_assistant_list_tools
```

### Test MCP Connections
```bash
# Test n8n connection
mcp_n8n_mcp_get_sdk_reference --section "guidelines" | head -5

# Test Home Assistant connection
mcp_home_assistant_HassGetStates --domain "switch" | head -5
```

### Show Current MCP Configuration (safely)
```bash
# Show just the MCP servers section (hiding sensitive data)
sed -n '/# MCP Servers Configuration/,/^[[^ ]]/p' ~/.hermes/config.yaml | \
    grep -v "Authorization" | \
    sed 's/Authorization: .*/Authorization: "Bearer [REDACTED]"/'
```

## Advanced: Programmatic Repair

For repetitive issues, you can create a repair script:

```bash
#!/bin/bash
# hermes-config-repair.sh - Automatically fixes common Hermes config YAML issues

CONFIG="$HOME/.hermes/config.yaml"
BACKUP="$HOME/.hermes/config.yaml.backup.$(date +%Y%m%d_%H%M%S)"

echo "Backing up config to $BACKUP"
cp "$CONFIG" "$BACKUP"

# Fix duplicate home-assistant section
python3 -c "
import yaml
import sys

try:
    with open('$CONFIG', 'r') as f:
        lines = f.readlines()
    
    # Find MCP servers section
    in_mcp_servers = False
    found_n8n = False
    found_ha = False
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detect entering MCP servers section
        if line.strip() == 'mcp_servers:':
            in_mcp_servers = True
            new_lines.append(line)
            i += 1
            continue
            
        # Detect leaving MCP servers section (next non-indented, non-empty, non-comment line)
        if in_mcp_servers and line.strip() and not line.startswith(' ') and not line.startswith('#'):
            in_mcp_servers = False
            
        # Skip duplicate home-assistant sections
        if in_mcp_servers and line.strip() == 'home-assistant:' and found_ha:
            # Skip this entire section
            i += 1
            while i < len(lines) and (lines[i].startswith(' ') or lines[i].strip() == ''):
                i += 1
            continue
            
        # Track what we've found
        if in_mcp_servers and line.strip() == 'n8n-mcp:':
            found_n8n = True
        elif in_mcp_servers and line.strip() == 'home-assistant:':
            found_ha = True
            
        new_lines.append(line)
        i += 1
    
    # Write back fixed config
    with open('$CONFIG', 'w') as f:
        f.writelines(new_lines)
        
    print('Fixed duplicate sections in Hermes config')
    
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
"

# Validate the fix
echo "Validating YAML..."
python3 -c "
import yaml
try:
    with open('$CONFIG', 'r') as f:
        yaml.safe_load(f)
    print('✅ YAML is valid!')
except Exception as e:
    print(f'❌ YAML still invalid: {e}')
    echo 'Restoring from backup...'
    cp '$BACKUP' '$CONFIG'
"
```

Save this as `~/hermes-config-repair.sh`, make it executable (`chmod +x`), and run it when you encounter issues.

## When to Start Fresh

If the config is severely corrupted and repair is taking too long:
1. Backup your current config: `cp ~/.hermes/config.yaml ~/.hermes/config.yaml.broken`
2. Create a minimal working config from scratch
3. Gradually add back your MCP servers and other settings
4. Validate after each addition

## Related Skills
- `native-mcp`: For understanding how Hermes connects to MCP servers
- `n8n-mcp-integration`: For using the n8n MCP server once configured
- `home-assistant-mcp-integration`: For using the Home Assistant MCP server once configured
- `mcporter`: For manual testing of MCP connections
- `obsidian-integration`: For creating and managing notes in Obsidian vault

## Remember
YAML is unforgiving about indentation but human-readable when correct. Take your time, validate frequently, and don't hesitate to start over with a clean section if repairs become too complex. The time spent fixing YAML pays off in reliable MCP connections and working integrations.
---