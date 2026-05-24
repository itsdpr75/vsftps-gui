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

const Storage = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    try {
      this._cache = await window.api.readSettings();
    } catch {
      this._cache = this.defaults();
    }
    return this._cache;
  },

  async save(settings) {
    this._cache = settings;
    try {
      await window.api.writeSettings(settings);
    } catch {}
  },

  async get(key) {
    const s = await this.load();
    return key.split('.').reduce((o, k) => (o || {})[k], s);
  },

  async set(key, value) {
    const s = await this.load();
    const keys = key.split('.');
    let obj = s;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    await this.save(s);
  },

  defaults() {
    return {
      lang: 'es',
      theme: 'dark',
      accentColor: '#3b82f6',
      backup: {
        enabled: false,
        directory: '',
        intervalHours: 24,
        maxBackups: 10
      },
      window: { width: 1100, height: 750, x: null, y: null }
    };
  }
};
