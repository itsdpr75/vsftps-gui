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

const Settings = {
  _current: {},

  async open() {
    this._current = await Storage.load();
    const body = $('#settings-content');
    body.innerHTML = '';

    body.appendChild(this._section('language', [
      this._radioGroup('lang', [
        { value: 'es', label: 'Español' },
        { value: 'en', label: 'English' },
      ], this._current.lang),
    ]));

    body.appendChild(this._section('theme', [
      this._radioGroup('theme', [
        { value: 'dark', label: t('settings.dark') },
        { value: 'light', label: t('settings.light') },
      ], this._current.theme),
    ]));

    body.appendChild(this._section('accent', [
      el('div', { className: 'color-presets' }, [
        ...['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'].map(c => {
          const btn = el('button', {
            className: 'color-preset' + (this._current.accentColor === c ? ' active' : ''),
            style: { background: c },
            onClick: () => {
              $$('.color-preset').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              this._current.accentColor = c;
            }
          });
          return btn;
        }),
        el('input', {
          type: 'color',
          value: this._current.accentColor,
          oninput: (e) => {
            this._current.accentColor = e.target.value;
            $$('.color-preset').forEach(b => b.classList.remove('active'));
          }
        }),
      ]),
    ]));

    body.appendChild(this._section('backup', [
      this._field('settings.backup.dir', () => this._current.backup.directory, async (inp) => {
        const dir = await window.api.selectDirectory();
        if (dir) { inp.value = dir; this._current.backup.directory = dir; }
      }),
      this._checkbox('settings.backup.auto', this._current.backup.enabled, (v) => { this._current.backup.enabled = v; }),
      this._field('settings.backup.interval', () => String(this._current.backup.intervalHours), (inp) => {
        this._current.backup.intervalHours = parseInt(inp.value) || 24;
      }),
      this._field('settings.backup.max', () => String(this._current.backup.maxBackups), (inp) => {
        this._current.backup.maxBackups = parseInt(inp.value) || 10;
      }),
    ]));

    $('#modal-overlay').classList.remove('hidden');
  },

  close() {
    $('#modal-overlay').classList.add('hidden');
  },

  async save() {
    await Storage.save(this._current);
    await Theme.init();
    await loadLocale(this._current.lang);
    toast(t('msg.operation_ok'));
    this.close();
  },

  _section(key, children) {
    return el('div', { style: { marginBottom: '20px' } }, [
      el('h3', { style: { fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' } }, [t(key)]),
      ...children
    ]);
  },

  _radioGroup(name, options, selected) {
    const group = el('div', { style: { display: 'flex', gap: '16px' } });
    options.forEach(opt => {
      const label = el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' } }, [
        el('input', {
          type: 'radio',
          name,
          value: opt.value,
          checked: opt.value === selected,
          onchange: () => { this._current[name] = opt.value; }
        }),
        document.createTextNode(opt.label)
      ]);
      group.appendChild(label);
    });
    return group;
  },

  _checkbox(labelKey, checked, onChange) {
    const label = el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' } }, [
      el('input', {
        type: 'checkbox',
        checked,
        onchange: (e) => onChange(e.target.checked)
      }),
      document.createTextNode(t(labelKey))
    ]);
    return label;
  },

  _field(labelKey, getValue, onSetup) {
    const group = el('div', { className: 'form-group' });
    const label = el('label', {}, [t(labelKey)]);
    const wrapper = el('div', { className: 'file-input-group' });
    const inp = el('input', { type: 'text', value: getValue() });
    wrapper.appendChild(inp);
    group.appendChild(label);
    group.appendChild(wrapper);
    if (onSetup.length > 1) {
      const btn = el('button', {
        className: 'btn btn-sm',
        onClick: () => onSetup(inp)
      }, [el('i', { className: 'fas fa-folder-open' })]);
      wrapper.appendChild(btn);
    } else {
      inp.oninput = () => onSetup(inp);
    }
    return group;
  }
};

$('#btn-settings').onclick = () => Settings.open();
$('#modal-close').onclick = () => Settings.close();
$('#btn-settings-cancel').onclick = () => Settings.close();
$('#btn-settings-save').onclick = () => Settings.save();
