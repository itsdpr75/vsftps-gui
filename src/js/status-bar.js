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

const StatusBar = {
  init() {
    this._statusInterval = setInterval(() => this._refresh(), 10000);
    this._refresh();
  },

  async _refresh() {
    const result = await window.api.serviceAction('status');
    const activeMatch = result.output?.match(/Active:\s*(\w+)/);
    const isActive = activeMatch && activeMatch[1] === 'active';

    const icon = $('#status-icon');
    const text = $('#status-text');

    if (isActive) {
      icon.className = 'fas fa-circle active';
      text.textContent = 'vsftpd: ' + t('status.active');
      text.style.color = 'var(--success-color)';
    } else {
      icon.className = 'fas fa-circle inactive';
      text.textContent = 'vsftpd: ' + t('status.inactive');
      text.style.color = 'var(--danger-color)';
    }

    const sidebarStatus = $('#sidebar-status');
    if (sidebarStatus) {
      sidebarStatus.className = 'service-indicator ' + (isActive ? 'active' : 'inactive');
    }
  },

  setActive(active) {
    const icon = $('#status-icon');
    const text = $('#status-text');
    const sidebarStatus = $('#sidebar-status');

    if (active) {
      if (icon) { icon.className = 'fas fa-circle active'; }
      if (text) { text.textContent = 'vsftpd: ' + t('status.active'); text.style.color = 'var(--success-color)'; }
      if (sidebarStatus) sidebarStatus.className = 'service-indicator active';
    } else {
      if (icon) { icon.className = 'fas fa-circle inactive'; }
      if (text) { text.textContent = 'vsftpd: ' + t('status.inactive'); text.style.color = 'var(--danger-color)'; }
      if (sidebarStatus) sidebarStatus.className = 'service-indicator inactive';
    }
  }
};
