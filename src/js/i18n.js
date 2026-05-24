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

let _locale = {};
let _lang = 'es';

async function loadLocale(lang) {
  _lang = lang;
  try {
    const resp = await fetch(`../locales/${lang}.json`);
    _locale = await resp.json();
  } catch {
    _locale = {};
  }
  applyI18n();
}

function t(key) {
  return _locale[key] || key;
}

function applyI18n() {
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

function currentLang() {
  return _lang;
}
