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

const LogViewer = {
  _interval: null,
  _paused: false,
  _filterText: '',

  async init() {
    const container = $('#log-viewer');
    container.innerHTML = '';

    const header = el('div', { className: 'card-header' }, [
      el('i', { className: 'fas fa-list' }),
      document.createTextNode(' ' + t('log.title'))
    ]);
    container.appendChild(header);

    const toolbar = el('div', { className: 'toolbar' }, [
      el('button', { className: 'btn btn-sm', id: 'log-pause-btn', onClick: () => this._togglePause() }, [
        el('i', { className: 'fas fa-pause' }),
        ' ', t('btn.pause')
      ]),
      el('button', { className: 'btn btn-sm', onClick: () => this._clear() }, [
        el('i', { className: 'fas fa-trash-alt' }),
        ' ', t('btn.clear')
      ]),
      el('div', { style: { flex: '1' } }),
      el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [
        el('input', { type: 'checkbox', checked: true, id: 'log-autoscroll', onchange: () => {} }),
        t('autoscroll')
      ]),
      el('div', { className: 'search-input' }, [
        el('i', { className: 'fas fa-search' }),
        el('input', {
          type: 'text',
          placeholder: t('filter'),
          style: { width: '180px' },
          oninput: (e) => { this._filterText = e.target.value; this._render(); }
        })
      ]),
    ]);
    container.appendChild(toolbar);

    const logDiv = el('div', { className: 'log-container', id: 'log-content' }, [
      el('div', { style: { color: 'var(--text-muted)', textAlign: 'center', padding: '20px' } }, ['Loading...'])
    ]);
    container.appendChild(logDiv);

    await this._refresh();
    this._interval = setInterval(() => this._refresh(), 3000);
  },

  destroy() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  async _refresh() {
    if (this._paused) return;
    const raw = await window.api.readLog();
    this._rawLog = raw;
    this._render();
  },

  _render() {
    if (!this._rawLog) return;
    const logDiv = $('#log-content');
    if (!logDiv) return;

    const lines = this._rawLog.split('\n').filter(Boolean);
    const filtered = this._filterText
      ? lines.filter(l => l.toLowerCase().includes(this._filterText.toLowerCase()))
      : lines;

    logDiv.innerHTML = filtered.map(line => {
      let cls = 'log-line-info';
      if (line.includes('OK LOGIN') || line.includes('UPLOAD')) cls = 'log-line-ok';
      else if (line.includes('FAIL') || line.includes('ERROR')) cls = 'log-line-fail';
      else if (line.includes('CONNECT')) cls = 'log-line-info';
      return `<div class="log-line ${cls}">${this._escapeHtml(line)}</div>`;
    }).join('');

    const autoscroll = $('#log-autoscroll');
    if (autoscroll && autoscroll.checked) {
      logDiv.scrollTop = logDiv.scrollHeight;
    }
  },

  _togglePause() {
    this._paused = !this._paused;
    const btn = $('#log-pause-btn');
    if (btn) {
      btn.innerHTML = this._paused
        ? `<i class="fas fa-play"></i> ${t('btn.resume')}`
        : `<i class="fas fa-pause"></i> ${t('btn.pause')}`;
    }
  },

  _clear() {
    this._rawLog = '';
    const logDiv = $('#log-content');
    if (logDiv) logDiv.innerHTML = '';
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
