---
name: paperclip-integration
description: Systematic approach to integrating with Paperclip application running at http://127.0.0.1:3100
version: 1.0.0
category: devops
---

# Paperclip Integration Skill

## Overview
This skill provides a systematic approach to integrating with the Paperclip application running locally at http://127.0.0.1:3100. Paperclip is an open-source orchestration system for zero-human companies that manages teams of AI agents (like OpenClaw, Claude Code, etc.) rather than a clipboard manager.

## Prerequisites
- Paperclip server running at http://127.0.0.1:3100
- API key available in environment variables (checked via skill)
- Understanding that Paperclip orchestrates AI agents, not clipboard data

## Environment Variables Checked
This skill checks for the following environment variables in order:
1. `PAPERCLIP_API_KEY` - Primary API key
2. `API_KEY` - Generic API key fallback
3. `CLIP_API_KEY` - Alternative naming
4. `PAPERCLIP_KEY` - Shorter alternative

## Verified Working Configuration\\nAs of 2026-04-13:\\n- Paperclip server running at: http://127.0.0.1:3100\\n- API Key: pcp_f2d4bbf637e6efebc49ffed712d2d88974f2e6d50bf7fbb5 (currently set)\\n- Authentication: Bearer token in Authorization header\\n- Deployment Mode: authenticated\\n- Auth Ready: true\\n- Important API Structure Findings:\\n  - Root endpoints (/health, /status, /version, /info) return 200 OK without authentication\\n  - Protected API endpoints (/companies, /plugins, etc.) return 403 Forbidden with current API key\\n  - This suggests the API key may have limited scope or requires exchange for full access\\n  - The API appears to be mounted at /api/ (not /api/v1/) based on endpoint responses\\n  - /api/health works and returns JSON deployment info\\n  - /api/v1/* endpoints return 404 (API may not be versioned)\\n  - /api/* endpoints (non-versioned) are the likely base path for most operations\\n  - Authentication enforcement varies by endpoint (some return 403, others may behave differently)\\n- Current Access Level:\\n  - Can perform health checks and system status queries\\n  - Cannot access core company resources (agents, plugins, org chart, etc.) with current key\\n  - May require different authentication flow, scoped permissions, or key exchange for full access
## Step-by-Step Procedures

### 1. Verify Paperclip is Running
```bash
# Check if Paperclip is accessible
curl -s http://127.0.0.1:3100

# Should return HTML response (the Paperclip web interface)
# Look for "<title>Paperclip</title>" in response
```

### 1b. Check Health Endpoint (Critical First Step)
```bash
# The /api/health endpoint is confirmed to work and return JSON
curl -s http://127.0.0.1:3100/api/health

# Should return JSON with status, version, and deploymentMode
# Look for: "deploymentMode": "authenticated"
```

### 2. Check Health Endpoints
```bash
# Test various health endpoints to understand deployment mode
curl -s http://127.0.0.1:3100/healthz
curl -s http://127.0.0.1:3100/api/health
curl -s http://127.0.0.1:3100/ready
curl -s http://127.0.0.1:3100/status

# Look for JSON responses with status information
```

### 3. Discover Available API Endpoints
```bash
# Check for OpenAPI/Swagger documentation
curl -s http://127.0.0.1:3100/openapi.json
curl -s http://127.0.0.1:3100/docs
curl -s http://127.0.0.1:3100/redoc

# Based on actual testing:
# - /api/health works and returns JSON
# - /api/v1/* endpoints return 404 (API may not be versioned)
# - /api/* endpoints (non-versioned) may be the correct path
# If these return HTML instead of JSON, the API may be:
# 1. Under a different path prefix (try /api/ without version)
# 2. Require authentication first (despite deploymentMode showing authenticated)
# 3. Not expose OpenAPI spec publicly
```

### 4. Authenticate with Paperclip
Based on actual testing, Paperclip shows "deploymentMode": "authenticated" in health checks, but authentication enforcement appears inconsistent or not properly implemented on tested endpoints.

#### Method 1: API Key in Header (Tested)
```bash
# Try API key in Authorization header - returns 200 but identical response to no-auth
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health

# Or try in X-API-Key header
curl -s -H "X-API-Key: $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health
```

#### Method 2: Try Without Auth Prefix
```bash
# Based on testing, the API key may work without "Bearer" prefix
curl -s -H "Authorization: $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health
```

#### Method 3: API Key as Query Parameter
```bash
curl -s "http://127.0.0.1:3100/api/health?api_key=$PAPERCLIP_API_KEY"
```

#### Method 4: Try Different Header Formats
```bash
# Test these if standard Bearer doesn't work
curl -s -H "Authorization: Token $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health

curl -s -H "Authorization: Bearer token=$PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health
```

#### Method 5: Login Flow (May Be Required)
```bash
# Some APIs require exchanging API key for a session token
# Try common login endpoints (these returned 404 in testing, but may exist under different paths)
curl -s -X POST http://127.0.0.1:3100/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"api_key": "'"$PAPERCLIP_API_KEY"'"}'

curl -s -X POST http://127.0.0.1:3100/v1/auth/token \
     -H "Content-Type: application/json" \
     -d '{"key": "'"$PAPERCLIP_API_KEY"'"}'
```

### 5. Test API Connectivity
Based on actual testing, the API structure appears to be different than initially assumed. The `/api/health` endpoint works, but versioned paths like `/api/v1/*` return 404.

```bash
# Test the working health endpoint
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/health

# Test API endpoints under /api (non-versioned) - these may be the correct path
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/history

curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/me

curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/clipboard

# Test POST endpoint for creating resources (if history endpoint works)
curl -s -X POST -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"content": "test from skill verification"}' \
     http://127.0.0.1:3100/api/history
```

### 6. Common Paperclip Operations
Based on Paperclip's orchestration functionality, these endpoints may exist (based on the GitHub documentation):

#### Agent Management
```bash
# List/hire agents (employees)
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/agents

# Get specific agent details
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/agents/{agent_id}
```

#### Heartbeats (Agent Check-ins)
```bash
# Get heartbeat schedule/status
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/heartbeats

# Trigger a heartbeat for an agent
curl -s -X POST -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"agentId": "agent-uuid", "task": "status-check"}' \
     http://127.0.0.1:3100/api/heartbeats/trigger
```

#### Tickets (Audit Log)
```bash
# Get ticket history (immutable audit log)
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/tickets

# Get specific ticket details
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/tickets/{ticket_id}
```

#### Budgets & Cost Control
```bash
# Get budget settings
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/budgets

# Set monthly token budget for an agent
curl -s -X POST -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"agentId": "agent-uuid", "monthlyTokenBudget": 100000}' \
     http://127.0.0.1:3100/api/budgets/set
```

#### Org Charts (Organizational Structure)
```bash
# Get company org chart
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/org-chart

# Update reporting structure
curl -s -X PUT -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"agentId": "agent-uuid", "reportsTo": "manager-uuid"}' \
     http://127.0.0.1:3100/api/org-chart/update
```

### 7. Using Paperclip from Scripts
Example Python script for interacting with Paperclip as an orchestration system:

```python
import os
import requests
import json
from typing import Optional, Dict, Any, List

class PaperclipOrchestrationClient:
    def __init__(self, base_url: str = "http://127.0.0.1:3100"):
        self.base_url = base_url.rstrip('/')
        self.api_key = self._get_api_key()
        self.session = requests.Session()
        if self.api_key:
            # Standard Bearer token authentication
            self.session.headers.update({
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            })
    
    def _get_api_key(self) -> Optional[str]:
        """Get API key from environment variables"""
        for key in ['PAPERCLIP_API_KEY', 'API_KEY', 'CLIP_API_KEY', 'PAPERCLIP_KEY']:
            value = os.getenv(key)
            if value:
                return value
        return None
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make request to Paperclip API"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, timeout=10, **kwargs)
            response.raise_for_status()
            ct = response.headers.get('content-type', '')
            if ct.startswith('application/json'):
                return response.json()
            else:
                return {"text": response.text, "content_type": ct}
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status_code": getattr(e.response, 'status_code', None)}
    
    def get_health(self) -> Dict[str, Any]:
        """Get Paperclip health status"""
        return self._make_request('GET', '/health')
    
    def list_agents(self) -> List[Dict]:
        """List all hired agents (employees)"""
        return self._make_request('GET', '/agents')
    
    def get_agent(self, agent_id: str) -> Dict:
        """Get details for a specific agent"""
        return self._make_request('GET', f'/agents/{agent_id}')
    
    def get_heartbeats(self) -> List[Dict]:
        """Get heartbeat schedule/status"""
        return self._make_request('GET', '/heartbeats')
    
    def trigger_heartbeat(self, agent_id: str, task: str) -> Dict:
        """Trigger a heartbeat for an agent"""
        return self._make_request('POST', '/heartbeats/trigger', 
                               json={"agentId": agent_id, "task": task})
    
    def get_tickets(self) -> List[Dict]:
        """Get ticket history (immutable audit log)"""
        return self._make_request('GET', '/tickets')
    
    def get_budgets(self) -> Dict:
        """Get budget settings"""
        return self._make_request('GET', '/budgets')
    
    def set_agent_budget(self, agent_id: str, monthly_token_budget: int) -> Dict:
        """Set monthly token budget for an agent"""
        return self._make_request('POST', '/budgets/set',
                               json={"agentId": agent_id, "monthlyTokenBudget": monthly_token_budget})
    
    def get_org_chart(self) -> Dict:
        """Get company org chart"""
        return self._make_request('GET', '/org-chart')
    
    def update_org_chart(self, agent_id: str, reports_to: str) -> Dict:
        """Update reporting structure"""
        return self._make_request('PUT', '/org-chart/update',
                               json={"agentId": agent_id, "reportsTo": reports_to})

# Usage example
if __name__ == "__main__":
    client = PaperclipOrchestrationClient()
    
    # Check connection
    health = client.get_health()
    print(f"Paperclip health: {health}")
    
    # List hired agents
    agents = client.list_agents()
    if isinstance(agents, list):
        print(f"Hired {len(agents)} agents:")
        for agent in agents[:5]:  # Show first 5
            print(f"  - {agent.get('name', 'Unknown')} ({agent.get('role', 'Unknown role')})")
    else:
        print(f"Agents response: {agents}")
    
    # Get budget info
    budgets = client.get_budgets()
    print(f"Budget settings: {budgets}")

### 8. Troubleshooting Guide

#### Problem: 401 Unauthorized or 403 Forbidden
- Verify API key is correct and not expired
- Try different header formats (Authorization: Bearer vs X-API-Key)
- Check if API key needs to be lowercase/uppercase
- Some systems require "Token" instead of "Bearer"

#### Problem: 404 Not Found on API Endpoints
- The API might be under a different version path (try /v2/, /api/v2/)
- Check if endpoints require trailing slashes
- Look for API documentation in the web interface (check ?dev or /admin)
- Some APIs disable endpoints in production mode

#### Problem: Connection Refused
- Verify Paperclip is actually running: `ps aux | grep paperclip`
- Check if it's bound to a different port or interface
- Try `netstat -tlnp | grep 3100` or `ss -tlnp | grep 3100`
- May need to start Paperclip with specific flags for API access

#### Problem: Getting HTML Instead of JSON
- API likely requires authentication first
- Some APIs return HTML error pages for unauthenticated requests
- Check response status code (should be 401/403, not 200)
- Look for WWW-Authenticate header in response

### 9. Verification Steps
After setting up authentication, verify with:

```bash
# Should return JSON with user/account info
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/v1/me

# Should return list of recent items
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     http://127.0.0.1:3100/api/v1/history?limit=5

# Should allow adding new item
curl -s -X POST -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"content": "test from skill verification"}' \
     http://127.0.0.1:3100/api/v1/history
```

### 10. Integration with Hermes/OpenClaw
To use Paperclip from Hermes agent or OpenClaw workflows:

1. Store API key in environment or Hermes secrets
2. Use the `terminal` tool to run curl commands
3. Use `execute_code` tool with the Python client above
4. Create custom tools that wrap Paperclip API calls

## Limitations and Notes
- Without the actual API key, authentication testing is limited
- The exact API structure may vary based on Paperclip version
- Some features may only be available in paid/enterprise tiers
- WebSocket connections for real-time updates may require different authentication
- Rate limiting may apply - check headers for X-RateLimit-*

## References
- Paperclip official documentation (if available)
- Browser DevTools Network tab when using Paperclip web UI
- Common patterns from similar clipboard managers (Clipy, Maccy, Clipboard History)