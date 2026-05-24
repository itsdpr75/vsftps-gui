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

const ConfigEditor = {
  _values: {},
  _originalKeys: new Set(),
  _currentCategory: 'general',
  _originalContent: '',

  async init() {
    const container = $('#config-editor');
    container.innerHTML = '';
    this._values = {};
    this._originalKeys = new Set();

    const raw = await window.api.readConfig();
    this._originalContent = raw;
    const parsed = this._parseConfig(raw);
    this._values = parsed.values;
    this._originalKeys = parsed.keys;

    const layout = el('div', { className: 'config-layout' });

    const catSidebar = el('div', { className: 'config-sidebar' });
    CONFIG_SCHEMA.forEach(cat => {
      const btn = el('button', {
        className: 'config-category' + (cat.id === this._currentCategory ? ' active' : ''),
        'data-category': cat.id,
        onClick: () => this._switchCategory(cat.id)
      }, [
        el('i', { className: `fas fa-${cat.icon}` }),
        ' ',
        document.createTextNode(t(cat.i18n))
      ]);
      catSidebar.appendChild(btn);
    });

    const backupBar = el('div', { className: 'config-backup-bar' }, [
      el('button', { className: 'btn btn-sm', onClick: () => Backup.create() }, [
        el('i', { className: 'fas fa-archive' }),
        document.createTextNode(' ' + t('backup.create'))
      ]),
      el('button', { className: 'btn btn-sm', onClick: () => Backup.showRestore() }, [
        el('i', { className: 'fas fa-undo' }),
        document.createTextNode(' ' + t('backup.restore'))
      ]),
      el('span', { style: { flex: '1' } }),
      el('button', { className: 'btn btn-sm btn-primary', onClick: () => this._apply() }, [
        el('i', { className: 'fas fa-save' }),
        document.createTextNode(' ' + t('btn.apply'))
      ]),
      el('button', { className: 'btn btn-sm', onClick: () => this._reload() }, [
        el('i', { className: 'fas fa-redo' }),
        document.createTextNode(' ' + t('btn.reload'))
      ]),
    ]);

    const content = el('div', { className: 'config-content' });
    const card = el('div', { className: 'card' });
    card.id = 'config-card';
    content.appendChild(card);

    layout.appendChild(catSidebar);
    layout.appendChild(content);

    container.appendChild(backupBar);
    container.appendChild(layout);

    this._renderCategory(this._currentCategory);
  },

  _parseConfig(raw) {
    const values = {};
    const keys = new Set();
    raw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      values[key] = val;
      keys.add(key);
    });
    return { values, keys };
  },

  _renderCategory(catId) {
    this._currentCategory = catId;
    $$('.config-category').forEach(b => b.classList.toggle('active', b.dataset.category === catId));

    const cat = CONFIG_SCHEMA.find(c => c.id === catId);
    if (!cat) return;

    const card = $('#config-card');
    card.innerHTML = '';

    const header = el('div', { className: 'card-header' }, [
      el('i', { className: `fas fa-${cat.icon}` }),
      document.createTextNode(t(cat.i18n))
    ]);
    card.appendChild(header);

    const listOpts = [];
    let currentGroup = null;

    cat.options.forEach(opt => {
      if (opt.subGroup && opt.subGroup !== currentGroup) {
        currentGroup = opt.subGroup;
        const sg = SUB_GROUPS[currentGroup];
        if (sg) {
          const sep = el('div', {
            style: {
              borderTop: '1px solid var(--border-color)',
              margin: '16px 0 6px',
              paddingTop: '10px'
            }
          }, [
            el('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' } }, [sg.label]),
            el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' } }, [sg.subtitle]),
          ]);
          card.appendChild(sep);
        }
      }

      const group = el('div', { className: 'form-group' });
      const currentVal = this._values[opt.key] !== undefined ? this._values[opt.key] : opt.def;

      if (opt.type === 'bool') {
        const label = el('label');
        const cb = el('input', {
          type: 'checkbox',
          checked: currentVal === 'YES',
          onchange: () => {
            this._values[opt.key] = cb.checked ? 'YES' : 'NO';
          }
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(` ${opt.key}`));
        group.appendChild(label);
        if (opt.desc) {
          group.appendChild(el('div', { className: 'help-text' }, [opt.desc]));
        }
      } else if (opt.type === 'number') {
        const label = el('label', {}, [opt.key]);
        const inp = el('input', {
          type: 'number',
          value: currentVal,
          oninput: () => { this._values[opt.key] = inp.value; }
        });
        group.appendChild(label);
        group.appendChild(inp);
        if (opt.desc) {
          group.appendChild(el('div', { className: 'help-text' }, [opt.desc]));
        }
      } else if (opt.type === 'file') {
        const label = el('label', {}, [opt.key]);
        const wrapper = el('div', { className: 'file-input-group' });
        const inp = el('input', {
          type: 'text',
          value: currentVal,
          oninput: () => { this._values[opt.key] = inp.value; }
        });
        wrapper.appendChild(inp);
        group.appendChild(label);
        group.appendChild(wrapper);
        if (opt.desc) {
          group.appendChild(el('div', { className: 'help-text' }, [opt.desc]));
        }
        if (opt.listFile) {
          listOpts.push(opt);
        }
      } else {
        const label = el('label', {}, [opt.key]);
        const inp = el('input', {
          type: 'text',
          value: currentVal,
          oninput: () => { this._values[opt.key] = inp.value; }
        });
        group.appendChild(label);
        group.appendChild(inp);
        if (opt.desc) {
          group.appendChild(el('div', { className: 'help-text' }, [opt.desc]));
        }
      }
      card.appendChild(group);
    });

    listOpts.forEach(opt => this._renderListEditor(card, opt));
  },

  _listCache: {},
  _allUsers: [],

  async _fetchUsers() {
    if (this._allUsers.length === 0) {
      try {
        const all = await window.api.listUsers();
        this._allUsers = all.filter(u =>
          u.uid >= 1000 && !['/sbin/nologin', '/usr/sbin/nologin', '/bin/false'].includes(u.shell)
        );
      } catch {}
    }
    return this._allUsers;
  },

  _userInfo(username) {
    return this._allUsers.find(u => u.user === username);
  },

  async _renderListEditor(card, opt) {
    const filePath = this._values[opt.key] || opt.def;
    if (!filePath) return;

    await this._fetchUsers();

    let entries = [];
    try {
      entries = await window.api.readListFile(filePath);
    } catch {}
    this._listCache[opt.key] = entries;

    const sep = el('div', {
      style: {
        borderTop: '1px solid var(--border-color)',
        margin: '16px 0 10px',
        padding: '10px 0 4px',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)'
      }
    }, [`Editar: ${filePath}`]);
    card.appendChild(sep);

    const addRow = el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' } });

    const sel = el('select', { style: { flex: '1' } });
    sel.id = `list-select-${opt.key}`;
    const placeholder = el('option', { value: '' }, ['Seleccionar usuario...']);
    sel.appendChild(placeholder);

    this._allUsers.forEach(u => {
      const optEl = el('option', { value: u.user }, [`${u.user} (UID: ${u.uid})`]);
      sel.appendChild(optEl);
    });

    const addBtn = el('button', {
      className: 'btn btn-sm btn-primary',
      onClick: async () => {
        const user = sel.value;
        if (!user) return;
        entries.push(user);
        await this._saveListFile(opt, entries);
        this._renderListTable(card, opt, entries);
        sel.value = '';
      }
    }, [
      el('i', { className: 'fas fa-plus' }),
      ' Añadir'
    ]);

    addRow.appendChild(sel);
    addRow.appendChild(addBtn);
    card.appendChild(addRow);

    this._renderListTable(card, opt, entries);
  },

  _renderListTable(card, opt, entries) {
    const existing = card.querySelector(`[data-list-table="${opt.key}"]`);
    if (existing) existing.remove();

    const wrapper = el('div', { 'data-list-table': opt.key, style: { marginTop: '8px' } });

    if (entries.length === 0) {
      wrapper.appendChild(el('div', {
        style: { color: 'var(--text-muted)', padding: '12px', textAlign: 'center', fontSize: '12px' }
      }, ['No hay usuarios en la lista']));
      card.appendChild(wrapper);
      return;
    }

    const table = el('table', { className: 'list-editor-table' });
    const thead = el('thead');
    thead.innerHTML = '<tr><th>Usuario</th><th>UID</th><th>Home</th><th>Shell</th><th style="width:60px"></th></tr>';
    table.appendChild(thead);
    const tbody = el('tbody');

    entries.forEach((u, i) => {
      const info = this._userInfo(u);
      const row = el('tr');
      row.innerHTML = `
        <td><strong>${u}</strong></td>
        <td>${info ? info.uid : '—'}</td>
        <td>${info ? info.home : '—'}</td>
        <td>${info ? info.shell : '—'}</td>
        <td><button class="btn btn-sm btn-danger remove-list-user" data-idx="${i}"><i class="fas fa-times"></i></button></td>`;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    card.appendChild(wrapper);

    wrapper.querySelectorAll('.remove-list-user').forEach(btn => {
      btn.onclick = async () => {
        const idx = parseInt(btn.dataset.idx);
        entries.splice(idx, 1);
        await this._saveListFile(opt, entries);
        this._renderListTable(card, opt, entries);
      };
    });
  },

  async _saveListFile(opt, entries) {
    const filePath = this._values[opt.key] || opt.def;
    this._listCache[opt.key] = entries;
    try {
      await window.api.writeListFile(filePath, entries);
    } catch {}
  },

  _switchCategory(catId) {
    this._renderCategory(catId);
  },

  async _apply() {
    let output = '';
    output += `# vsftpd.conf - Generated by vsftpd GUI\n`;
    output += `# Date: ${new Date().toISOString()}\n\n`;

    const written = new Set();

    CONFIG_SCHEMA.forEach(cat => {
      output += `# --- ${t(cat.i18n)} ---\n`;
      cat.options.forEach(opt => {
        const val = this._values[opt.key];
        if (val !== undefined && val !== '' && (this._originalKeys.has(opt.key) || val !== opt.def)) {
          output += `${opt.key}=${val}\n`;
          written.add(opt.key);
        }
      });
      output += '\n';
    });

    this._originalKeys.forEach(key => {
      if (!written.has(key) && this._values[key] !== undefined) {
        output += `${key}=${this._values[key]}\n`;
      }
    });

    const result = await window.api.writeConfig(output);
    if (result.success) {
      toast(t('msg.config_saved'));
      this._originalContent = output;
    } else {
      toast(t('msg.config_error') + ': ' + result.output, 'error');
    }
  },

  async _reload() {
    await this.init();
    toast(t('msg.operation_ok'));
  }
};
