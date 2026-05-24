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

const Sidebar = {
  init() {
    $$('#sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this._switchTab(item.dataset.tab);
      });
    });
  },

  _switchTab(tabId) {
    $$('#sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
    $$('.tab-pane').forEach(p => p.classList.remove('active'));

    const navItem = $(`#sidebar-nav .nav-item[data-tab="${tabId}"]`);
    const pane = $(`#pane-${tabId}`);

    if (navItem) navItem.classList.add('active');
    if (pane) pane.classList.add('active');

    if (tabId === 'service') ServiceControl.init();
    else ServiceControl.destroy();

    if (tabId === 'logs') LogViewer.init();
    else LogViewer.destroy();

    if (tabId === 'config') ConfigEditor.init();
    if (tabId === 'users') UserManager.init();
    if (tabId === 'files') FileManager.init();
  }
};
