# Usage Guide

## Getting Started

Run from the project directory:

```bash
pnpm start
```

The window opens directly to the **Configuration** tab. No other setup required.

## Configuration Editor

The first tab provides a visual editor for `/etc/vsftpd.conf`. Options are grouped into 10 categories:

| Category | Description |
|---|---|
| General | Daemon, listen addresses, PID file |
| Authentication | Anonymous enable, local enable, PAM |
| Access Control | userlist, chroot, write_enable |
| Anonymous | anon_upload, anon_mkdir, anon_other perms |
| Local Users | Local umask, local_root, chroot settings |
| Network | Ports, pasv range, listen address |
| SSL/TLS | SSL cert/key paths, TLS versions |
| Limits & Performance | Max clients, max per IP, bandwidth |
| Logging | xferlog, vsftpd_log, log paths |
| Advanced | ASCII, ls_recurse, async_abort |

### List Editors

Options like `userlist_file` or `chroot_list_file` show a visual table where you can:
- Add users from a picker (lists system users with UID, Home, Shell)
- Remove users from the list
- Toggle between allow/deny mode

### Saving

Click **Apply** to write the config and reload vsftpd. pkexec will ask for your password.

## Service Control

Buttons to Start / Stop / Restart vsftpd via systemctl.

Status indicator shows:
- **Green** — active
- **Red** — inactive
- **Orange** — error

Auto-refreshes every 5 seconds.

## User Management

Lists all system users with UID ≥ 1000. Shows:
- Username, UID, Home directory, Shell
- FTP access status (Yes/No based on userlist settings)

Actions:
- **Add user** — creates system user with home directory
- **Change password** — updates via passwd

## Log Viewer

Displays the last 200 lines of the configured log file (default: `/var/log/vsftpd.log`).

Features:
- **Pause/Resume** — stop auto-refresh to inspect
- **Filter** — type to search log contents
- **Auto-scroll** — follow new entries
- **Color coding** — CONNECTING (blue), LOGIN OK (green), FAIL (red), UPLOAD/DOWNLOAD (yellow)

## File Explorer ("Directorios")

### Tree Sidebar
- Shows anonymous FTP root (from `anon_root` or default `/srv/ftp`)
- Lists per-user home directories under `/home`
- Click to browse into directories

### File Table
Icons mapped by extension: images, audio, video, archives, code files, documents.

### Context Menu (right-click)
| Action | Description |
|---|---|
| Copy | Copy to clipboard buffer |
| Cut | Cut to clipboard buffer |
| Paste | Paste from buffer (if clipboard has content) |
| Duplicate | Copy file with `_copy` suffix |
| Rename | Modal rename dialog |
| Delete | Confirm then delete (skips trash) |
| New Folder | Create directory via modal |
| Change Permissions | chmod via modal input |
| Change Owner | chown via modal (user:group) |
| Open | Open with system default app (xdg-open) |

## Backup Manager

Located in the settings or dedicated section:
- **Create backup** — saves a timestamped copy of `/etc/vsftpd.conf` to `~/.config/vsftpdgui/backups/`
- **Restore** — selects a backup and restores it, reloads the config
- **Auto-backup** — configurable interval and max count in settings

## Settings (gear icon)

| Setting | Options |
|---|---|
| Language | Español, English |
| Theme | Dark, Light |
| Accent color | Presets + custom color picker |
| Backup directory | Path for storing backups |
| Auto backup interval | Hours between automatic backups |
| Max backups | Number of backups to retain |

## Configuration File

App settings are stored in `~/.config/vsftpdgui/vsftpdgui.json`:

```json
{
  "language": "es",
  "theme": "dark",
  "accentColor": "#4ea8de",
  "backupDir": "/home/user/.config/vsftpdgui/backups",
  "backupInterval": 24,
  "maxBackups": 10,
  "windowX": 100,
  "windowY": 100,
  "windowWidth": 1100,
  "windowHeight": 700
}
```

## Troubleshooting

### pkexec asks for password every time
This is normal — polkit does not cache credentials by default. You can configure polkit rules if desired.

### "Cannot find module 'electron'"
Ensure you ran `pnpm install` (or `pnpm install` if using pnpm).

### GL/EGL errors in terminal
These are Chromium warnings. The `--disable-gpu` flag in the start script silences most of them.

### Config not saved
Ensure:
- Your user has sudo/polkit privileges
- `/etc/vsftpd.conf` exists
- pkexec works: try `pkexec cat /etc/vsftpd.conf` in terminal

### Log viewer shows nothing
Check the log file path in your vsftpd.conf (`vsftpd_log_file` setting). Default path is `/var/log/vsftpd.log`.
