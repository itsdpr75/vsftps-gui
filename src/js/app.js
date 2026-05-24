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

(async function init() {
  await Storage.load();

  const settings = await Storage.load();
  await loadLocale(settings.lang || 'es');

  await Theme.init();

  Sidebar.init();
  StatusBar.init();

  ConfigEditor.init();
})();
