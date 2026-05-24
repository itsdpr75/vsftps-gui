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

const FileIcons = {
  _map: {
    // Images
    jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image',
    gif: 'fa-file-image', svg: 'fa-file-image', webp: 'fa-file-image',
    bmp: 'fa-file-image', ico: 'fa-file-image',
    // Audio
    mp3: 'fa-file-audio', wav: 'fa-file-audio', flac: 'fa-file-audio',
    ogg: 'fa-file-audio', m4a: 'fa-file-audio', aac: 'fa-file-audio',
    wma: 'fa-file-audio',
    // Video
    mp4: 'fa-file-video', avi: 'fa-file-video', mkv: 'fa-file-video',
    mov: 'fa-file-video', wmv: 'fa-file-video', webm: 'fa-file-video',
    flv: 'fa-file-video',
    // 3D / Models
    obj: 'fa-cube', stl: 'fa-cube', fbx: 'fa-cube', blend: 'fa-cube',
    '3ds': 'fa-cube', step: 'fa-cube',
    // Archives
    zip: 'fa-file-archive', rar: 'fa-file-archive', '7z': 'fa-file-archive',
    tar: 'fa-file-archive', gz: 'fa-file-archive', bz2: 'fa-file-archive',
    xz: 'fa-file-archive',
    // Code / Text
    txt: 'fa-file-alt', md: 'fa-file-alt', log: 'fa-file-alt',
    cfg: 'fa-file-alt', conf: 'fa-file-alt', ini: 'fa-file-alt',
    sh: 'fa-file-code', bash: 'fa-file-code', py: 'fa-file-code',
    js: 'fa-file-code', html: 'fa-file-code', css: 'fa-file-code',
    json: 'fa-file-code', xml: 'fa-file-code', yml: 'fa-file-code',
    yaml: 'fa-file-code', c: 'fa-file-code', cpp: 'fa-file-code',
    h: 'fa-file-code', java: 'fa-file-code', rs: 'fa-file-code',
    go: 'fa-file-code', ts: 'fa-file-code',
    // Documents
    pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word',
    odt: 'fa-file-word', xls: 'fa-file-excel', xlsx: 'fa-file-excel',
    csv: 'fa-file-csv',
  },

  get(name, isDir) {
    if (isDir) return 'fa-folder';
    const dot = name.lastIndexOf('.');
    if (dot === -1 || dot === name.length - 1) return 'fa-file';
    const ext = name.slice(dot + 1).toLowerCase();
    return this._map[ext] || 'fa-file';
  }
};
