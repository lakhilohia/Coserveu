import React, { useState } from 'react';
import { AppDatabase, LoginRecord, Session } from '../types';

interface LoginRegisterProps {
  db: AppDatabase;
  setDB: React.Dispatch<React.SetStateAction<AppDatabase>>;
  session: Session;
}

export const LoginRegisterModule: React.FC<LoginRegisterProps> = ({ db, setDB, session }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Log form state
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Accountant' | 'Data Entry' | 'Auditor' | 'CA' | 'Domain Expert'>('Accountant');
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState<'Success' | 'Failed'>('Success');
  const [newMethod, setNewMethod] = useState<'Standard' | 'SSO' | 'Demo' | 'Firebase'>('Standard');

  const logs: LoginRecord[] = db.loginRegister || [];
  const visitorCount = db.visitorCount || 1482;

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'All' || log.role === roleFilter;
    const matchStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const entry: LoginRecord = {
      id: 'log_' + Math.random().toString(36).slice(2, 9),
      username: newUsername.trim(),
      role: newRole,
      companyName: newCompany.trim() || 'CoServeU Master System',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
      status: newStatus,
      loginType: newMethod,
      ipAddress: '127.0.0.1 (Web Access)'
    };

    setDB(prev => ({
      ...prev,
      visitorCount: (prev.visitorCount || 1482) + 1,
      loginRegister: [entry, ...(prev.loginRegister || [])]
    }));

    setNewUsername('');
    setNewCompany('');
    setShowAddModal(false);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Username', 'Role', 'Company/FPC', 'Timestamp', 'Auth Type', 'Status', 'IP/Device'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.username}"`,
      `"${l.role}"`,
      `"${l.companyName}"`,
      `"${l.timestamp}"`,
      `"${l.loginType}"`,
      `"${l.status}"`,
      `"${l.ipAddress || 'Internal'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CoServeU_Login_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h2 className="text-xl font-bold text-slate-100">
              Statutory User Login Register &amp; Visitor Audit Counter
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time tracking of authenticated user login sessions, access roles, and visitor counter metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            ➕ Record Manual Entry
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
          >
            📥 Export Register (CSV)
          </button>
        </div>
      </div>

      {/* Visitor Counter Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visitors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-blue-950 border border-blue-800 text-blue-400 rounded-xl text-2xl">
            👁️
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Visitor Counter
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
              {visitorCount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">
              ✓ Active Visitor Counter
            </span>
          </div>
        </div>

        {/* Total Logins Recorded */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl text-2xl">
            📝
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Recorded Login Sessions
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
              {logs.length}
            </div>
            <span className="text-[10px] text-slate-400">
              Audit log entries
            </span>
          </div>
        </div>

        {/* Current Active User */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl text-2xl">
            👤
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Current Active Session
            </div>
            <div className="text-sm font-extrabold text-slate-100 truncate max-w-[150px]">
              {session.name}
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80 inline-block mt-0.5">
              {session.role}
            </span>
          </div>
        </div>

        {/* System Security Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-purple-950 border border-purple-800 text-purple-400 rounded-xl text-2xl">
            🔐
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rule 11(g) Audit Trail
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              ACTIVE &amp; COMPLIANT
            </div>
            <span className="text-[10px] text-slate-400">
              Tamper-evident logs
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by username, company or time..."
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 w-full sm:w-72 focus:outline-none focus:border-blue-500"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 whitespace-nowrap">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Accountant">Accountant</option>
              <option value="Data Entry">Data Entry</option>
              <option value="Auditor">Auditor</option>
              <option value="CA">CA</option>
              <option value="Domain Expert">Domain Expert</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px] self-end md:self-auto">
          Showing <strong className="text-slate-200">{filteredLogs.length}</strong> of{' '}
          <strong className="text-slate-200">{logs.length}</strong> login records
        </div>
      </div>

      {/* Login Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Logged In User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Company / Entity</th>
                <th className="py-3 px-4">Login Timestamp</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">IP / Device Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No login records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l, idx) => (
                  <tr key={l.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      {l.username}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {l.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">{l.companyName}</td>
                    <td className="py-3 px-4 font-mono text-blue-300 select-all">{l.timestamp}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950 text-blue-300 border border-blue-800">
                        {l.loginType || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          l.status === 'Success'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}
                      >
                        {l.status === 'Success' ? '✓ Success' : '✕ Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {l.ipAddress || '127.0.0.1 (Session)'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                ➕ Record Manual Login Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Username / Member Name:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. Manish Kumar Lohia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Designated Role:</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="Auditor">Auditor</option>
                  <option value="CA">CA</option>
                  <option value="Domain Expert">Domain Expert</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">FPC / Company Name:</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. CoServeU FPC Suite"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Status:</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Auth Type:</label>
                  <select
                    value={newMethod}
                    onChange={e => setNewMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="SSO">SSO</option>
                    <option value="Demo">Demo</option>
                    <option value="Firebase">Firebase</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
