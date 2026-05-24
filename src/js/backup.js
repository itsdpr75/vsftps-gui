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

const Backup = {
  async create() {
    const result = await window.api.createBackup();
    if (result.success) {
      toast(t('backup.created'));
    } else {
      toast(t('msg.operation_error') + ': ' + result.output, 'error');
    }
  },

  async showRestore() {
    const backups = await window.api.listBackups();
    if (backups.length === 0) {
      toast(t('backup.none'), 'error');
      return;
    }

    const body = $('#modal-generic-body');
    body.innerHTML = `
      <p style="margin-bottom:12px;color:var(--text-secondary)">${t('backup.list')}</p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${t('backup.name')}</th>
              <th>${t('backup.date')}</th>
              <th>${t('backup.size')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${backups.map(b => `
              <tr>
                <td>${b.name}</td>
                <td>${formatDate(b.date)}</td>
                <td>${formatSize(b.size)}</td>
                <td><button class="btn btn-sm btn-primary restore-btn" data-name="${b.name}"><i class="fas fa-undo"></i> ${t('backup.restore')}</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    $('#modal-generic-title').textContent = t('section.backups');
    const footer = $('#modal-generic-footer');
    footer.innerHTML = `<button class="btn btn-secondary" id="modal-restore-cancel">${t('btn.cancel')}</button>`;
    $('#modal-overlay-generic').classList.remove('hidden');

    $('#modal-restore-cancel').onclick = () => $('#modal-overlay-generic').classList.add('hidden');

    body.querySelectorAll('.restore-btn').forEach(btn => {
      btn.onclick = async () => {
        const name = btn.dataset.name;
        const result = await window.api.restoreBackup(name);
        if (result.success) {
          toast(t('backup.restored'));
          $('#modal-overlay-generic').classList.add('hidden');
        } else {
          toast(t('msg.operation_error'), 'error');
        }
      };
    });
  }
};
