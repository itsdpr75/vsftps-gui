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

const UserManager = {
  _users: [],
  _userlist: [],

  async init() {
    const container = $('#user-manager');
    container.innerHTML = '';

    const toolbar = el('div', { className: 'toolbar' }, [
      el('button', { className: 'btn btn-primary btn-sm', onClick: () => this._showAddModal() }, [
        el('i', { className: 'fas fa-user-plus' }),
        ' ', t('users.add')
      ]),
      el('div', { style: { flex: '1' } }),
      el('div', { className: 'search-input' }, [
        el('i', { className: 'fas fa-search' }),
        el('input', {
          type: 'text',
          placeholder: t('search'),
          oninput: (e) => this._filter(e.target.value)
        })
      ]),
    ]);
    container.appendChild(toolbar);

    const tableContainer = el('div', { className: 'table-container' });
    const table = el('table');
    table.id = 'users-table';
    const thead = el('thead');
    thead.innerHTML = `
      <tr>
        <th>${t('users.username')}</th>
        <th>UID</th>
        <th>${t('users.home')}</th>
        <th>${t('users.shell')}</th>
        <th>${t('users.access')}</th>
        <th></th>
      </tr>`;
    table.appendChild(thead);
    table.appendChild(el('tbody', { id: 'users-tbody' }));
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    await this._loadUsers();
  },

  async _loadUsers() {
    const allUsers = await window.api.listUsers();
    const userlist = await window.api.readUserlist();
    this._userlist = userlist;

    const ftpUsers = allUsers.filter(u =>
      u.uid >= 1000 && u.shell !== '/sbin/nologin' && u.shell !== '/usr/sbin/nologin' && u.shell !== '/bin/false'
    );
    this._users = ftpUsers.map(u => ({
      ...u,
      hasFTP: userlist.length === 0 || userlist.includes(u.user)
    }));

    this._renderTable(this._users);
  },

  _renderTable(users) {
    const tbody = $('#users-tbody');
    tbody.innerHTML = '';

    if (users.length === 0) {
      const row = el('tr');
      const td = el('td', { colspan: '6', style: { textAlign: 'center', color: 'var(--text-muted)', padding: '32px' } }, ['No users found']);
      row.appendChild(td);
      tbody.appendChild(row);
      return;
    }

    users.forEach(u => {
      const row = el('tr');
      row.innerHTML = `
        <td><strong>${u.user}</strong></td>
        <td>${u.uid}</td>
        <td>${u.home}</td>
        <td>${u.shell}</td>
        <td><span class="tag ${u.hasFTP ? 'tag-success' : 'tag-danger'}">${u.hasFTP ? t('users.yes') : t('users.no')}</span></td>
        <td>
          <button class="btn btn-sm btn-pass" data-user="${u.user}"><i class="fas fa-key"></i></button>
        </td>`;
      tbody.appendChild(row);

      const passBtn = row.querySelector('.btn-pass');
      passBtn.addEventListener('click', () => this._showPasswordModal(u.user));
    });
  },

  _filter(query) {
    const q = query.toLowerCase();
    const filtered = this._users.filter(u =>
      u.user.toLowerCase().includes(q) || u.home.toLowerCase().includes(q)
    );
    this._renderTable(filtered);
  },

  _showAddModal() {
    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>${t('users.username')}</label>
        <input type="text" id="modal-add-user" placeholder="username">
      </div>
      <div class="form-group">
        <label>${t('users.password')}</label>
        <input type="password" id="modal-add-pass" placeholder="********">
      </div>
      <div class="form-group">
        <label>${t('users.confirm_pass')}</label>
        <input type="password" id="modal-add-pass2" placeholder="********">
      </div>
    `;

    $('#modal-generic-title').textContent = t('users.add');
    const footer = $('#modal-generic-footer');
    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-add-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="modal-add-confirm">${t('btn.add')}</button>
    `;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#modal-add-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#modal-add-confirm').onclick = async () => {
      const user = $('#modal-add-user').value.trim();
      const pass = $('#modal-add-pass').value;
      const pass2 = $('#modal-add-pass2').value;
      if (!user || !pass) return;
      if (pass !== pass2) {
        toast(t('msg.password_mismatch'), 'error');
        return;
      }
      const result = await window.api.addUser(user, pass);
      if (result.success) {
        toast(t('msg.user_added'));
        $('#modal-overlay-generic').classList.add('hidden');
        await this._loadUsers();
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  },

  _showPasswordModal(username) {
    const body = $('#modal-generic-body');
    body.innerHTML = `
      <div class="form-group">
        <label>${t('users.username')}: <strong>${username}</strong></label>
      </div>
      <div class="form-group">
        <label>${t('users.new_pass')}</label>
        <input type="password" id="modal-pass-new" placeholder="********">
      </div>
      <div class="form-group">
        <label>${t('users.confirm_pass')}</label>
        <input type="password" id="modal-pass-confirm" placeholder="********">
      </div>
    `;

    $('#modal-generic-title').textContent = t('users.change_pass');
    const footer = $('#modal-generic-footer');
    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-pass-cancel">${t('btn.cancel')}</button>
      <button class="btn btn-primary" id="modal-pass-confirm-btn">${t('btn.save')}</button>
    `;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#modal-pass-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');
    $('#modal-pass-confirm-btn').onclick = async () => {
      const pass = $('#modal-pass-new').value;
      const pass2 = $('#modal-pass-confirm').value;
      if (!pass || pass !== pass2) {
        toast(t('msg.password_mismatch'), 'error');
        return;
      }
      const result = await window.api.changePassword(username, pass);
      if (result.success) {
        toast(t('msg.operation_ok'));
        $('#modal-overlay-generic').classList.add('hidden');
      } else {
        toast(t('msg.operation_error'), 'error');
      }
    };
  }
};
