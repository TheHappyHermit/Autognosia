---
name: http-mcp-connection
description: Approach for connecting to and testing HTTP-based MCP (Model Context Protocol) servers, especially those requiring specific headers or Server-Sent Events (SSE) support.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [MCP, HTTP, Connection, Testing, Troubleshooting]
---

# HTTP MCP Server Connection and Testing

## When to Use This Skill

Use this skill when you need to:
- Connect to HTTP-based MCP servers that may require specific headers
- Test MCP server connectivity when standard MCP clients fail
- Work with MCP servers that use Server-Sent Events (SSE) transport
- Troubleshoot MCP connection issues related to headers or protocol negotiation
- Configure MCP servers in Hermes Agent configuration
- Discover MCP servers running on unexpected endpoints (like finding Home Assistant MCP at /api/mcp instead of /api/websocket)

This approach is particularly useful for MCP servers like n8n's MCP server and Home Assistant's MCP server that require specific `Accept` headers for proper SSE handling.

## Step-by-Step Approach

### 1. **Initial Connectivity Check**
Before attempting MCP-specific tests, verify basic network connectivity:

```bash
# Test basic reachability
ping n8n.wineandgecko.com

# Test HTTPS port accessibility  
nc -z n8n.wineandgecko.com 443 && echo "Port 443 open" || echo "Port 443 blocked"
```

### 2. **Test with Proper MCP Headers (When Standard Tools Fail)**
Many MCP servers require specific headers for SSE support. Use curl with proper headers:

```bash
curl -N https://n8n.wineandgecko.com/mcp-server/http \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}},"id":1}'
```

**Key Header**: `Accept: application/json, text/event-stream` is often required for SSE-compatible MCP servers.

### 3. **Use Python Requests for Reliable Testing**
When curl/mcporter approaches fail due to header parsing issues, use Python requests:

```python
import json
import requests

url = "https://n8n.wineandgecko.com/mcp-server/http"
headers = {
    "Authorization": "Bearer YOUR_TOKEN_HERE",
    "Content-Type": "application/json", 
    "Accept": "application/json, text/event-stream"
}

# MCP Initialize Request
payload = {
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {
            "name": "hermes-agent",
            "version": "1.0.0"
        }
    },
    "id": 1
}

response = requests.post(url, headers=headers, json=payload, timeout=30)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

# Handle SSE response format
if response.status_code == 200:
    for line in response.text.strip().split('\n'):
        if line.startswith('data: '):
            data = json.loads(line[6:])  # Remove 'data: ' prefix
            print(f"Parsed MCP Response: {json.dumps(data, indent=2)}")
```

### 4. **Discover Available Tools**
After successful initialization, list available tools:

```python
# MCP Tools/List Request
tools_payload = {
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
}

tools_response = requests.post(url, headers=headers, json=tools_payload, timeout=30)
# Process SSE response similar to above
```

### 5. **Configure in Hermes Agent**
Once tested and working, add to `${HOME}/.hermes/config.yaml`:

```yaml
mcp_servers:
  your-server-name:
    url: "https://your-mcp-server.com/mcp-endpoint"
    headers:
      Authorization: "Bearer YOUR_TOKEN_HERE"
      # Add other required headers as needed
    timeout: 180
    connect_timeout: 60
```

### 6. **Verify Integration**
After configuring and restarting Hermes Agent:
- Check Hermes startup logs for MCP connection messages
- Verify tools appear with `mcp_{server_name}_{tool_name}` naming
- Test calling the tools through normal Hermes Agent interaction

## Common Issues and Solutions

### ❌ **\"Not Acceptable: Client must accept both application/json and text/event-stream\"**\n**Solution**: Add `Accept: application/json, text/event-stream` header to all requests\n\n### ❌ **mcporter header syntax issues**\n**Solution**: Use direct HTTP testing with Python requests or curl when mcporter doesn't accept header flags properly\n\n### ❌ **Connection timeouts**\n**Solution**: Increase `connect_timeout` and `timeout` values in config, verify network accessibility\n\n### ❌ **Authentication failures**\n**Solution**: Verify token format and permissions, ensure Bearer prefix is correct\n\n### ❌ **SSE parsing complexity**\n**Solution**: Look for lines starting with `data: ` and parse the JSON after that prefix\n\n### ❌ **MCP server not found at expected endpoint**\n**Solution**: MCP servers may run on unexpected paths. Common places to check:\n- `/api/mcp` (Home Assistant MCP server)\n- `/mcp`\n- `/api/websocket/mcp`\n- `/websocket/mcp`\n- `/mcp/server`\n- `/api/mcp/server`\n\n**Approach**: Test standard MCP initialize request on various endpoints until you find one that returns a proper MCP response with `protocolVersion` and `serverInfo`.
**Solution**: Add `Accept: application/json, text/event-stream` header to all requests

### ❌ **mcporter header syntax issues**
**Solution**: Use direct HTTP testing with Python requests or curl when mcporter doesn't accept header flags properly

### ❌ **Connection timeouts**
**Solution**: Increase `connect_timeout` and `timeout` values in config, verify network accessibility

### ❌ **Authentication failures**
**Solution**: Verify token format and permissions, ensure Bearer prefix is correct

### ❌ **SSE parsing complexity**
**Solution**: Look for lines starting with `data: ` and parse the JSON after that prefix

## Verification Steps

After completing this approach, verify:
1. ✅ MCP initialize handshake succeeds (returns protocolVersion and serverInfo)
2. ✅ Tools/list returns expected tool definitions
3. ✅ Tools are properly registered in Hermes with `mcp_{server}_{tool}` naming
4. ✅ At least one tool can be successfully called through Hermes Agent

**Additional verification from Home Assistant discovery:**
- ✅ Found MCP server running on unexpected endpoint `/api/mcp` instead of `/api/websocket`
- ✅ Server identified itself as "home-assistant" in serverInfo
- ✅ Tools exposed Home Assistant entities as MCP tools (HassTurnOn, HassToggle, etc.)
- ✅ Tool calls worked correctly via MCP interface

## When to Consider Alternatives

Consider these alternatives instead:
- Use `native-mcp` skill if the server works with standard configuration
- Use `mcporter` skill for ad-hoc one-off testing without configuration
- If the server uses stdio transport instead of HTTP, use the command/args approach

## Troubleshooting Tips

1. **Check Headers Carefully**: MCP servers are often picky about exact header values
2. **Verify Token Format**: Ensure Bearer tokens are correctly formatted
3. **Test Time-of-Day**: Some servers have rate limits (check X-Ratelimit headers)
4. **Look at SSE Format**: MCP over HTTP uses Server-Sent Events format, not plain JSON
5. **Start Simple**: Always test initialize before trying tools/list or other methods
6. **Use Verbose Output**: When debugging, capture full headers and response details

## References

- MCP Specification: https://modelcontextprotocol.io/
- n8n MCP Server Documentation: (provided by your n8n instance)
- SSE (Server-Sent Events): https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- JSON-RPC 2.0: https://www.jsonrpc.org/specification

This approach has been tested and proven effective with the n8n.wineandgecko.com MCP server and should work with similar HTTP-based MCP servers requiring specific headers for SSE support.