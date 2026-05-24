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

const ServiceControl = {
  _interval: null,

  async init() {
    const container = $('#service-control');
    container.innerHTML = '';

    const statusDiv = el('div', { className: 'service-status-big' }, [
      el('i', { className: 'fas fa-circle', id: 'service-icon', style: { color: 'var(--text-muted)' } }),
      el('div', { className: 'status-label', id: 'service-label' }, ['--']),
    ]);
    container.appendChild(statusDiv);

    const btnGroup = el('div', { className: 'btn-group', style: { justifyContent: 'center', marginBottom: '16px' } }, [
      el('button', { className: 'btn btn-success', onClick: () => this._action('start') }, [
        el('i', { className: 'fas fa-play' }), ' ', t('btn.start')
      ]),
      el('button', { className: 'btn btn-danger', onClick: () => this._action('stop') }, [
        el('i', { className: 'fas fa-stop' }), ' ', t('btn.stop')
      ]),
      el('button', { className: 'btn', onClick: () => this._action('restart') }, [
        el('i', { className: 'fas fa-sync-alt' }), ' ', t('btn.restart')
      ]),
    ]);
    container.appendChild(btnGroup);

    const outputCard = el('div', { className: 'card' }, [
      el('div', { className: 'card-header' }, [
        el('i', { className: 'fas fa-terminal' }),
        document.createTextNode(' ' + t('service.output'))
      ]),
      el('pre', {
        id: 'service-output',
        style: {
          background: 'var(--bg-primary)',
          padding: '12px',
          borderRadius: 'var(--radius)',
          fontSize: '12px',
          fontFamily: 'Consolas, monospace',
          maxHeight: '200px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5'
        }
      }),
    ]);
    container.appendChild(outputCard);

    await this._refreshStatus();
    this._interval = setInterval(() => this._refreshStatus(), 5000);
  },

  destroy() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  async _action(action) {
    const result = await window.api.serviceAction(action);
    const output = $('#service-output');
    if (output) output.textContent = result.output;
    await this._refreshStatus();
    if (result.success) {
      toast(t('msg.operation_ok'));
    } else {
      toast(t('msg.operation_error'), 'error');
    }
  },

  async _refreshStatus() {
    const result = await window.api.serviceAction('status');
    const output = $('#service-output');
    if (output && result.output) output.textContent = result.output;

    const icon = $('#service-icon');
    const label = $('#service-label');
    if (!icon || !label) return;

    const activeMatch = result.output?.match(/Active:\s*(\w+)/);
    const isActive = activeMatch && activeMatch[1] === 'active';

    if (isActive) {
      icon.style.color = 'var(--success-color)';
      label.textContent = t('status.active');
      label.style.color = 'var(--success-color)';
      StatusBar.setActive(true);
    } else if (activeMatch && activeMatch[1] === 'inactive') {
      icon.style.color = 'var(--danger-color)';
      label.textContent = t('status.inactive');
      label.style.color = 'var(--danger-color)';
      StatusBar.setActive(false);
    } else {
      icon.style.color = 'var(--warning-color)';
      label.textContent = t('status.error');
      label.style.color = 'var(--warning-color)';
      StatusBar.setActive(false);
    }
  }
};
