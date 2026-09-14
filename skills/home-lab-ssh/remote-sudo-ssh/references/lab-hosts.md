# Lab host sudo facts (Josh's home lab)

|| Host | Role | SSH key (`~/.ssh/`) | Sudo | Notes |
||---|---|---|---|---|
|| 10.1.1.10 | Main server / KVM hypervisor, NAS + media mounts | `id_ed25519_home_lab` | **NOPASSWD** (`/etc/sudoers.d/home_user-nogpass`: kill,pkill,nvidia-smi,docker,systemctl,reboot) | Plain `ssh ... 'sudo cmd'` works. Samba `[nas]` share guest-accessible. |
|| 10.1.1.37 | hermes-vm (always-on server Hermes) | `id_ed25519_agent_server` | Password required on host | NAS mount kept alive by docker container `nas-mount-keeper` instead of sudo. |
|| 10.1.1.18 | DragonOS / Agent Zero (radio/SDR/hacking KB) | `id_ed25519_agent_zero` | **Password required** — no NOPASSWD entry | SSH key deployed 2026-09-13. Use for passwordless login to home_user@10.1.1.18. Sudo still needs password + PTY dance. Agent Zero: Docker container `agent-zero` (image `agent0ai/agent-zero:latest`, updated to v2.12-16-g8426c137 via self-update on 2026-09-13; Docker image tag still `d8fd86114b02`/2 months old — code updated in-place via git), bind mount `/home/home_user/agent-zero/agent-zero/usr` → `/a0/usr`, port `50080→80`. Data: 34 chats, 13 plugins, agents, knowledge base, obsidian vault, workdir. Config: `settings.json`, `secrets.env`, `.env` (API keys). Backup: `usr-backup-manual.tar.gz` (34MB, root-owned SDR files skipped). **Update procedure (verified 2026-09-13):** |
|1. Trigger self-update inside container: `docker exec agent-zero /opt/venv-a0/bin/python /exe/self_update_manager.py trigger-update ready latest` |
|2. Restart container: `docker restart agent-zero` |
|3. Self-update manager handles: stash user changes, backup `/a0/usr` to `/root/update-backups/usr-YYYYMMDD-HHMMSS.zip`, git fetch from `https://github.com/agent0ai/agent-zero.git`, checkout `ready` branch at latest tag (v2.12-16-g8426c137), run `prepare.py` to install deps (json-repair, patchright, etc.), start UI, health check passes, drop stash. |
|4. Verify: `curl http://localhost:50080/` returns 302, `docker logs agent-zero` shows "Update succeeded". |
|5. **`docker pull agent0ai/agent-zero:latest` does NOT work** — stuck on "Pulling fs layer" indefinitely (Docker Hub registry issue on this host). Do NOT use it. Use the self-update mechanism instead. |
|**Note:** The Docker image tag (`d8fd86114b02`) is not updated by self-update — the running container has the new code but if the container is ever removed+recreated it would boot the old image. A future fix would be to update the image tag after self-update, or use a different update path. |

## Password

Lab sudo password is stored in the Hermes `.env` as `SUDO_PASSWORD` (set 2026-08-22; backup at `.env.bak-20260822-sudo`). **Never hardcode passwords in skills.** All code examples must read from `os.environ.get("SUDO_PASSWORD")` or equivalent env var. The `.env` value is for local/paramiko use — it does NOT get injected through SSH, so remote sudo still needs the PTY+submit dance.

For programmatic/paramiko access, use: `os.environ.get("SUDO_PASSWORD")`.

## Suggested (not yet done)

If .18 root work becomes frequent, add a scoped NOPASSWD entry there too:

```
home_user ALL=(ALL) NOPASSWD: /usr/bin/tar, /usr/bin/find, /bin/cat, /usr/bin/chmod, /usr/bin/du
```

Then plain `ssh ... 'sudo tar ...'` works with no dance. Requires user approval first (never change hosts without explicit go-ahead).
