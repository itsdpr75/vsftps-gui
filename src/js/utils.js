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

function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}

function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

function el(tag, attrs = {}, children = []) {
  const elem = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') elem.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(elem.style, v);
    else if (k.startsWith('on')) elem.addEventListener(k.slice(2).toLowerCase(), v);
    else elem.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') elem.appendChild(document.createTextNode(c));
    else elem.appendChild(c);
  }
  return elem;
}

function toast(msg, type = 'success') {
  const existing = $('.toast');
  if (existing) existing.remove();

  const t = el('div', { className: `toast toast-${type}` }, [msg]);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function sanitizeCmd(str) {
  return str.replace(/[;&|`$(){}!]/g, '');
}
