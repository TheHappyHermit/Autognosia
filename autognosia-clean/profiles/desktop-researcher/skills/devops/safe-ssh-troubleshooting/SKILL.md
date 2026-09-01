---
name: safe-ssh-troubleshooting
description: Approach for troubleshooting SSH connections to shared/rate-limited systems without triggering bans or service disruption
category: devops
---

# Safe SSH Troubleshooting with Rate Limit Awareness

## When to Use This Skill
When you need to troubleshoot SSH connection issues to remote systems, especially shared, rate-limited, or production systems where aggressive retry attempts could cause IP bans, service disruption, or negative consequences.

## Trigger Conditions
- SSH connection attempts failing with unclear or intermittent errors
- Need to diagnose access issues without triggering rate limits or security blocks
- Working with shared hosting, cloud instances with strict security, or systems you don't fully control
- User has expressed concern about causing disruption or getting banned

## Step-by-Step Approach

### 1. Initial Connection Attempt (Minimal Impact)
```bash
# Single connection attempt with verbose output and timeout
ssh -v -o ConnectTimeout=10 -o BatchMode=yes user@host -i ~/.ssh/key echo "test"
```
- **Purpose**: Establish baseline connectivity with minimal risk
- **Watch for**: Specific error messages in verbose output
- **Wait 30-60 seconds** before next attempt to avoid triggering rate limits

### 2. Systematic Diagnosis Based on Verbose Output
Check for these key indicators in `ssh -v` output:

**A. Connection Establishment Success** (look for):
- `Connecting to host [IP] port 22.`
- `Connection established.`
- `Local version string SSH-...`
- `Remote protocol version 2.0, remote software version SSH-...`

**B. Authentication Progress** (look for):
- `Authenticating to host:22 as 'user'`
- `Offering public key: ...`
- `Server accepts key: ...`

**C. Rate Limiting/Blocking Indicators** (STOP if you see):
- `Connection reset by peer`
- `kex_exchange_identification: read: Connection reset by peer`
- `Exceeded MaxStartups` (SSH daemon rate limiting)
- `Too many authentication attempts`
- `Connection closed by [IP] port 22`

**D. Host Key Issues** (resolve carefully):
- `Host key verification failed.` → Need to add to known_hosts
- `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` → Potential security concern

### 3. Provider-Specific Troubleshooting (When Applicable)
For cloud providers like OCI, AWS, GCP, Azure:
- **Check instance state**: Is it RUNNING, not STOPPED?
- **Verify network configuration**: 
  - Public IP address assigned?
  - Security lists/firewall allow SSH (TCP/22) from your IP?
  - Correct VCN/subnet configuration?
- **Consult provider documentation**: Search "[provider] SSH connection troubleshooting"

### 4. Safe Verification Steps
Instead of rapid retry attempts:
```bash
# Test basic network reachability (less intrusive)
ping -c 3 host
# or if ICMP blocked:
nc -zv host 22  # TCP connect test (may still count toward limits)

# Check if you can reach other ports/services
nc -zv host 80   # HTTP
nc -zv host 443  # HTTPS
```

### 5. When to Stop and Change Approach
**STOP attempting SSH connections immediately if you observe:**
- Multiple "Connection reset by peer" in succession
- Any mention of "Exceeded MaxStartups" or rate limiting
- Errors suggesting temporary bans or blocks
- User expresses concern about causing disruption

**Alternative approaches when SSH is blocked/unadvisable:**
- Wait 10-30 minutes and try again with single attempts
- Use provider's web-based console/terminal if available
- Try different access methods (serial console, instance connect features)
- Switch to a different task and return later
- Have the user establish initial connection via their known-good method, then take over

### 6. Documentation for Future Reference
After diagnosing, save what you learned:
- What specific error indicated the issue?
- What was the root cause (rate limit, config, network, etc.)?
- What approach worked or what should be avoided next time?
- Any provider-specific quirks discovered?

## Key Principles
1. **Start slow and observant**: One careful attempt tells you more than ten rapid ones
2. **Read the verbose output**: SSH `-v` flags provide detailed diagnostic information
3. **Respect rate limits**: They exist to protect services; triggering them is counterproductive
4. **Shared systems require extra caution**: What's acceptable on your private server may get you banned on shared infrastructure
5. **Have a pivot plan**: Know what you'll do if SSH troubleshooting isn't working or is too risky
6. **User guidance trumps assumptions**: If user says "don't spam the server," believe them and adjust your approach

## Common Pitfalls to Avoid
- 🔴 Rapid retry loops (bash while loops, scripts with no delays)
- 🔴 Ignoring verbose output clues in favor of guessing
- 🔴 Continuing after seeing clear rate limiting/banning indicators
- 🔴 Assuming "connection refused" means "wrong credentials" when it might be network/config
- 🔴 Not checking provider-specific documentation for known issues

## Recovery If You Trigger Rate Limiting
1. **Stop all SSH attempts immediately**
2. **Wait**: Typically 15-60 minutes for limits to reset (varies by system)
3. **Try again**: With a single, verbose attempt to test if limit cleared
4. **If still blocked**: Wait longer or use alternative access method
5. **Learn**: Adjust your troubleshooting approach for next time

## Example Safe Troubleshooting Session
```
Attempt 1 (T=0):  ssh -v -o ConnectTimeout=10 user@host  → "Connection reset by peer"
Wait 60 seconds
Attempt 2 (T=1m): ssh -v -o ConnectTimeout=10 user@host  → "Exceeded MaxStartups" 
STOP - Clear rate limiting detected
Wait 15 minutes
Attempt 3 (T=16m): ssh -v -o ConnectTimeout=10 user@host  → Success! or new error to diagnose
```

## When This Skill Is NOT Appropriate
- You have explicit, known-good credentials and configuration, and just need to execute routine tasks
- The system is your own private infrastructure with no shared usage concerns
- You're troubleshooting localhost or known-safe test environments
- The user has provided a working connection method and asks you to use it exclusively

## Related Skills
- `systematic-debugging`: Broader debugging methodology
- `service-fallback-implementation`: When you need local alternatives to blocked services
- `technology-evaluation`: For assessing different access methods