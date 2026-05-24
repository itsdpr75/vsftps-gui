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

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (content) => ipcRenderer.invoke('write-config', content),
  serviceAction: (action) => ipcRenderer.invoke('service', action),
  listUsers: () => ipcRenderer.invoke('list-users'),
  addUser: (username, password) => ipcRenderer.invoke('add-user', username, password),
  changePassword: (username, password) => ipcRenderer.invoke('change-password', username, password),
  readUserlist: () => ipcRenderer.invoke('read-userlist'),
  writeUserlist: (users) => ipcRenderer.invoke('write-userlist', users),
  readLog: () => ipcRenderer.invoke('read-log'),
  createBackup: () => ipcRenderer.invoke('create-backup'),
  restoreBackup: (filename) => ipcRenderer.invoke('restore-backup', filename),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  readListFile: (path) => ipcRenderer.invoke('read-list-file', path),
  writeListFile: (path, lines) => ipcRenderer.invoke('write-list-file', path, lines),
  listDir: (dirPath) => ipcRenderer.invoke('list-dir', dirPath),
  createDir: (dirPath) => ipcRenderer.invoke('create-dir', dirPath),
  deletePath: (filePath) => ipcRenderer.invoke('delete-path', filePath),
  renamePath: (oldPath, newPath) => ipcRenderer.invoke('rename-path', oldPath, newPath),
  copyPath: (src, dst) => ipcRenderer.invoke('copy-path', src, dst),
  movePath: (src, dst) => ipcRenderer.invoke('move-path', src, dst),
  chmodPath: (filePath, mode) => ipcRenderer.invoke('chmod-path', filePath, mode),
  chownPath: (filePath, user, group) => ipcRenderer.invoke('chown-path', filePath, user, group),
  openInFileManager: (dirPath) => ipcRenderer.invoke('open-in-file-manager', dirPath),
  readSettings: () => ipcRenderer.invoke('read-settings'),
  writeSettings: (settings) => ipcRenderer.invoke('write-settings', settings),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
});
