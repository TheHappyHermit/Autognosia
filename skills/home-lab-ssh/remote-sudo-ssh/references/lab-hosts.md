# Lab host sudo facts (Josh's home lab)

| Host | Role | SSH key (`~/.ssh/`) | Sudo | Notes |
|---|---|---|---|---|
| 10.1.1.10 | Main server / KVM hypervisor, NAS + media mounts | `id_ed25519_home_lab` | **NOPASSWD** (`/etc/sudoers.d/josh434-nogpass`: kill,pkill,nvidia-smi,docker,systemctl,reboot) | Plain `ssh ... 'sudo cmd'` works. Samba `[nas]` share guest-accessible. |
| 10.1.1.37 | hermes-vm (always-on server Hermes) | `id_ed25519_agent_server` | Password required on host | NAS mount kept alive by docker container `nas-mount-keeper` instead of sudo. |
| 10.1.1.18 | DragonOS / Agent Zero (radio/SDR/hacking KB) | `id_ed25519_agent_zero` | **Password required** — no NOPASSWD entry | Use the background-PTY + poll + submit dance. |

## Password
Lab sudo password: `J1234osh$`. Also stored in Hermes `.env` as `SUDO_PASSWORD='J1234osh$'` (set 2026-08-22; backup at `.env.bak-20260822-sudo`). **Note:** the `.env` value is for local/paramiko use — it does NOT get injected through SSH, so remote sudo still needs the PTY+submit dance.

## Suggested (not yet done)
If .18 root work becomes frequent, add a scoped NOPASSWD entry there too:
```
josh434 ALL=(ALL) NOPASSWD: /usr/bin/tar, /usr/bin/find, /bin/cat, /usr/bin/chmod, /usr/bin/du
```
Then plain `ssh ... 'sudo tar ...'` works with no dance. Requires user approval first (never change hosts without explicit go-ahead).
