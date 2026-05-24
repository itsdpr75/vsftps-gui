// vsftpd-gui — Visual FTP Server Manager
// Copyright (C) 2024
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, exec } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'vsftpdgui');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'vsftpdgui.json');
const BACKUPS_DIR = path.join(CONFIG_DIR, 'backups');
const VSFTPD_CONF = '/etc/vsftpd.conf';

let mainWindow;

function ensureDirs() {
  [CONFIG_DIR, BACKUPS_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function pkexec(cmd) {
  try {
    const escaped = cmd.replace(/"/g, '\\"');
    const result = execSync(`pkexec sh -c "${escaped}" 2>&1`, {
      encoding: 'utf-8',
      timeout: 30000
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

function readFile(path) {
  try {
    const out = execSync(`cat "${path}" 2>/dev/null || true`, { encoding: 'utf-8', timeout: 5000 });
    return out.trim();
  } catch {
    return '';
  }
}

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (_) {}
  return getDefaultSettings();
}

function writeSettings(settings) {
  ensureDirs();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function getDefaultSettings() {
  return {
    lang: 'es',
    theme: 'dark',
    accentColor: '#3b82f6',
    backup: {
      enabled: false,
      directory: BACKUPS_DIR,
      intervalHours: 24,
      maxBackups: 10
    },
    window: { width: 1100, height: 750, x: null, y: null }
  };
}

function createWindow() {
  const settings = readSettings();

  mainWindow = new BrowserWindow({
    width: settings.window.width,
    height: settings.window.height,
    x: settings.window.x,
    y: settings.window.y,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    frame: true,
    title: 'vsftpd GUI',
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    const s = readSettings();
    s.window = { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y };
    writeSettings(s);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('read-config', async () => {
  return readFile(VSFTPD_CONF);
});

ipcMain.handle('write-config', async (_event, content) => {
  const b64 = Buffer.from(content, 'utf-8').toString('base64');
  const result = pkexec(`echo "${b64}" | base64 -d > "${VSFTPD_CONF}"`);
  return result;
});

ipcMain.handle('service', async (_event, action) => {
  if (action === 'status') {
    try {
      const out = execSync('systemctl status vsftpd 2>&1', { encoding: 'utf-8', timeout: 10000 });
      return { success: true, output: out.trim() };
    } catch (err) {
      return { success: true, output: err.stdout || err.message };
    }
  }
  const result = pkexec(`systemctl ${action} vsftpd`);
  return result;
});

ipcMain.handle('list-users', async () => {
  try {
    const out = execSync('getent passwd', { encoding: 'utf-8', timeout: 5000 });
    const users = out.trim().split('\n').filter(Boolean).map(line => {
      const [user, _p, uid, gid, name, home, shell] = line.split(':');
      return { user, uid: parseInt(uid), gid: parseInt(gid), name, home, shell };
    });
    return users;
  } catch {
    return [];
  }
});

ipcMain.handle('read-userlist', async () => {
  try {
    const u = execSync('grep -s "^userlist_file=" /etc/vsftpd.conf || echo ""', { encoding: 'utf-8' });
    const filePath = u.split('=')[1]?.trim() || '/etc/vsftpd.userlist';
    const content = readFile(filePath);
    return content ? content.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
});

ipcMain.handle('write-userlist', async (_event, users) => {
  try {
    const u = execSync('grep -s "^userlist_file=" /etc/vsftpd.conf || echo ""', { encoding: 'utf-8' });
    const filePath = u.split('=')[1]?.trim() || '/etc/vsftpd.userlist';
    const content = users.join('\n') + '\n';
    const b64 = Buffer.from(content, 'utf-8').toString('base64');
    const result = pkexec(`echo "${b64}" | base64 -d > "${filePath}"`);
    return result;
  } catch {
    return { success: false, output: 'Error writing userlist' };
  }
});

ipcMain.handle('read-list-file', async (_event, filePath) => {
  const content = readFile(filePath);
  return content ? content.split('\n').filter(Boolean) : [];
});

ipcMain.handle('write-list-file', async (_event, filePath, lines) => {
  const content = lines.join('\n') + '\n';
  const b64 = Buffer.from(content, 'utf-8').toString('base64');
  return pkexec(`echo "${b64}" | base64 -d > "${filePath}"`);
});

ipcMain.handle('add-user', async (_event, username, password) => {
  const result = pkexec(`useradd -m -s /bin/bash ${username} && echo "${username}:${password}" | chpasswd`);
  return result;
});

ipcMain.handle('change-password', async (_event, username, password) => {
  const tmp = `/tmp/vsftpd-pass.tmp`;
  fs.writeFileSync(tmp, `${username}:${password}`, 'utf-8');
  const result = pkexec(`chpasswd < "${tmp}" && rm -f "${tmp}"`);
  return result;
});

ipcMain.handle('read-log', async () => {
  try {
    const confContent = readFile(VSFTPD_CONF);
    const lines = confContent ? confContent.split('\n') : [];
    let logFile = '/var/log/vsftpd.log';
    for (const l of lines) {
      if (l.startsWith('vsftpd_log_file=')) logFile = l.split('=')[1].trim();
      if (l.startsWith('xferlog_file=')) logFile = l.split('=')[1].trim();
    }
    return readFile(logFile).split('\n').slice(-200).join('\n');
  } catch {
    return '';
  }
});

ipcMain.handle('create-backup', async () => {
  ensureDirs();
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dest = path.join(BACKUPS_DIR, `vsftpd.conf.${ts}`);
  const result = pkexec(`cp "${VSFTPD_CONF}" "${dest}" && chown ${process.env.USER} "${dest}"`);
  return result;
});

ipcMain.handle('restore-backup', async (_event, filename) => {
  const src = path.join(BACKUPS_DIR, filename);
  const result = pkexec(`cp "${src}" "${VSFTPD_CONF}" && systemctl restart vsftpd`);
  return result;
});

ipcMain.handle('list-backups', async () => {
  try {
    ensureDirs();
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('vsftpd.conf.'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUPS_DIR, f));
        return { name: f, size: stat.size, date: stat.mtime.toISOString() };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    return files;
  } catch {
    return [];
  }
});

ipcMain.handle('read-settings', async () => readSettings());

ipcMain.handle('write-settings', async (_event, settings) => {
  writeSettings(settings);
  return { success: true };
});

function modeToStr(mode) {
  const types = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
  return (mode & 0x4000 ? 'd' : '-')
    + types[(mode >> 6) & 7]
    + types[(mode >> 3) & 7]
    + types[mode & 7];
}

ipcMain.handle('list-dir', async (_event, dirPath) => {
  try {
    const names = fs.readdirSync(dirPath);
    const entries = names
      .filter(n => n !== '.' && n !== '..')
      .map(name => {
        try {
          const fullPath = path.join(dirPath, name);
          const stat = fs.statSync(fullPath);
          const type = stat.isDirectory() ? 'dir' : 'file';
          const permStr = modeToStr(stat.mode);
          return {
            name,
            fullPath,
            type,
            size: stat.size,
            perms: permStr,
            owner: stat.uid.toString(),
            group: stat.gid.toString(),
            mtime: stat.mtime.toLocaleDateString() + ' ' + stat.mtime.toLocaleTimeString(),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    return entries;
  } catch { return []; }
});

ipcMain.handle('create-dir', async (_event, dirPath) => {
  return pkexec(`mkdir -p "${dirPath}"`);
});

ipcMain.handle('delete-path', async (_event, filePath) => {
  return pkexec(`rm -rf "${filePath}"`);
});

ipcMain.handle('rename-path', async (_event, oldPath, newPath) => {
  return pkexec(`mv "${oldPath}" "${newPath}"`);
});

ipcMain.handle('copy-path', async (_event, src, dst) => {
  return pkexec(`cp -r "${src}" "${dst}"`);
});

ipcMain.handle('move-path', async (_event, src, dst) => {
  return pkexec(`mv "${src}" "${dst}"`);
});

ipcMain.handle('chmod-path', async (_event, filePath, mode) => {
  return pkexec(`chmod -R "${mode}" "${filePath}"`);
});

ipcMain.handle('chown-path', async (_event, filePath, user, group) => {
  const g = group ? `:${group}` : '';
  return pkexec(`chown -R "${user}${g}" "${filePath}"`);
});

ipcMain.handle('open-in-file-manager', async (_event, dirPath) => {
  const DE = (process.env.XDG_CURRENT_DESKTOP || '').toLowerCase();
  const fmMap = {
    kde: 'dolphin', gnome: 'nautilus', xfce: 'thunar',
    cinnamon: 'nemo', mate: 'caja', deepin: 'dde-file-manager',
    budgie: 'nautilus', lxqt: 'pcmanfm-qt', lxde: 'pcmanfm',
  };
  let cmd = fmMap[DE] || 'xdg-open';
  exec(`"${cmd}" "${dirPath}" >/dev/null 2>&1 &`);
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});
