---
name: n8n-mcp-integration
description: Skill for connecting to and using n8n MCP server for workflow automation
version: 1.0.0
author: Hermes Agent
license: MIT
---

# n8n MCP Integration

This skill provides guidance for connecting to and using the n8n MCP server to build, manage, and execute n8n workflows.

## Overview
The n8n MCP server exposes the full n8n Workflow SDK as MCP tools, allowing programmatic workflow creation and management.

## Prerequisites
- n8n MCP server running at https://n8n.wineandgecko.com/mcp-server/http
- Valid Bearer token for authentication
- native-mcp skill loaded

## Configuration
The n8n MCP server should be configured in ~/.hermes/config.yaml:
```yaml
mcp_servers:
  n8n-mcp:
    url: "https://n8n.wineandgecko.com/mcp-server/http"
    headers:
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlY2YzNWViZC0wZjQwLTQ4MzgtOWE2MC1hZmM3NDQzMjM2Y2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImIyODBjNWM2LTcyZWEtNGVhYy1hYTg5LWIyMGY2ZmQ0YzRmMCIsImlhdCI6MTc3NTE2NDQwNX0.aa9hV8HD1IiT3wsCDD9d-mGMlt03QERbXIYtHcxGK4c"
    timeout: 180
    connect_timeout: 60
```

## Available Tools
Once connected, these tools are available (prefixed with mcp_n8n-mcp_):
- search_workflows - Find workflows with filters
- execute_workflow - Execute a workflow by ID
- get_execution - Retrieve execution details
- get_workflow_details - Get detailed workflow information
- publish_workflow - Publish (activate) a workflow
- unpublish_workflow - Unpublish (deactivate) a workflow
- archive_workflow - Archive a workflow
- update_workflow - Update an existing workflow
- create_workflow_from_code - Create workflow from validated SDK code
- validate_workflow - Validate n8n Workflow SDK code
- get_sdk_reference - Get SDK documentation
- search_nodes - Search for n8n nodes
- get_node_types - Get exact TypeScript type definitions
- get_suggested_nodes - Get curated node recommendations
- search_projects - Search for accessible projects
- search_folders - Search for folders within projects

## Usage Examples
```bash
# List all available n8n MCP tools
mcp_n8n-mcp_list_tools

# Search for Gmail and Slack nodes
mcp_n8n-mcp_search_nodes --queries '["gmail", "slack"]'

# Validate workflow code before creation
mcp_n8n-mcp_validate_workflow --code 'YOUR_WORKFLOW_CODE_HERE'

# Create a workflow from validated code
mcp_n8n-mcp_create_workflow_from_code --code 'VALID_CODE' --name 'My Workflow' --description 'Workflow description'

# Execute the workflow
mcp_n8n-mcp_execute_workflow --workflowId 'WORKFLOW_ID' --executionMode 'manual'
```

## Best Practices
1. Always validate workflow code with validate_workflow before creation
2. Use get_node_types to get exact parameter names for nodes
3. Start with simple workflows, then increase complexity
4. Monitor execution results with get_execution
5. Use appropriate trigger types (webhook vs polling) for performance
---