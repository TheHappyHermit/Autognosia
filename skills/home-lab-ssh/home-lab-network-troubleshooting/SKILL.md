---
name: home-lab-network-troubleshooting
description: Find moved or down home lab hosts after reboots.
---

# Home Lab Network Troubleshooting

Diagnose "host X not responding" in Josh's 10.1.1.0/24 lab without touching hardware. Validated workflow (2026-08-20: main server silently moved .10 → .52 after a router reboot; this sequence found it in ~3 minutes).

## Key topology facts
- **Agent Zero / Radio (10.1.1.18)** is the reference host — long uptime, always on. Run all diagnostics FROM here via `ssh -i ~/.ssh/id_ed25519_agent_zero josh434@10.1.1.18`.
- The **"Agent Server" (was 10.1.1.37) is a KVM guest named `Josh_Agent` on the main server**, not separate hardware. If it's unreachable, first check whether its QEMU process exists on the hypervisor — it may be running fine with no usable IP.
- All lab IPs are **DHCP-assigned and shift after router reboots**. Static IPs in other skills go stale; treat them as "last known".

## Step 1 — L2 vs L3 triage from the reference host
```bash
ssh -i ~/.ssh/id_ed25519_agent_zero josh434@10.1.1.18 \
  'ping -c 3 -W 2 <ip>; ip neigh | grep "10\.1\.1\."'
```
Interpret `ip neigh` state:
| State | Meaning | Next move |
|---|---|---|
| `FAILED` / no entry | No L2 answer — powered off, NIC/link down, or **IP moved** (ARP for old IP never resolves) | Step 2 sweep; check hypervisor if it's a VM |
| `REACHABLE`, ping OK but SSH times out | Host up, port 22 filtered/slow | Wait + retry; check guest firewall |
| `REACHABLE`, ping OK, SSH refused | Up and reachable — just re-authenticate | Done |

A host mid-boot answers ARP within seconds-to-a-minute. Still FAILED after ~2 min = not a slow boot.

## Step 2 — Subnet sweep (find what's alive)
```bash
ssh -i ~/.ssh/id_ed25519_agent_zero josh434@10.1.1.18 \
  'for i in $(seq 1 254); do (ping -c 1 -W 1 10.1.1.$i >/dev/null 2>&1 && echo $i) & done; wait' | sort -n
```
~30s for a /24. Expect noise: gateway (.1), IoT, phones.

## Step 3 — Port-probe the candidates
```bash
ssh ... josh434@10.1.1.18 'for i in <candidates>; do (timeout 2 bash -c "cat < /dev/null > /dev/tcp/10.1.1.$i/22") 2>/dev/null && echo "$i: ssh OPEN"; done'
```
**Pitfall:** wrap the whole remote script in SINGLE quotes and keep `$` expansions inside it. Double-quoted nesting mangles `/dev/tcp/$ip/$p` (the outer shell eats the vars) — this silently produced an empty scan once.

## Step 4 — Fingerprint which machine moved (SSH keys are the MAC of identity)
Try each known key against the new IP with `BatchMode=yes`; the one that authenticates tells you exactly which host it is:
```bash
for k in id_ed25519_home_lab id_ed25519_agent_server id_ed25519_agent_zero; do
  ssh -i ~/.ssh/$k -o ConnectTimeout=5 -o BatchMode=yes josh434@<new-ip> "hostname; uptime"
done
```
`uptime` confirms it's the post-reboot instance (fresh minutes, not a stale twin).

## Hypervisor check (when a VM is "down")
On the main server: `ps aux | grep qemu-system-x86_64 | grep -v grep` — each running guest shows as one process with `-name guest=<VM>`. **Pitfall:** `virsh list --all` can show an EMPTY table while QEMU processes are clearly running (libvirt state desync after host reboot). Cross-check both; the ps output is ground truth for "is it actually executing". A VM that's running but unreachable = DHCP/network issue inside or at the router, not a dead guest.

## Reporting
Tell the user: which hosts are up/down with evidence (ARP state, uptime), what moved where, and that IPs will keep shifting until the router's DHCP leases settle — offer to re-scan after their fix rather than hard-coding new IPs into skills.
