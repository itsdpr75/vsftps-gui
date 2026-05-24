# vsftpd-gui

Visual FTP Server Manager — Electron GUI for vsftpd.

## Features

- **Configuration editor** — Full vsftpd.conf visual editor with 10 categories, ~100 options, type-aware inputs (boolean, number, string, file path), visual list editors for `userlist_file` / `chroot_list_file`
- **Service control** — Start, stop, restart vsftpd via systemctl with live status refresh
- **User management** — List system users (UID ≥ 1000), add users, change passwords, integrated userlist toggle
- **Log viewer** — Real-time tail with pause/resume, filter, auto-scroll, color-coded log levels
- **File explorer** — FTP root tree sidebar + per-user home directories, context menu (copy/cut/paste/duplicate/rename/delete/mkdir/chmod/chown), open in system file manager
- **Backup manager** — Create, list, and restore copies of `/etc/vsftpd.conf`
- **i18n** — Spanish and English, auto-detected from system locale
- **Theming** — Dark/light mode, user-selectable accent color, persisted settings

## Requirements

- Linux with vsftpd installed
- `pkexec` (polkit) for privileged operations
- systemd (for service control)
- Node.js ≥ 18
- pnpm (recommended) or npm

## Install

```bash
git clone <repo-url> vsftpd-gui
cd vsftpd-gui
pnpm install
```

## Usage

```bash
pnpm start
```

The GUI will open. The first tab is the configuration editor. Navigate using the sidebar.

### Settings

Persisted in `~/.config/vsftpdgui/vsftpdgui.json`:
- Language (es/en)
- Theme (dark/light)
- Accent color
- Backup directory, interval, max count

## Project Structure

```
├── main.js              # Electron main process, IPC handlers
├── preload.js           # contextBridge API exposure
├── package.json
├── assets/fontawesome/  # Font Awesome 6 (local)
├── locales/
│   ├── es.json          # Spanish translations
│   └── en.json          # English translations
└── src/
    ├── index.html       # Single-page shell
    ├── css/styles.css   # Full theme via CSS variables
    └── js/
        ├── app.js            # Bootstrap
        ├── config-schema.js  # vsftpd option definitions
        ├── config-editor.js  # Visual config editor
        ├── service-control.js
        ├── user-manager.js
        ├── log-viewer.js
        ├── backup.js
        ├── settings.js       # App settings modal
        ├── sidebar.js        # Tab routing
        ├── status-bar.js     # Service status
        ├── storage.js        # Settings persistence
        ├── theme.js          # Dark/light + accent
        ├── i18n.js           # Translation engine
        ├── utils.js          # DOM helpers, toast
        └── files/
            ├── file-manager.js  # Tree sidebar, toolbar
            ├── file-listing.js  # File table, context menu
            ├── file-ops.js      # Clipboard, IPC wrappers
            └── file-icons.js    # Extension → icon mapping
```

## License

AGPL-3.0 — see [LICENSE](LICENSE).
