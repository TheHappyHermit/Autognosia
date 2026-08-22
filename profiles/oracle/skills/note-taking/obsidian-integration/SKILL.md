---
name: obsidian-integration
description: Skill for creating and managing files and folders in Obsidian vault for Hermes Agent
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Obsidian Integration Skill

This skill provides guidance for creating and managing files and folders in an Obsidian vault from Hermes Agent.

## Overview
Hermes Agent can create, read, and manage notes in an Obsidian vault using standard file operations. The Obsidian vault is simply a folder containing markdown files.

## Vault Location
By default, Hermes Agent uses:
- **Vault Path**: `${HOME}/Documents/Obsidian Vault`
- **Hermes Subfolder**: `${HOME}/Documents/Obsidian Vault/Hermes` (for organizing Agent-created content)

You can customize the vault location by setting the `OBSIDIAN_VAULT_PATH` environment variable in `${HOME}/.hermes/.env`:
```bash
OBSIDIAN_VAULT_PATH="/path/to/your/vault"
```

## Setup Verification
The Obsidian vault should be set up at `${HOME}/Documents/Obsidian Vault` with a Hermes subfolder:
```
${HOME}/Documents/Obsidian Vault/
├── Hermes/                 # ← Agent-created content
│   ├── test-note-from-hermes.md
│   ├── workflow-ideas.md
│   └── home-assistant-config.md
├── Personal Notes/
├── Work/
└── Projects/
```

## Standard Operations

### 1. Create a Folder
```bash
# Create a new folder in the vault
mkdir -p "$HOME/Documents/Obsidian Vault/Folder Name"

# Create a folder in the Hermes subfolder
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes/Category Name"
```

### 2. Create a Note
```bash
# Create a new markdown note
cat > "$HOME/Documents/Obsidian Vault/Hermes/My Note.md" << 'EOF'
# My Note Title

This is the content of my note.

## Section 1
- Item 1
- Item 2

## Section 2
More content here.
EOF
```

### 3. Read a Note
```bash
# View the contents of a note
cat "$HOME/Documents/Obsidian Vault/Hermes/My Note.md"
```

### 4. Search Notes
```bash
# Search by filename
find "$HOME/Documents/Obsidian Vault" -name "*.md" -iname "*keyword*"

# Search by content
grep -rli "keyword" "$HOME/Documents/Obsidian Vault" --include="*.md"
```

### 5. Append to a Note
```bash
# Add content to the end of a note
echo -e "\n## New Section\n\nNew content here." >> "$HOME/Documents/Obsidian Vault/Hermes/Existing Note.md"
```

### 6. List Notes in a Folder
```bash
# List all markdown notes in a folder
ls "$HOME/Documents/Obsidian Vault/Hermes/"*.md

# List all notes recursively
find "$HOME/Documents/Obsidian Vault" -name "*.md" -type f
```

## Best Practices

### Organization
1. **Use the Hermes subfolder**: Keep Agent-created content organized in `${HOME}/Documents/Obsidian Vault/Hermes/`
2. **Create subfolders by topic**: Organize notes by project, area of responsibility, or theme
3. **Use clear, descriptive names**: Make note filenames easy to understand and search for
4. **Use consistent naming**: Consider using prefixes like `meeting-`, `project-`, `idea-`, `log-`

### Note Format
1. **Use markdown formatting**: Obsidian fully supports markdown syntax
2. **Add frontmatter (optional)**: For metadata, tags, and properties
3. **Use wikilinks**: Link related notes using `[[Note Name]]` syntax
4. **Use tags**: Add `#tags` for categorization and easy searching
5. **Include timestamps**: Helpful for logs and time-series data

### Content Types
1. **Meeting notes**: Capture decisions, action items, and attendees
2. **Project plans**: Outline goals, milestones, and resources
3. **Technical documentation**: API references, setup guides, troubleshooting
4. **Ideas and brainstorming**: Capture concepts for later development
5. **Logs and journals**: Track progress, issues, and observations
6. **Reference material**: Cheat sheets, command references, workflow diagrams

## Examples

### Create a Meeting Note
```bash
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes/Meetings"
cat > "$HOME/Documents/Obsidian Vault/Hermes/Meetings/2026-04-03-team-sync.md" << 'EOF'
# Team Sync - 2026-04-03

## Attendees
- [x] Alice
- [x] Bob  
- [ ] Charlie

## Agenda
1. Review sprint progress
2. Discuss blockers
3. Plan next steps

## Discussion Points
- **Blocker**: API rate limiting on third-party service
  - **Solution**: Implement caching layer
  - **Owner**: Alice
  - **ETA**: End of week

- **Decision**: Use PostgreSQL for new project
  - **Reason**: Better JSON support and indexing
  - **Vote**: Unanimous

## Action Items
- [ ] Alice: Implement caching solution by EOD Friday
- [ ] Bob: Update database schema documentation
- [ ] Charlie: Set up staging environment
EOF
```

### Create a Technical Reference
```bash
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes/Reference"
cat > "$HOME/Documents/Obsidian Vault/Hermes/Reference/mcp-commands.md" << 'EOF'
# MCP Commands Reference

## n8n Workflow Automation
- `mcp_n8n-mcp_search_nodes --queries '["gmail", "slack"]'` - Find nodes
- `mcp_n8n-mcp_validate_workflow --code '...'` - Validate workflow code
- `mcp_n8n-mcp_create_workflow_from_code --code 'VALID' --name 'WF'` - Create workflow
- `mcp_n8n-mcp_execute_workflow --workflowId 'ID' --executionMode 'manual'` - Execute

## Home Assistant Control
- `mcp_home-assistant_HassTurnOn --name "light.living_room"` - Turn on light
- `mcp_home-assistant_HassGetStates --domain "sensor"` - Get sensor readings
- `mcp_home-assistant_HassCallService --domain "notify" --service "mobile_app" --data '{"msg":"test"}'` - Send notification
- `mcp_home-assistant_HassToggle --entity_id "switch.outdoor_lights"` - Toggle switch

## Utility Commands
- `mcp_n8n-mcp_list_tools` - List all available n8n MCP tools
- `mcp_home-assistant_list_tools` - List all available Home Assistant MCP tools
EOF
```

### Create a Workflow Idea Log
```bash
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes/Ideas"
cat > "$HOME/Documents/Obsidian Vault/Hermes/Ideas/workflow-ideas.md" << 'EOF'
# Workflow Ideas Log

## Idea 1: GitHub Issue → n8n → Slack Notification
**Date**: 2026-04-03
**Status**: Planning

**Description**: When a new GitHub issue is created with specific labels, trigger an n8n workflow that:
1. Enriches the issue with project metadata
2. Sends a formatted notification to Slack
3. Creates a follow-up task in Linear
4. Adds the issue to a weekly review digest

**Components Needed**:
- GitHub MCP server (for issue monitoring)
- Linear MCP server (for task creation)
- Slack notifications (built-in n8n node)
- Data transformation nodes

**Next Steps**:
- [ ] Research GitHub webhook format for issue creation
- [ ] Test Linear API integration
- [ ] Design Slack message template

## Idea 2: Home Sensor Data → n8n → Daily Report
**Date**: 2026-04-03
**Status**: Researching

**Description**: Collect sensor data from Home Assistant throughout the day and generate a daily summary report:
- Temperature/humidity averages and extremes
- Motion detection counts
- Door/window open/close events
- Energy usage summary
- Weather correlation analysis

**Delivery Options**:
- Email PDF report each morning
- Obsidian note updated daily
- Slack message to #home-summary channel

**Components Needed**:
- Home Assistant MCP server (for data collection)
- n8n function nodes (for data processing)
- Template nodes (for report generation)
- Email or file write nodes (for delivery)

## Idea 3: Documentation Generator
**Date**: 2026-04-03
**Status**: Concept

**Description**: Automatically generate and update documentation from code comments and annotations:
- Extract JSDoc/Python docstrings
- Create markdown files in Obsidian vault
- Link related functions and classes
- Generate API reference diagrams
- Update when code changes (via file watchers)

**Potential Integrations**:
- File system MCP server (for vault access)
- AST parsing libraries (for code analysis)
- Mermaid or Excalidraw (for diagrams)
- Obsidian URI scheme (for linking)

## How to Use This Log
1. Add new ideas with the format above
2. Update status as you progress (Planning → Researching → Prototyping → Built → Deployed)
3. Link to detailed notes using wikilinks: `[[2026-04-03-team-sync]]`
4. Tag ideas with relevant topics: `#automation #n8n #home-assistant`
EOF
```

## Troubleshooting

### Common Issues
1. **"No such file or directory"**: 
   - Verify the vault path is correct
   - Check that `${HOME}/Documents/Obsidian Vault` exists
   - Ensure you have write permissions

2. **Permission denied**:
   - Check file and directory permissions
   - Ensure the vault is not on a read-only filesystem
   - Verify you own the vault directory

3. **Notes not appearing in Obsidian**:
   - Ensure files have `.md` extension
   - Check that Obsidian is indexing the vault
   - Try restarting Obsidian or reloading the vault

4. **Encoding issues**:
   - Use UTF-8 encoding for markdown files
   - Avoid special characters in filenames (use hyphens or underscores)
   - Ensure consistent line endings (LF recommended)

### Quick Fixes
```bash
# Verify vault exists and is writable
ls -la "$HOME/Documents/Obsidian Vault"

# Create missing directories
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes"

# Fix permissions (if needed)
chmod -R u+rw "$HOME/Documents/Obsidian Vault"

# Check available space
df -h "$HOME/Documents/Obsidian Vault"
```

## Integration with Hermes Agent

When using Hermes Agent, you can:
1. **Ask me to create notes**: "Create a note in my Obsidian vault about today's meeting"
2. **Request summaries**: "Summarize the contents of my project-planning note"
3. **Search for information**: "Find all notes mentioning the word 'deadline'"
4. **Create workflows**: "Create a new note with ideas for n8n workflows"
5. **Log interactions**: "Add today's conversation to my interaction log"
6. **Create references**: "Make a cheat sheet for the MCP tools we've been using"

## Advanced Usage

### Template System
Create reusable templates for common note types:
```bash
# Create a template directory
mkdir -p "$HOME/Documents/Obsidian Vault/Hermes/Templates"

# Create a meeting note template
cat > "$HOME/Documents/Obsidian Vault/Hermes/Templates/meeting-template.md" << 'EOF'
# Meeting Note - {{date}}

## Attendees
- 

## Agenda
1. 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Meeting
- Date: 
- Time: 
- Location: 
EOF
```

### Automation Ideas
1. **Daily journal**: Automatically create a dated note each morning
2. **Meeting prep**: Generate notes before scheduled calendar events
3. **Idea capture**: Create notes from voice transcripts or clipboard content
4. **Project tracking**: Update project status notes based on task completion
5. **Knowledge base**: Automatically link related notes using tags and wikilinks

## Reference Links
- Obsidian Help: https://help.obsidian.md/
- Obsidian Forum: https://forum.obsidian.md/
- Obsidian Discord: https://discord.gg/obsidian
- Markdown Guide: https://www.markdownguide.org/
- Wikilink Syntax: https://help.obsidian.md/Linking+notes+and+files/Wikilinks

## Quick Reference
```bash
# Core paths
VAULT="$HOME/Documents/Obsidian Vault"
HERMES="$VAULT/Hermes"

# Create folder
mkdir -p "$HERMES/Topic Name"

# Create note
cat > "$HERMES/Topic Name/Note Title.md" << 'EOF'
# Note Title

Content here.
EOF

# Read note
cat "$HERMES/Topic Name/Note Title.md"

# Search content
grep -rli "search term" "$VAULT" --include="*.md"

# Search filename
find "$VAULT" -name "*.md" -iname "*search*"

# List notes in folder
ls "$HERMES/Topic Name/"*.md

# Append to note
echo -e "\n## New Section\n\nContent." >> "$HERMES/Existing Note.md"
```
---