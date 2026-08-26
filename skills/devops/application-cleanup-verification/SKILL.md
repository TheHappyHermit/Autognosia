---
name: application-cleanup-verification
description: Systematic approach to verify complete removal of an application from a system, including checking for running processes, services, files, packages, and distinguishing between actual remnants vs. false positives (like library assets).
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [cleanup, verification, application-removal, system-admin, troubleshooting]
    related_skills: [systematic-debugging, safe-ssh-troubleshooting, honcho-docker-setup]
---

# Application Cleanup Verification

## Overview

When removing an application, it's important to verify it's completely removed from the system. This skill provides a systematic approach to:
1. Check for running processes
2. Check for services/daemons
3. Search for files and directories
4. Check installed packages
5. Investigate findings to distinguish real remnants from false positives
6. Safely remove confirmed remnants
7. Document findings for the user

## When to Use

Use this skill when:
- You've uninstalled an application and want to verify complete removal
- You need to clean up after a failed installation
- You're preparing a system for reuse
- You suspect leftover components might cause conflicts
- You want to ensure no traces remain before repurposing a system

## The Verification Process

### Phase 1: Initial Broad Search

**Search for files and directories:**
```bash
# Search by filename (case-insensitive)
find / -type f -iname "*applicationname*" 2>/dev/null | grep -v "Permission denied"

# Search by filename (case-sensitive)
find / -type f -name "*applicationname*" 2>/dev/null | grep -v "Permission denied"

# Search in common installation locations
find /opt /usr/local /home -type f -name "*applicationname*" 2>/dev/null
```

**Search file contents:**
```bash
# Search for application name in file contents
grep -r "applicationname" /etc /usr/local /opt 2>/dev/null | head -20
```

### Phase 2: Process and Service Check

**Check running processes:**
```bash
ps aux | grep -i applicationname | grep -v grep
```

**Check systemd services:**
```bash
systemctl list-units --all | grep -i applicationname
systemctl list-unit-files | grep -i applicationname
```

**Check init.d/System V services (if applicable):**
```bash
ls /etc/init.d/* | grep -i applicationname
ls /etc/rc*.d/* | grep -i applicationname
```

### Phase 3: Package and Installation Check

**Check package managers:**
```bash
# Debian/Ubuntu
dpkg -l | grep -i applicationname
apt list --installed | grep -i applicationname

# RHEL/CentOS/Fedora
rpm -qa | grep -i applicationname
yum list installed | grep -i applicationname
dnf list installed | grep -i applicationname

# Arch Linux
pacman -Q | grep -i applicationname

# General (if unsure)
pip list | grep -i applicationname
npm list -g | grep -i applicationname
```

### Phase 4: Container and Virtualization Check

**Check Docker containers:**
```bash
docker ps -a | grep -i applicationname
docker images | grep -i applicationname
```

**Check other container/runtimes (if applicable):**
```bash
# Podman
podman ps -a | grep -i applicationname
podman images | grep -i applicationname

# Kubernetes (if applicable)
kubectl get pods --all-namespaces | grep -i applicationname
```

### Phase 5: Investigation and Validation

**For each finding, determine if it's:**
- Actual application remnant → Remove
- False positive (library asset, shared dependency) → Investigate before removing
- Configuration/data that should be preserved → Ask user

**Key questions to ask:**
- Is this file part of the application being removed, or a shared library?
- Does removing this break other applications?
- Is this user data or configuration that should be backed up?
- What package does this file belong to? (Use `dpkg -S filename` or `rpm -qf filename`)

### Phase 6: Safe Removal

**Only remove confirmed remnants:**
```bash
# Remove files (with verification first)
rm -i /path/to/confirmed/file

# Remove directories (with verification first)
rm -ri /path/to/confirmed/directory

# Stop and disable services
systemctl stop servicename
systemctl disable servicename
systemctl daemon-reload

# Remove packages
apt purge packagename   # Debian/Ubuntu
yum remove packagename  # RHEL/CentOS
dnf remove packagename  # Fedora
pacman -R packagename   # Arch
```

### Phase 7: Final Verification

**Repeat Phase 1-3 checks to confirm removal:**
- No running processes
- No services
- No files/directories (except intentional backups/user data)
- No packages

## Red Flags and False Positives

**Common false positives to investigate before removing:**
- Files in `/usr/lib`, `/lib`, `/usr/lib64` → Likely shared libraries
- Files in `/usr/share` → Often icons, documentation, or shared assets
- Files in node_modules, venv, or similar dependency directories
- Files with generic names that happen to match (e.g., "config", "log", "data")
- Files that belong to other packages (check package ownership)

**Examples of false positives encountered:**
- SVG icon files from pdfjs-dist library (annotation-the workspace app.svg) - part of PDF.js, not the application
- Log files in /tmp - safe to remove as they're temporary
- Files in home directories that are user data or configs

## Documentation and Communication

**Always provide clear feedback to the user:**
1. What was searched
2. What was found (with categorization: actual remnant vs. false positive)
3. What was removed (with confirmation)
4. What was left intentionally (and why)
5. Any recommendations for follow-up

**Example communication:**
```
✅ Application cleanup verification complete:

SEARCHED:
- Filesystem for "*the workspace app*" patterns
- Running processes
- Systemd services
- Installed packages (pip, apt)
- Docker containers

FOUND:
- /tmp/the workspace app.log (log file - safe to remove)
- /tmp/the workspace app-startup.log (log file - safe to remove)
- /home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/node_modules/pdfjs-dist/*/annotation-the workspace app.svg (PDF.js icon asset - FALSE POSITIVE, part of legitimate dependency)
- No running processes, services, or packages found

REMOVED:
- /tmp/the workspace app.log
- /tmp/the workspace app-startup.log

LEFT IN PLACE:
- PDF.js annotation-the workspace app.svg files (legitimate OpenClaw/pdfjs-dist dependency)
- Reason: Removing would break PDF annotation functionality in OpenClaw or similar tools

VERIFICATION: No remaining the workspace app application components detected.
```

## Integration with Other Skills

- Use with `systematic-debugging` when troubleshooting removal issues
- Combine with `honcho-docker-setup` when verifying Docker-based applications
- Use `safe-ssh-troubleshooting` if checking remote systems via SSH
- Can be invoked via `delegate_task` for parallel verification on multiple systems

## Safety Notes

**ALWAYS:**
- Verify file ownership before removal
- Check if files are claimed by other packages
- Back up user data/configuration before removal
- Use interactive prompts (`rm -i`) when unsure
- Document what you're removing and why
- Leave false positives in place unless user explicitly requests removal

**NEVER:**
- Remove files without investigating their purpose
- Assume similarly named files are from the same application
- Remove files in system directories without verification
- Remove user data without explicit permission
---