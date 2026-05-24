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

const SUB_GROUPS = {
  userlist: { label: 'Lista de usuarios', subtitle: 'userlist' },
  chroot: { label: 'Enjaular en directorio', subtitle: 'chroot' },
};

const CONFIG_SCHEMA = [
  {
    id: 'general',
    i18n: 'section.general',
    icon: 'cog',
    options: [
      { key: 'listen', type: 'bool', def: 'NO', desc: 'Run in standalone mode' },
      { key: 'listen_ipv6', type: 'bool', def: 'NO', desc: 'Listen on IPv6' },
      { key: 'background', type: 'bool', def: 'NO', desc: 'Background on startup' },
      { key: 'session_support', type: 'bool', def: 'NO', desc: 'Maintain PAM sessions' },
      { key: 'setproctitle_enable', type: 'bool', def: 'NO', desc: 'Show session status in process listing' },
      { key: 'run_as_launching_user', type: 'bool', def: 'NO', desc: 'Run as launching user' },
      { key: 'one_process_model', type: 'bool', def: 'NO', desc: 'Use one process model' },
    ]
  },
  {
    id: 'auth',
    i18n: 'section.auth',
    icon: 'lock',
    options: [
      { key: 'anonymous_enable', type: 'bool', def: 'NO', desc: 'Allow anonymous login' },
      { key: 'local_enable', type: 'bool', def: 'NO', desc: 'Allow local user login' },
      { key: 'guest_enable', type: 'bool', def: 'NO', desc: 'Enable guest access' },
      { key: 'guest_username', type: 'string', def: 'ftp', desc: 'Guest username mapping' },
      { key: 'pam_service_name', type: 'string', def: 'vsftpd', desc: 'PAM service name' },
      { key: 'check_shell', type: 'bool', def: 'YES', desc: 'Check /etc/shells for valid shell' },
      { key: 'userlist_enable', type: 'bool', def: 'NO', desc: 'Enable userlist', subGroup: 'userlist' },
      { key: 'userlist_deny', type: 'bool', def: 'YES', desc: 'Deny users in userlist', subGroup: 'userlist' },
      { key: 'userlist_file', type: 'file', def: '/etc/vsftpd.userlist', desc: 'Userlist file path', listFile: true, subGroup: 'userlist' },
      { key: 'secure_email_list_enable', type: 'bool', def: 'NO', desc: 'Require specific email passwords for anonymous' },
      { key: 'email_password_file', type: 'file', def: '', desc: 'Email password file' },
      { key: 'no_anon_password', type: 'bool', def: 'NO', desc: 'Do not require password for anonymous' },
      { key: 'ftp_username', type: 'string', def: 'ftp', desc: 'FTP username for anonymous' },
    ]
  },
  {
    id: 'access',
    i18n: 'section.access',
    icon: 'shield-alt',
    options: [
      { key: 'write_enable', type: 'bool', def: 'NO', desc: 'Allow write commands' },
      { key: 'download_enable', type: 'bool', def: 'YES', desc: 'Allow downloads' },
      { key: 'dirlist_enable', type: 'bool', def: 'YES', desc: 'Allow directory listings' },
      { key: 'chroot_local_user', type: 'bool', def: 'NO', desc: 'Chroot local users to home', subGroup: 'chroot' },
      { key: 'chroot_list_enable', type: 'bool', def: 'NO', desc: 'Enable chroot list', subGroup: 'chroot' },
      { key: 'chroot_list_file', type: 'file', def: '/etc/vsftpd.chroot_list', desc: 'Chroot list file', listFile: true, subGroup: 'chroot' },
      { key: 'allow_writeable_chroot', type: 'bool', def: 'NO', desc: 'Allow writeable chroot (needed on some systems)', subGroup: 'chroot' },
      { key: 'passwd_chroot_enable', type: 'bool', def: 'NO', desc: 'Chroot based on passwd file', subGroup: 'chroot' },
      { key: 'user_config_dir', type: 'file', def: '', desc: 'Per-user config directory' },
      { key: 'cmds_allowed', type: 'string', def: '', desc: 'Comma-separated allowed commands' },
      { key: 'cmds_denied', type: 'string', def: '', desc: 'Comma-separated denied commands' },
      { key: 'deny_file', type: 'string', def: '', desc: 'Regex of files to deny' },
      { key: 'hide_file', type: 'string', def: '', desc: 'Regex of files to hide' },
      { key: 'user_sub_token', type: 'string', def: '', desc: 'Token for substituting username in local_root' },
    ]
  },
  {
    id: 'anon',
    i18n: 'section.anon',
    icon: 'user-secret',
    options: [
      { key: 'anon_upload_enable', type: 'bool', def: 'NO', desc: 'Allow anonymous uploads' },
      { key: 'anon_mkdir_write_enable', type: 'bool', def: 'NO', desc: 'Allow anonymous dir creation' },
      { key: 'anon_other_write_enable', type: 'bool', def: 'NO', desc: 'Allow anonymous other writes' },
      { key: 'anon_world_readable_only', type: 'bool', def: 'YES', desc: 'Only world-readable files' },
      { key: 'anon_root', type: 'string', def: '', desc: 'Anonymous root directory' },
      { key: 'anon_max_rate', type: 'number', def: '0', desc: 'Max transfer rate (bytes/sec)' },
      { key: 'anon_umask', type: 'number', def: '077', desc: 'Umask for anonymous files' },
    ]
  },
  {
    id: 'local',
    i18n: 'section.local',
    icon: 'user',
    options: [
      { key: 'local_root', type: 'string', def: '', desc: 'Local user root directory' },
      { key: 'local_max_rate', type: 'number', def: '0', desc: 'Max transfer rate (bytes/sec)' },
      { key: 'local_umask', type: 'number', def: '077', desc: 'Umask for local users' },
      { key: 'chown_uploads', type: 'bool', def: 'NO', desc: 'Change ownership of uploaded files' },
      { key: 'chown_username', type: 'string', def: 'root', desc: 'Owner of uploaded files' },
      { key: 'chown_upload_mode', type: 'number', def: '0600', desc: 'File mode for uploaded files' },
      { key: 'virtual_use_local_privs', type: 'bool', def: 'NO', desc: 'Virtual users get local privs' },
      { key: 'file_open_mode', type: 'number', def: '0666', desc: 'File open mode for uploads' },
    ]
  },
  {
    id: 'network',
    i18n: 'section.network',
    icon: 'network-wired',
    options: [
      { key: 'listen_address', type: 'string', def: '', desc: 'IP address to listen on' },
      { key: 'listen_address6', type: 'string', def: '', desc: 'IPv6 address to listen on' },
      { key: 'listen_port', type: 'number', def: '21', desc: 'Control port' },
      { key: 'ftp_data_port', type: 'number', def: '20', desc: 'Data port' },
      { key: 'connect_from_port_20', type: 'bool', def: 'NO', desc: 'Use port 20 for data' },
      { key: 'pasv_enable', type: 'bool', def: 'YES', desc: 'Enable passive mode' },
      { key: 'pasv_address', type: 'string', def: '', desc: 'PASV IP address' },
      { key: 'pasv_addr_resolve', type: 'bool', def: 'NO', desc: 'Resolve PASV address via DNS' },
      { key: 'pasv_min_port', type: 'number', def: '0', desc: 'Min PASV port' },
      { key: 'pasv_max_port', type: 'number', def: '0', desc: 'Max PASV port' },
      { key: 'pasv_promiscuous', type: 'bool', def: 'NO', desc: 'Allow promiscuous PASV' },
      { key: 'port_enable', type: 'bool', def: 'YES', desc: 'Enable PORT mode' },
      { key: 'port_promiscuous', type: 'bool', def: 'NO', desc: 'Allow promiscuous PORT' },
      { key: 'accept_timeout', type: 'number', def: '60', desc: 'Timeout for PASV data connect (sec)' },
      { key: 'connect_timeout', type: 'number', def: '60', desc: 'Timeout for PORT data connect (sec)' },
      { key: 'data_connection_timeout', type: 'number', def: '300', desc: 'Data connection idle timeout (sec)' },
      { key: 'idle_session_timeout', type: 'number', def: '300', desc: 'Session idle timeout (sec)' },
    ]
  },
  {
    id: 'ssl',
    i18n: 'section.ssl',
    icon: 'lock',
    options: [
      { key: 'ssl_enable', type: 'bool', def: 'NO', desc: 'Enable SSL/TLS' },
      { key: 'allow_anon_ssl', type: 'bool', def: 'NO', desc: 'Allow anonymous SSL' },
      { key: 'force_anon_data_ssl', type: 'bool', def: 'NO', desc: 'Force SSL for anonymous data' },
      { key: 'force_anon_logins_ssl', type: 'bool', def: 'NO', desc: 'Force SSL for anonymous login' },
      { key: 'force_local_data_ssl', type: 'bool', def: 'YES', desc: 'Force SSL for local data' },
      { key: 'force_local_logins_ssl', type: 'bool', def: 'YES', desc: 'Force SSL for local login' },
      { key: 'implicit_ssl', type: 'bool', def: 'NO', desc: 'Use implicit SSL' },
      { key: 'rsa_cert_file', type: 'file', def: '/etc/ssl/certs/vsftpd.pem', desc: 'RSA cert file' },
      { key: 'rsa_private_key_file', type: 'file', def: '', desc: 'RSA private key file' },
      { key: 'dsa_cert_file', type: 'file', def: '', desc: 'DSA cert file' },
      { key: 'dsa_private_key_file', type: 'file', def: '', desc: 'DSA private key file' },
      { key: 'ca_certs_file', type: 'file', def: '', desc: 'CA certs file' },
      { key: 'require_cert', type: 'bool', def: 'NO', desc: 'Require client certificate' },
      { key: 'ssl_request_cert', type: 'bool', def: 'YES', desc: 'Request client certificate' },
      { key: 'ssl_ciphers', type: 'string', def: 'DES-CBC3-SHA', desc: 'SSL ciphers' },
      { key: 'ssl_sslv2', type: 'bool', def: 'NO', desc: 'Allow SSLv2' },
      { key: 'ssl_sslv3', type: 'bool', def: 'NO', desc: 'Allow SSLv3' },
      { key: 'ssl_tlsv1', type: 'bool', def: 'YES', desc: 'Allow TLSv1' },
      { key: 'debug_ssl', type: 'bool', def: 'NO', desc: 'SSL debug logging' },
      { key: 'require_ssl_reuse', type: 'bool', def: 'YES', desc: 'Require SSL session reuse' },
      { key: 'strict_ssl_read_eof', type: 'bool', def: 'NO', desc: 'Strict SSL read EOF' },
      { key: 'strict_ssl_write_shutdown', type: 'bool', def: 'NO', desc: 'Strict SSL write shutdown' },
      { key: 'validate_cert', type: 'bool', def: 'NO', desc: 'Validate client certificate' },
    ]
  },
  {
    id: 'limits',
    i18n: 'section.limits',
    icon: 'tachometer-alt',
    options: [
      { key: 'max_clients', type: 'number', def: '0', desc: 'Max concurrent clients (0=unlimited)' },
      { key: 'max_per_ip', type: 'number', def: '0', desc: 'Max connections per IP (0=unlimited)' },
      { key: 'max_login_fails', type: 'number', def: '3', desc: 'Max login failures before disconnect' },
      { key: 'local_max_rate', type: 'number', def: '0', desc: 'Local user max rate (bytes/sec)' },
      { key: 'anon_max_rate', type: 'number', def: '0', desc: 'Anonymous max rate (bytes/sec)' },
      { key: 'trans_chunk_size', type: 'number', def: '0', desc: 'Transfer chunk size' },
      { key: 'delay_failed_login', type: 'number', def: '1', desc: 'Delay after failed login (sec)' },
      { key: 'delay_successful_login', type: 'number', def: '0', desc: 'Delay after successful login (sec)' },
      { key: 'async_abor_enable', type: 'bool', def: 'NO', desc: 'Enable async ABOR' },
      { key: 'lock_upload_files', type: 'bool', def: 'YES', desc: 'Lock upload files' },
      { key: 'use_sendfile', type: 'bool', def: 'YES', desc: 'Use sendfile system call' },
    ]
  },
  {
    id: 'logging',
    i18n: 'section.logging',
    icon: 'chart-bar',
    options: [
      { key: 'xferlog_enable', type: 'bool', def: 'NO', desc: 'Enable transfer logging' },
      { key: 'xferlog_std_format', type: 'bool', def: 'NO', desc: 'Use wu-ftpd log format' },
      { key: 'xferlog_file', type: 'file', def: '/var/log/xferlog', desc: 'Transfer log file' },
      { key: 'vsftpd_log_file', type: 'file', def: '/var/log/vsftpd.log', desc: 'vsftpd log file' },
      { key: 'dual_log_enable', type: 'bool', def: 'NO', desc: 'Write both log formats' },
      { key: 'syslog_enable', type: 'bool', def: 'NO', desc: 'Use syslog instead of files' },
      { key: 'log_ftp_protocol', type: 'bool', def: 'NO', desc: 'Log all FTP commands' },
      { key: 'no_log_lock', type: 'bool', def: 'NO', desc: 'Disable log file locking' },
    ]
  },
  {
    id: 'advanced',
    i18n: 'section.advanced',
    icon: 'cogs',
    options: [
      { key: 'ascii_upload_enable', type: 'bool', def: 'NO', desc: 'Allow ASCII upload' },
      { key: 'ascii_download_enable', type: 'bool', def: 'NO', desc: 'Allow ASCII download' },
      { key: 'banner_file', type: 'file', def: '', desc: 'Banner file path' },
      { key: 'ftpd_banner', type: 'string', def: '', desc: 'Custom FTP banner' },
      { key: 'dirmessage_enable', type: 'bool', def: 'NO', desc: 'Show directory messages' },
      { key: 'message_file', type: 'string', def: '.message', desc: 'Directory message file name' },
      { key: 'delete_failed_uploads', type: 'bool', def: 'NO', desc: 'Delete failed uploads' },
      { key: 'force_dot_files', type: 'bool', def: 'NO', desc: 'Show dot files in listings' },
      { key: 'hide_ids', type: 'bool', def: 'NO', desc: 'Hide UID/GID in listings' },
      { key: 'ls_recurse_enable', type: 'bool', def: 'NO', desc: 'Allow recursive ls' },
      { key: 'mdtm_write', type: 'bool', def: 'YES', desc: 'Allow MDTM to set timestamps' },
      { key: 'secure_chroot_dir', type: 'file', def: '/var/run/vsftpd/empty', desc: 'Secure chroot dir' },
      { key: 'tcp_wrappers', type: 'bool', def: 'NO', desc: 'Use TCP wrappers' },
      { key: 'text_userdb_names', type: 'bool', def: 'NO', desc: 'Use text user/group names' },
      { key: 'tilde_user_enable', type: 'bool', def: 'NO', desc: 'Enable tilde user expansion' },
      { key: 'use_localtime', type: 'bool', def: 'NO', desc: 'Use local time instead of GMT' },
      { key: 'banned_email_file', type: 'file', def: '/etc/vsftpd.banned_emails', desc: 'Banned email file' },
      { key: 'deny_email_enable', type: 'bool', def: 'NO', desc: 'Enable email deny list' },
      { key: 'chmod_enable', type: 'bool', def: 'YES', desc: 'Allow SITE CHMOD' },
    ]
  }
];
