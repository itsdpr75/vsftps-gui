# Architecture

## Overview

vsftpd-gui is an Electron application with a single-window, single-page layout. The UI is rendered with vanilla HTML/CSS/JS (no frameworks). All privileged operations (config writes, service control, user management, file ops) go through `pkexec`.

## Process Model

```
┌─────────────────────────────────────────────┐
│              main.js (Node.js)               │
│  ┌─────────────────────────────────────────┐ │
│  │           IPC Handlers                  │ │
│  │  read-config  write-config  service    │ │
│  │  list-users   add-user     chpasswd    │ │
│  │  list-dir     file-crud    read-log    │ │
│  │  backup-*     open-fm      settings-*  │ │
│  └─────────────────────────────────────────┘ │
│  Electron: BrowserWindow, ipcMain, dialog     │
└────────────────────┬────────────────────────┘
                     │ contextBridge
┌────────────────────▼────────────────────────┐
│           preload.js (sandboxed)             │
│  exposeInMainWorld('api', { ... })           │
└────────────────────┬────────────────────────┘
                     │ window.api.*
┌────────────────────▼────────────────────────┐
│          src/index.html (Chromium)           │
│  ┌──────────┬──────┬──────┬──────┬────────┐ │
│  │ Config   │Serv. │Users │ Logs │ Files  │ │
│  │ Editor   │ Ctrl │ Mgmt │ View │ Explor │ │
│  └──────────┴──────┴──────┴──────┴────────┘ │
│  Settings modal | Backup panel | Status bar   │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

### pkexec for Privileged Operations
- **Writes** (config save, service start/stop, user add, file writes): wrapped in `pkexec sh -c "echo BASE64 | base64 -d > target"`
- **Reads** (config, userlist, logs): `execSync('cat ...')` without pkexec (files are world-readable)
- **File listing**: `fs.readdirSync` + `fs.statSync` (not `ls -la` parsing) for correct handling of filenames with spaces

### Configuration Flow
1. `main.js` reads `/etc/vsftpd.conf` via `execSync('cat')`
2. Config is parsed line-by-line in `config-schema.js`, matched against known option definitions
3. Each category renders its options in `config-editor.js` with type-appropriate inputs
4. On save, values are serialized back to vsftpd.conf format, base64-encoded, and written via pkexec

### Service Control
- Uses `systemctl is-active vsftpd` for status (pkexec-free read)
- Start/stop/restart via `pkexec systemctl <action> vsftpd`
- Status auto-refreshes every 5 seconds in `service-control.js`
- Status bar also shows active/inactive with color indicator

### User Management
- Lists all system users with UID ≥ 1000
- Add user: `pkexec useradd -m <username> && pkexec passwd <username>`
- Change password: `pkexec passwd <username>`
- Reads `userlist_enable` and `userlist_deny` settings to show FTP access status per user

### File Explorer
- Anonymous FTP root read from `anon_root` (or `/srv/ftp` default)
- Per-user homes listed from `/home`
- Tree sidebar renders directory hierarchy on click
- File table lists contents with icons per file type (image, audio, video, archive, code, etc.)
- Context menu: copy/cut/paste (clipboard buffer in `file-ops.js`), rename, delete, mkdir, chmod, chown, open in system file manager (`xdg-open`)

### i18n
- System locale detected via `app.getLocale()` in main.js (or env vars)
- JSON translation files in `locales/`
- `t(key)` function looks up current locale, falls back to key
- Dynamic DOM updates via `data-i18n` attributes

### Theming
- CSS custom properties in `:root` / `[data-theme="dark"]`
- Variables: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--accent-color`, etc.
- Dark/light toggle + accent color picker persisted in `vsftpdgui.json`
- Applied via JS in `theme.js` by setting `document.documentElement.style`

## CSS Variables

| Variable | Purpose |
|---|---|
| `--bg-primary` | Main background |
| `--bg-secondary` | Sidebar, cards |
| `--bg-tertiary` | Hovered items |
| `--bg-card` | Modal/panel backgrounds |
| `--text-primary` | Body text |
| `--text-secondary` | Muted text |
| `--text-muted` | Placeholder, disabled |
| `--border-color` | Borders, dividers |
| `--accent-color` | Primary action color |
| `--accent-hover` | Accent hover state |
| `--success-color` | Success indicators |
| `--warning-color` | Warning indicators |
| `--danger-color` | Error/danger |
| `--radius` | Border radius |
| `--sidebar-width` | Sidebar width (170px) |
| `--status-height` | Status bar height |
