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

const FileListing = {
  _currentPath: '',
  _entries: [],
  _selectedIdx: null,
  _contextTarget: null,

  async load(path) {
    this._currentPath = path;
    this._entries = await FileOps.listDir(path);
    this._selectedIdx = null;
    this.render();
    FileManager.setBreadcrumb(path);
  },

  render() {
    const container = $('#file-listing-content');
    if (!container) return;
    container.innerHTML = '';

    const table = el('table', { className: 'file-table' });
    const thead = el('thead');
    thead.innerHTML = '<tr><th style="width:28px"></th><th>Nombre</th><th style="width:80px">Tamaño</th><th style="width:100px">Permisos</th><th style="width:130px">Propietario</th><th style="width:150px">Modificado</th></tr>';
    table.appendChild(thead);
    const tbody = el('tbody');

    const parentPath = this._getParentPath();
    if (parentPath) {
      const row = el('tr', { className: 'file-row file-row-up', onclick: () => this.load(parentPath) });
      row.innerHTML = `
        <td><i class="fas fa-level-up-alt" style="color:var(--text-muted)"></i></td>
        <td><span style="color:var(--text-muted)">..</span></td>
        <td></td><td></td><td></td><td></td>`;
      tbody.appendChild(row);
    }

    this._entries.forEach((entry, i) => {
      const isDir = entry.type === 'dir';
      const icon = FileIcons.get(entry.name, isDir);
      const iconColor = isDir ? 'var(--warning-color)' : 'var(--text-muted)';
      const row = el('tr', {
        className: 'file-row' + (this._selectedIdx === i ? ' selected' : ''),
        onclick: () => {
          this._selectedIdx = i;
          $$('.file-row').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
        },
        ondblclick: () => { if (isDir) this.load(entry.fullPath); },
        oncontextmenu: (e) => { e.preventDefault(); this._showContext(e, entry, i); }
      });
      row.innerHTML = `
        <td><i class="fas ${icon}" style="color:${iconColor}"></i></td>
        <td>${entry.name}${isDir ? '/' : ''}</td>
        <td>${isDir ? '—' : formatSize(entry.size)}</td>
        <td><code style="font-size:11px">${entry.perms}</code></td>
        <td>${entry.owner}:${entry.group}</td>
        <td>${entry.mtime}</td>`;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  },

  _getParentPath() {
    const p = this._currentPath.replace(/\/$/, '');
    if (p === '' || p === '/') return null;
    const idx = p.lastIndexOf('/');
    if (idx <= 0) return '/';
    return p.slice(0, idx);
  },

  getSelected() {
    if (this._selectedIdx === null || !this._entries[this._selectedIdx]) return null;
    return this._entries[this._selectedIdx];
  },

  getSelectedEntries() {
    if (this._selectedIdx === null) return [];
    const e = this._entries[this._selectedIdx];
    return e ? [e] : [];
  },

  getCurrentPath() {
    return this._currentPath;
  },

  _showContext(e, entry, idx) {
    this._contextTarget = { entry, idx };
    const menu = $('#context-menu');
    if (!menu) return;
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.remove('hidden');

    const closeMenu = (ev) => {
      if (ev && menu.contains(ev.target)) return;
      menu.classList.add('hidden');
      document.removeEventListener('click', closeMenu);
    };

    setTimeout(() => document.addEventListener('click', closeMenu), 10);

    menu.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = () => {
        closeMenu();
        const action = btn.dataset.action;
        this._handleContextAction(action);
      };
    });
  },

  async _handleContextAction(action) {
    const sel = this.getSelected();
    const path = sel ? sel.fullPath : this._currentPath;

    switch (action) {
      case 'open-fm':
        await window.api.openInFileManager(this._currentPath);
        break;
      case 'copy':
        if (sel) FileOps.copyToClipboard(path);
        break;
      case 'cut':
        if (sel) FileOps.cutToClipboard(path);
        break;
      case 'paste':
        await this._paste();
        break;
      case 'duplicate':
        if (sel) await FileOps.copyPath(path, path + '.copy');
        await this.load(this._currentPath);
        break;
      case 'rename':
        if (sel) await this._rename(sel);
        break;
      case 'delete':
        if (sel) await this._delete(sel);
        break;
      case 'mkdir':
        await this._mkdir();
        break;
      case 'chmod':
        if (sel) await this._chmod(sel);
        break;
      case 'chown':
        if (sel) await this._chown(sel);
        break;
    }
  },

  async _paste() {
    const clip = FileOps.getClipboard();
    if (!clip) return;
    const dest = this._currentPath + '/' + clip.path.split('/').pop();
    const result = clip.isCut
      ? await FileOps.movePath(clip.path, dest)
      : await FileOps.copyPath(clip.path, dest);
    FileOps.clearClipboard();
    if (result.success) {
      toast(t('msg.operation_ok'));
      await this.load(this._currentPath);
    } else {
      toast(t('msg.operation_error'), 'error');
    }
  },

  async _rename(entry) {
    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Nuevo nombre</label>
        <input type="text" id="rename-input" value="${entry.name}" style="width:100%">
      </div>`;
    $('#modal-generic-title').textContent = 'Renombrar';
    $('#modal-generic-footer').innerHTML = `
      <button class="btn btn-secondary" id="rename-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="rename-confirm">${t('btn.save')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#rename-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#rename-confirm').onclick = async () => {
      const name = $('#rename-input').value.trim();
      if (!name) return;
      const newPath = entry.fullPath.replace(/[^/]+$/, name);
      const result = await FileOps.renamePath(entry.fullPath, newPath);
      if (result.success) {
        $('#modal-overlay-generic').classList.add('hidden');
        await this.load(this._currentPath);
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  },

  async _delete(entry) {
    const body = $('#modal-generic-body');
    body.innerHTML = `<p>Eliminar <strong>${entry.name}</strong>?${entry.type === 'dir' ? ' (todo su contenido)' : ''}</p>`;
    $('#modal-generic-title').textContent = 'Confirmar eliminación';
    $('#modal-generic-footer').innerHTML = `
      <button class="btn btn-secondary" id="del-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-danger" id="del-confirm">${t('btn.delete')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#del-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#del-confirm').onclick = async () => {
      const result = await FileOps.deletePath(entry.fullPath);
      if (result.success) {
        $('#modal-overlay-generic').classList.add('hidden');
        toast(t('msg.operation_ok'));
        await this.load(this._currentPath);
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  },

  async _mkdir() {
    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Nombre de la carpeta</label>
        <input type="text" id="mkdir-input" value="nueva-carpeta" style="width:100%">
      </div>`;
    $('#modal-generic-title').textContent = 'Crear carpeta';
    $('#modal-generic-footer').innerHTML = `
      <button class="btn btn-secondary" id="mkdir-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="mkdir-confirm">${t('btn.create')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#mkdir-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#mkdir-confirm').onclick = async () => {
      const name = $('#mkdir-input').value.trim();
      if (!name) return;
      const result = await FileOps.createDir(this._currentPath + '/' + name);
      if (result.success) {
        $('#modal-overlay-generic').classList.add('hidden');
        toast(t('msg.operation_ok'));
        await this.load(this._currentPath);
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  },

  async _chmod(entry) {
    const perms = entry.perms || 'rwxr-xr-x';
    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Permisos (modo octal, ej: 755)</label>
        <input type="text" id="chmod-input" value="${perms}" style="width:100%">
      </div>`;
    $('#modal-generic-title').textContent = 'Cambiar permisos';
    $('#modal-generic-footer').innerHTML = `
      <button class="btn btn-secondary" id="chmod-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="chmod-confirm">${t('btn.save')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#chmod-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#chmod-confirm').onclick = async () => {
      const mode = $('#chmod-input').value.trim();
      if (!mode) return;
      const result = await FileOps.chmodPath(entry.fullPath, mode);
      if (result.success) {
        $('#modal-overlay-generic').classList.add('hidden');
        toast(t('msg.operation_ok'));
        await this.load(this._currentPath);
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  },

  async _chown(entry) {
    const users = await window.api.listUsers();
    const options = users.filter(u => u.uid >= 1000)
      .map(u => `<option value="${u.user}">${u.user}</option>`).join('');

    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Propietario</label>
        <select id="chown-user">${options}</select>
      </div>`;
    $('#modal-generic-title').textContent = 'Cambiar propietario';
    $('#modal-generic-footer').innerHTML = `
      <button class="btn btn-secondary" id="chown-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="chown-confirm">${t('btn.save')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#chown-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#chown-confirm').onclick = async () => {
      const user = $('#chown-user').value;
      const result = await FileOps.chownPath(entry.fullPath, user, '');
      if (result.success) {
        $('#modal-overlay-generic').classList.add('hidden');
        toast(t('msg.operation_ok'));
        await this.load(this._currentPath);
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  }
};
