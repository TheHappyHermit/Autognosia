---
name: troubleshoot-failed-cronjob-external-deps
description: Systematic methodology for diagnosing failed cronjobs that depend on external services, covering DNS, connectivity, script integrity, dependencies, and authentication without exposing sensitive commands.
category: devops
---

# Troubleshooting Failed CronJobs with External Dependencies

A repeatable approach to diagnose cronjob failures when external services (APIs, databases, etc.) are involved. Focuses on isolating variables and checking each layer of the dependency stack.

## When to Apply This Methodology

- Cronjob runs but produces error output or no useful results
- Failure involves connection errors, timeouts, or DNS issues with external services
- Script appears to be missing, corrupted, or failing silently
- Need to distinguish between: infrastructure issues, script problems, dependency failures, or credential problems

## The Diagnostic Layers Approach

Check each layer systematically, moving from network/infrastructure up to application logic:

### Layer 1: Network & Service Availability
**Goal:** Verify the external service is reachable at the network level.

**Checks:**
- DNS resolution: Does the service hostname resolve to an IP address?
  ```bash
  nslookup service.example.com
  dig +short service.example.com
  ```
- Basic connectivity: Can we reach the service IP on the expected port?
  ```bash
  # Replace with actual IP and port from DNS results
  timeout 5 bash -c "</dev/tcp/<ip-address>/<port>" && echo "Port open" || echo "Port closed/unreachable"
  # Or using nc/curl:
  nc -zv <ip-address> <port>  # or
  curl -v --connect-timeout 5 https://<ip-address>:<port> 2>&1 | head -5
  ```

**If DNS fails:** Check /etc/hosts, DNS configuration, or whether you're using the correct service hostname.

### Layer 2: Service Endpoint & Protocol
**Goal:** Verify the service is speaking the expected protocol on the expected endpoint.

**Checks:**
- Test the specific API/endpoint with minimal request
- Pay attention to required headers (like Host header when accessing via IP)
- Look for service-specific responses (authentication challenges, expected data formats)

**Example pattern:**
```bash
# For HTTP/HTTPS services
curl -vk --connect-timeout 10 \
  -H "Host: expected-hostname.example.com"  # Often needed when accessing via IP
  https://<service-ip>/api/health-check  # or appropriate endpoint
```

### Layer 3: Script Integrity & Location
**Goal:** Confirm the actual script being run exists and is functional.

**Checks:**
- Locate the script from cronjob configuration or documentation
- Verify it exists at the expected path
- Distinguish between:
  - Actual functional script
  - Placeholder/error script
  - Missing file
  - Corrupted/incomplete script

**Verification:**
```bash
ls -la /path/to/script.py
head -n 10 /path/to/script.py
# Look for: shebang, imports, main function, avoid scripts that just print errors
```

**If missing:** Check backup locations, version control, or documentation for where it should be.

### Layer 4: Runtime Environment & Dependencies
**Goal:** Ensure the execution environment has all required components.

**Checks:**
- Correct interpreter/virtual environment being used
- Required packages/modules installed and importable
- Version compatibility if relevant

**Verification patterns:**
```bash
# Check what python/venv is being used
which python
# or from cronjob: /path/to/venv/bin/python

# Check installed packages in that environment
/path/to/venv/bin/pip list | grep -E "(package1|package2|package3)"

# Test critical imports
/path/to/venv/bin/python3 -c "import module_name; print(f'{module_name}: OK')"
```

### Layer 5: Credentials & Authentication
**Goal:** Verify access credentials are valid and working.

**Checks:**
- Credentials exist and are correctly formatted
- Can successfully authenticate to the service
- Tokens/keys are not expired
- **For Hermes cron jobs:** The env var referenced in `api_key_env` actually exists in the cron environment (NOT just in your interactive shell)

**Cron-Environment Warning:** Cron jobs run in a **fresh session** and do NOT inherit shell environment variables. `env | grep API_KEY` in your current shell is **misleading** — it only shows shell vars, not what the cron job has.

**Safe verification approach:**
```bash
# Check if the env var exists in the CURRENT environment
# (if it's not here, it won't be in cron either)
env | grep OPENROUTER_API_KEY  # If blank → cron jobs won't have it

# Instead of showing credentials in commands/test:
# 1. Retrieve credentials securely (from vault, keyring, etc.)
# 2. Use them in a test that doesn't echo them back
# 3. Verify success/failure without exposing the credentials in output

# Example pattern (pseudo-code):
# credentials = get_credentials_securely()
# result = attempt_authentication(credentials)
# if result.success: log "Authentication successful"
# else: log "Authentication failed"  # Without showing credentials
```

**For debugging:** Test authentication separately from the full script to isolate credential issues.

### Layer 6: Script Execution & Logic
**Goal:** Verify the script runs correctly when all lower layers are validated.

**Checks:**
- Run the script manually with any required environment variables
- Look for meaningful output vs. silent failures
- Check exit codes and error messages
- Verify it produces expected results/files/notifications

**Example:**
```bash
# Set any required env vars (from cronjob/config)
export VAR1=value1
export VAR2=value2

# Run the script
/path/to/venv/bin/python3 /path/to/script.py
echo "Exit code: $?"
```

## Decision Tree for Troubleshooting

```
Start: Cronjob failing or not producing expected output
        |
        v
Check recent cronjob output/logs for error messages
        |
        v
Is it a DNS/resolution error? -> Check Layer 1 (DNS, /etc/hosts)
        |
        v
Is it a connection refused/timeout? -> Check Layer 1-2 (connectivity, service)
        |
        v
Is it "script not found" or permission error? -> Check Layer 3 (script location/integrity)
        |
        v
Is it import/module not found? -> Check Layer 4 (dependencies, venv)
        |
        v
Is it authentication/401/403 error? -> Check Layer 5 (credentials)
        |
        v
Does script run manually but fail in cron? -> Check environment, user, path differences
        |
        v
If all layers check out but still fails -> Deep dive into script logic (Layer 6)
```

## Documentation & Verification Checklist

After investigating each layer, document what you found:

- [ ] **DNS Resolution**: Service hostname resolves correctly? (Yes/No/Notes)
- [ ] **Network Connectivity**: Service IP:port reachable? (Yes/No/Notes)
- [ ] **Service Endpoint**: API responds correctly to basic requests? (Yes/No/Notes)
- [ ] **Script Integrity**: Actual script exists and is not corrupted/placeholder? (Yes/No/Notes)
- [ ] **Dependencies**: All required packages installed in correct environment? (Yes/No/Notes)
- [ ] **Credentials**: Authentication credentials valid and working? (Yes/No/Notes)
- [ ] **Script Execution**: Script runs successfully when invoked manually? (Yes/No/Notes)

## Common Findings & Patterns

1. **DNS Issues**: Service moved, hostname changed, DNS misconfiguration, split-horizon DNS
2. **Network/Connectivity**: Firewall blocking, service down, wrong IP/port, VPN required
3. **Script Problems**: Deployments failed, backups not restored, placeholder scripts left in place
4. **Dependency Issues**: Virtual environment not activated, packages missing, version conflicts
5. **Credential Problems**: Passwords rotated, API keys expired, permissions changed, wrong environment
6. **Cron-Specific Issues**: Different PATH, missing environment variables, user permission issues
   - **Cron env var missing**: `api_key_env` references a variable that doesn't exist in the cron environment (cron runs in a fresh session, not your shell). Check with `env | grep <VAR_NAME>`.
   - **LMStudio + api_key_env mismatch**: `provider: lmstudio` with `api_key_env: ...` is always a bug — LMStudio is a local proxy that doesn't need an API key. Remove the `api_key_env` line.
   - See `references/lmstudio-api-key-mismatch.md` for the full diagnostic pattern.
7. **Cron Injection Scanner False Positive**: Hermes' cron jobs scan the assembled prompt (user prompt + loaded skill content) against threat patterns before execution. If blocked, the output file will show "BLOCKED" status and a threat pattern name (e.g. `ssh_backdoor`). Fix: audit the attached skill(s) for strings matching the threat pattern (`authorized_keys`, `rm -rf /`, `disregard instructions`, `do not tell the user`, `system prompt override`, etc.) and rephrase or remove them. The scanner lives at `tools/cronjob_tools.py::_CRON_THREAT_PATTERNS` in the hermes-agent codebase.

## Pitfalls

1. **`api_key_env` on local providers is always a bug** — LMStudio, Ollama, vLLM don't need API keys. If `provider: lmstudio` has `api_key_env` set, remove it.
2. **`env | grep API_KEY` shows shell vars, not cron vars** — cron jobs run in a fresh session. An env var visible in your shell may not exist in the cron environment.
3. **Cron output files don't log duration** — they only contain the start time and response. To get timing data, you need to add explicit timing to the cron job's prompt or check the gateway logs.
4. **Cron injection scanner false positives** — Hermes scans the assembled prompt against threat patterns. If a cron job is blocked, check the output file for "BLOCKED" status and audit the attached skill(s) for matching strings.

## Safety & Best Practices

- **Never** expose credentials in command history, logs, or output
- **Always** test authentication separately when debugging credential issues
- **Document** findings at each layer to avoid retracing steps
- **Change one thing at a time** when troubleshooting to isolate variables
- **Verify fixes** by running the cronjob manually or waiting for next scheduled run
- **Consider** adding health checks or monitoring to catch issues earlier

## When to Seek Additional Help

If after checking all layers:
- DNS resolution fails and you cannot correct it (infrastructure/DNS admin needed)
- Service IPs are reachable but service doesn't respond on expected ports (service admin)
- Script is missing and no backups/source available (development/ops needed)
- Critical dependencies cannot be installed or are unavailable (environment/admin)
- Authentication fails despite verified credentials (service/account admin)

This indicates the issue may be outside your immediate control and requires escalation to the appropriate team responsible for that layer.

## See Also

- `references/cron-vault-path-permission-failure.md` — Diagnosing and handling permission failures when cron jobs write to vault/synced paths under `~/Documents/...`
- `references/lmstudio-api-key-mismatch.md` — LMStudio + api_key_env mismatch pattern (401 errors from local model config)
- `references/cron-output-file-format.md` — Cron output file format, what's logged, and how to estimate run duration
- `references/cron-output-analysis.md` — Patterns for analyzing cron output files to categorize failure modes at scale (grep-based diagnostics)
- `references/provider-routing-misconfiguration.md` — Provider routing `order` array overriding `provider: auto` in cron jobs, causing 401 errors despite valid credentials for the intended provider; **also covers the `"auto"` string literal bug where `model: "auto"` bypasses config.yaml fallback and gets passed literally to the API (404) then triggers fallback chain (401)**

## Tracker file corruption by cron automation (NEW failure mode)

**Symptoms:**
- AGENDA.md status line suddenly shows zero pending topics, or only 1 pending topic
- `[✅]` entries have expanded/different content than expected from legitimate research
- File size/shape changed unexpectedly (e.g., went from thousands of lines to a handful)
- Cron output reports "completed all items" but `grep -c '\[⏳\]' AGENDA.md` shows far fewer than expected

**Response sequence:**
1. **Stop related cron jobs immediately** — pause all cron jobs that target the affected tracker file
2. Verify with terminal: `grep -c '\[⏳\]' /path/to/AGENDA.md` and `grep -c '\[✅\]' /path/to/AGENDA.md`
3. Check for `.bak` files in the same directory with recent timestamps; restore if available
4. If no recent backup, stop all related automation and report the corruption to the user immediately
5. Re-examine the cron prompt for unconditional "mark items as [✅]" instructions (see `research-cron-knowledge-base` pitfall #12 for the root cause pattern)
6. After recovery, update the cron prompt to require read-then-verify before any status mutation

**Root cause pattern:** A cron prompt that includes `"Update AGENDA.md: mark topic X as [✅]..."` without state verification can process items in bulk without re-reading current state. The cron may fabricate or apply stale state, overwrite structured tracker content, and then report success — often in the same run that actually destroyed the tracker. The failure is silent. No error is raised. The output looks like completion.

## Application to Real-World Scenario: Newsletter CronJob Failure

This methodology was applied to troubleshoot a failing newsletter cronjob where investigation revealed:
- **Layer 1 Failure**: DNS resolution for `freshrss.wineandgecko.com` failed (NXDOMAIN)
- **Layer 3 Failure**: The `newsletter_builder.py` script was a placeholder, not the actual script
- **Layer 4 Failure**: The `openai` package was missing from the newsletter virtual environment

Each issue was identified by systematically working through the layers, preventing wasted effort on incorrect assumptions.