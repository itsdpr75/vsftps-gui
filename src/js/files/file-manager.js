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

const FileManager = {
  _roots: [],

  async init() {
    const container = $('#file-manager');
    container.innerHTML = '';

    const layout = el('div', { className: 'fm-layout' });

    const sidePanel = el('div', { className: 'fm-sidebar' });
    sidePanel.id = 'fm-sidebar';
    layout.appendChild(sidePanel);

    const mainPanel = el('div', { className: 'fm-main' });

    const toolbar = el('div', { className: 'fm-toolbar' });
    toolbar.id = 'fm-toolbar';
    mainPanel.appendChild(toolbar);

    const breadcrumb = el('div', { className: 'fm-breadcrumb' });
    breadcrumb.id = 'fm-breadcrumb';
    mainPanel.appendChild(breadcrumb);

    const content = el('div', { className: 'fm-content' });
    content.id = 'file-listing-content';
    mainPanel.appendChild(content);

    layout.appendChild(mainPanel);
    container.appendChild(layout);

    this._renderContextMenu(container);

    await this._loadRoots();
    this._renderSidebar();

    if (this._roots.length > 0) {
      await FileListing.load(this._roots[0].path);
    }
  },

  _renderContextMenu(container) {
    const menu = el('div', { className: 'context-menu hidden', id: 'context-menu' }, [
      el('div', { 'data-action': 'open-fm', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-external-link-alt' }), ' Abrir en explorador'
      ]),
      el('div', { className: 'ctx-sep' }),
      el('div', { 'data-action': 'copy', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-copy' }), ' Copiar'
      ]),
      el('div', { 'data-action': 'cut', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-cut' }), ' Cortar'
      ]),
      el('div', { 'data-action': 'paste', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-paste' }), ' Pegar'
      ]),
      el('div', { 'data-action': 'duplicate', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-copy' }), ' Duplicar'
      ]),
      el('div', { className: 'ctx-sep' }),
      el('div', { 'data-action': 'rename', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-i-cursor' }), ' Renombrar'
      ]),
      el('div', { 'data-action': 'delete', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-trash-alt' }), ' Eliminar'
      ]),
      el('div', { className: 'ctx-sep' }),
      el('div', { 'data-action': 'mkdir', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-folder-plus' }), ' Crear carpeta'
      ]),
      el('div', { className: 'ctx-sep' }),
      el('div', { 'data-action': 'chmod', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-lock' }), ' Permisos...'
      ]),
      el('div', { 'data-action': 'chown', className: 'ctx-item' }, [
        el('i', { className: 'fas fa-user' }), ' Propietario...'
      ]),
    ]);
    container.appendChild(menu);
  },

  async _loadRoots() {
    this._roots = [];

    const config = await window.api.readConfig();
    let anonRoot = '/srv/ftp';
    let localRoot = '';
    const lines = config.split('\n');
    for (const l of lines) {
      if (l.startsWith('anon_root=')) anonRoot = l.split('=')[1].trim();
      if (l.startsWith('local_root=')) localRoot = l.split('=')[1].trim();
    }

    this._roots.push({ label: 'Raíz anónima', path: anonRoot, icon: 'fa-globe' });

    if (localRoot) {
      this._roots.push({ label: 'Raíz local', path: localRoot, icon: 'fa-home' });
    }

    try {
      const users = await window.api.listUsers();
      const ftpUsers = users.filter(u =>
        u.uid >= 1000 && !['/sbin/nologin', '/usr/sbin/nologin', '/bin/false'].includes(u.shell)
      );
      ftpUsers.forEach(u => {
        this._roots.push({ label: u.user, path: u.home, icon: 'fa-user', user: u.user });
      });
    } catch {}
  },

  _renderSidebar() {
    const panel = $('#fm-sidebar');
    panel.innerHTML = '';
    panel.appendChild(el('div', { className: 'fm-sidebar-title' }, [
      el('i', { className: 'fas fa-folder-tree' }),
      ' Directorios'
    ]));

    this._roots.forEach(root => {
      const btn = el('button', {
        className: 'fm-root-btn',
        onclick: () => FileListing.load(root.path)
      }, [
        el('i', { className: `fas ${root.icon}` }),
        document.createTextNode(' ' + root.label)
      ]);
      panel.appendChild(btn);
    });
  },

  setBreadcrumb(path) {
    const bc = $('#fm-breadcrumb');
    if (!bc) return;
    bc.innerHTML = '';

    const parts = path.replace(/\/$/, '').split('/').filter(Boolean);
    let current = '';
    bc.appendChild(el('span', { className: 'bc-item bc-root', onclick: () => FileListing.load('/') }, [
      el('i', { className: 'fas fa-folder-open' })
    ]));

    parts.forEach(part => {
      current += '/' + part;
      const span = el('span', { className: 'bc-sep' }, [' / ']);
      const item = el('span', {
        className: 'bc-item',
        onclick: () => FileListing.load(current)
      }, [part]);
      bc.appendChild(span);
      bc.appendChild(item);
    });
  },

  updateToolbar(hasSelection) {
    const tb = $('#fm-toolbar');
    if (!tb) return;
    tb.innerHTML = '';

    const btnGroup = (items) => {
      items.forEach(({ icon, label, action, primary }) => {
        const btn = el('button', {
          className: 'btn btn-sm' + (primary ? ' btn-primary' : ''),
          onclick: () => FileListing._handleContextAction(action)
        }, [
          el('i', { className: `fas ${icon}` }),
          ' ' + label
        ]);
        tb.appendChild(btn);
      });
    };

    btnGroup([
      { icon: 'fa-level-up-alt', label: 'Subir', action: 'up' },
      { icon: 'fa-redo', label: 'Recargar', action: 'reload' },
      { icon: 'fa-folder-plus', label: 'Nueva carpeta', action: 'mkdir' },
    ]);
  }
};
