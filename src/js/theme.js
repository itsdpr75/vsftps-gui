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

const Theme = {
  async init() {
    const theme = await Storage.get('theme') || 'dark';
    const accent = await Storage.get('accentColor') || '#3b82f6';
    this.setTheme(theme);
    this.setAccent(accent);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  setAccent(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    const hover = this.darken(color, 0.15);
    document.documentElement.style.setProperty('--accent-hover', hover);
  },

  darken(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
};
