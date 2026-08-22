---
name: ssh-key-setup-troubleshooting
description: Step-by-step guide for setting up SSH key-based authentication and troubleshooting connection issues to remote servers
category: devops
---

# SSH Key Setup and Troubleshooting for Remote Server Access

## When to Use This Skill
Use this skill when you need to:
- Set up SSH key-based authentication for remote server access
- Troubleshoot SSH connection issues (connection refused, timeout, permission denied, host key verification)
- Configure SSH client for multiple hosts with different keys
- Help users establish secure remote connections from Windows/macOS/Linux

## Prerequisites
- Access to a terminal/command line
- Private SSH key provided by server administrator
- Target server IP address or hostname
- Username for the remote server

## Step-by-Step Setup (Windows PowerShell Example)

### 1. Create .ssh Directory
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
```

### 2. Save Private Key
```powershell
@'
-----BEGIN OPENSSH PRIVATE KEY-----
[YOUR_PRIVATE_KEY_HERE]
-----END OPENSSH PRIVATE KEY-----
'@ | Set-Content "$env:USERPROFILE\.ssh\your_server_key" -Encoding ASCII
```

### 3. Set Proper Permissions (CRITICAL)
```powershell
icacls "$env:USERPROFILE\.ssh\your_server_key" /inheritance:r /grant:r "${env:USERNAME}:R"
```

### 4. Create SSH Config File
```powershell
@'
Host your-server-alias
    HostName your.server.ip.address
    User your_username
    IdentityFile ${HOME}/.ssh/your_server_key
    ServerAliveInterval 60
'@ | Set-Content "$env:USERPROFILE\.ssh\config" -Encoding ASCII
```

### 5. Test Connection
```powershell
ssh -v your-server-alias
```

## Cross-Platform Commands

### macOS/Linux Equivalent Steps:
```bash
# Create .ssh directory
mkdir -p ${HOME}/.ssh

# Save private key (paste key content)
cat > ${HOME}/.ssh/your_server_key << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
[YOUR_PRIVATE_KEY_HERE]
-----END OPENSSH PRIVATE KEY-----
EOF

# Set permissions (Linux/macOS requires 600)
chmod 600 ${HOME}/.ssh/your_server_key

# Create SSH config
cat > ${HOME}/.ssh/config << EOF
Host your-server-alias
    HostName your.server.ip.address
    User your_username
    IdentityFile ${HOME}/.ssh/your_server_key
    ServerAliveInterval 60
EOF

# Test connection
ssh -v your-server-alias
```

## Common SSH Connection Issues and Solutions

### 1. "Connection reset by peer" or "Connection refused"
- **Cause**: Server not accepting SSH connections (wrong port, SSH service not running, firewall blocking)
- **Solution**:
  - Verify server is running and accessible (`ping` or provider console check)
  - Confirm SSH port (default 22) is open in server's firewall/security groups
  - Check if SSH service is running on remote server (`sudo systemctl status ssh`)

### 2. "Host key verification failed."
- **Cause**: First-time connection or host key changed
- **Solution**:
  - For first-time connection: Type `yes` when prompted
  - If warned about changed key: Remove old key with `ssh-keygen -R hostname-or-ip`
  - **Security note**: Only proceed if you trust the server

### 3. "Permission denied (publickey)"
- **Cause**: Key permissions wrong, wrong key, or key not authorized on server
- **Solution**:
  - Verify private key permissions (600 on Linux/macOS, restricted to user on Windows)
  - Ensure you're using the correct private key that matches the server's authorized_keys
  - Check server's `${HOME}/.ssh/authorized_keys` contains your public key
  - Try verbose mode: `ssh -v` to see which keys are being offered

### 4. Timeout or no response
- **Cause**: Network connectivity, wrong IP/hostname, or server inaccessible
- **Solution**:
  - Verify IP address/hostname is correct
  - Test network connectivity (`ping` or `telnet ip 22`)
  - Check local and remote firewalls
  - Verify server is in running state (not stopped/paused)

## Verification Steps After Connection

Once connected, verify you're on the correct server:
```bash
# Check system info
hostnamectl
uname -a

# Check web server status (if applicable)
systemctl status nginx   # or apache2
systemctl status httpd   # on CentOS/RHEL

# Typical website locations
ls -la /var/www/html/
ls -la /srv/www/
ls -la /usr/share/nginx/html/
```

## Safety Notes
- Never share private keys via chat, email, or insecure channels
- Private keys should remain on your local machine only
- Consider using `ssh-agent` for managing multiple keys
- Regularly audit `${HOME}/.ssh/authorized_keys` on servers
- Disable password authentication on servers when possible (use key-only auth)

## Troubleshooting Workflow
1. **Verify server accessibility** (ping/provider console)
2. **Check SSH service status** on server
3. **Validate key permissions** locally
4. **Test with verbose output** (`ssh -v`)
5. **Verify key matches server** (check authorized_keys)
6. **Check firewall/security groups** (provider and local)
7. **Try alternative username** if default doesn't work

This approach provides a reliable, repeatable method for establishing SSH access while emphasizing security best practices.