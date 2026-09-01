---
name: home-lab-ssh
description: SSH into Josh's home lab servers for management tasks.
---

## Home Lab Servers

### Main Server (10.1.1.10)

- **Username:** josh434
- **OS:** Ubuntu 24.04
- **Hostname:** Server
- **SSH key:** `~/.ssh/id_ed25519_home_lab`

### Agent Server (10.1.1.37)

- **Also called:** Agent server
- **Username:** josh434
- **OS:** Ubuntu 24.04
- **SSH key:** `~/.ssh/id_ed25519_agent_server`
- **Role:** Runs Hermes agent, Paperclip, Honcho services, default-api, meilisearch, qdrant, redis, postgres
- **Disk:** 158GB total, ~26GB free (83% used) after cleanup
- **Execution context note:** This is the **execution host** for all tool calls when the desktop app SSH-tunnels in. The desktop GUI runs on a separate Windows machine; tool calls that return `hostname JoshAgent` or `ip 10.1.1.37` are running here, not on the desktop. See `hermes-troubleshooting` → "Diagnosing Your Execution Context" for details.

### Agent Zero / Radio Server (10.1.1.18)

- **Also called:** Agent zero server, radio server
- **Username:** josh434
- **OS:** Ubuntu 22.04 (DragonOS hostname)
- **SSH key:** `~/.ssh/id_ed25519_agent_zero`
- **Role:** Runs Agent Zero (Docker), ShadowBroker frontend/backend, MariaDB
- **Disk:** 117GB total, ~61GB free (45% used)

## How to Connect

### Preferred: SSH Key Auth (Terminal)

```bash
# Main server
ssh -i ~/.ssh/id_ed25519_home_lab -o StrictHostKeyChecking=no josh434@10.1.1.10 "command here"

# Agent server
ssh -i ~/.ssh/id_ed25519_agent_server -o StrictHostKeyChecking=no josh434@10.1.1.37 "command here"

# Agent Zero / Radio server
ssh -i ~/.ssh/id_ed25519_agent_zero -o StrictHostKeyChecking=no josh434@10.1.1.18 "command here"
```

### Fallback: Paramiko (Python)

Only when programmatic access needed. Password: `J1234osh$`

```python
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname='10.1.1.37', username='josh434', password='J1234osh$', timeout=15)
stdin, stdout, stderr = client.exec_command('command')
print(stdout.read().decode('utf-8'))
client.close()
```

## Why SSH Keys > Paramiko

| Factor | SSH Key (terminal) | Paramiko |
|---|---|---|
| **Reliability** | Native OpenSSH, battle-tested | Python library, path issues on Windows |
| **Error handling** | SSH handles retries, timeouts | Manual exception handling |
| **Sandbox issues** | Runs in MSYS shell, full filesystem | Python sandbox can't see Windows paths |
| **Complexity** | One command | Import, connect, exec, decode, close |
| **File transfers** | `scp` / `sftp` available | Needs SFTPClient setup |

## Important Rules

- **NEVER change anything** without explicit user approval
- Use this only when the user asks to interact with the home lab
- Agent server runs Docker containers: Hermes, Paperclip, LiteLLM, Honcho, default-api, meilisearch, qdrant, redis, postgres
- All docker-compose files in `/home/josh434/docker_files/`
- Media on Terramaster: `/mnt/music`, `/mnt/movies`, `/mnt/tv`
- Internal SSD: `/mnt/nas`

## Disk Space (Agent Server 10.1.1.37)

158GB disk. Major consumers:
- `/home/josh434` — 55GB (projects, paperclip 1.9GB, hermesoriginalwebsite 1.3GB, cel-ast-research 1.3GB)
- `/snap` — 13GB (Firefox, GNOME, Chromium, Obsidian, Mesa)
- `/var/lib/snapd` — 5.3GB (snap packages data)
- `/tmp` — 4.9GB (build artifacts — leave alone)
- `/var/log` — was ~1.4GB, cleaned down
- Docker images — ~13GB (all active services)
