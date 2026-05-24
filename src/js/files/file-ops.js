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

const FileOps = {
  _clipboard: null,
  _isCut: false,

  async listDir(path) {
    try {
      return await window.api.listDir(path);
    } catch { return []; }
  },

  async createDir(path) {
    return await window.api.createDir(path);
  },

  async deletePath(path) {
    return await window.api.deletePath(path);
  },

  async renamePath(oldPath, newPath) {
    return await window.api.renamePath(oldPath, newPath);
  },

  async copyPath(src, dst) {
    return await window.api.copyPath(src, dst);
  },

  async movePath(src, dst) {
    return await window.api.movePath(src, dst);
  },

  async chmodPath(path, mode) {
    return await window.api.chmodPath(path, mode);
  },

  async chownPath(path, user, group) {
    return await window.api.chownPath(path, user, group);
  },

  copyToClipboard(path) {
    this._clipboard = path;
    this._isCut = false;
  },

  cutToClipboard(path) {
    this._clipboard = path;
    this._isCut = true;
  },

  getClipboard() {
    if (!this._clipboard) return null;
    return { path: this._clipboard, isCut: this._isCut };
  },

  clearClipboard() {
    this._clipboard = null;
    this._isCut = false;
  },

  hasClipboard() {
    return this._clipboard !== null;
  }
};
