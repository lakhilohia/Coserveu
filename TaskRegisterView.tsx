import React, { useState } from 'react';
import { Company, Session, TaskItem, FileAttachment } from '../types';

interface TaskRegisterViewProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  session: Session;
  setDrill: (d: any) => void;
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    companyId: 'co-1',
    assignee: 'Accountant (Sumit Das)',
    assigneeRole: 'Accountant',
    task: 'Upload Bank Statement & Complete Bank Reconciliation for FY 2025-26',
    description: 'Download SBI bank statement in PDF/Excel and reconcile all unposted receipts and payments against sales/purchase registers.',
    category: 'Bank Reconciliation',
    priority: 'High',
    dateGiven: '2026-07-25',
    expectedDate: '2026-08-05T17:00',
    status: 'Pending',
    by: 'CA Abhishek Agarwal',
    ts: new Date().toISOString(),
  },
  {
    id: 'task-2',
    companyId: 'co-1',
    assignee: 'Data Entry Operator',
    assigneeRole: 'Data Entry',
    task: 'File GSTR-1 Monthly Return & Attach Portal Filing Screenshot',
    description: 'Ensure all B2B and B2C sales invoices are entered in sales register, file GSTR-1 on GST Portal, and attach ARN acknowledgement proof.',
    category: 'GST Compliance',
    priority: 'High',
    dateGiven: '2026-07-28',
    expectedDate: '2026-08-11T18:00',
    status: 'In Progress',
    by: 'Domain Expert',
    ts: new Date().toISOString(),
  },
  {
    id: 'task-3',
    companyId: 'co-1',
    assignee: 'CEO / Secretary',
    assigneeRole: 'Admin',
    task: 'Prepare Board Resolution & Shareholder Register (Form MGT-1)',
    description: 'Update statutory share register with member share certificates SH-1 and upload signed copy of quarterly Board Meeting proceedings.',
    category: 'MCA Compliance',
    priority: 'Medium',
    dateGiven: '2026-07-20',
    expectedDate: '2026-08-01T12:00',
    status: 'Delayed / Not Done',
    reason: 'Awaiting member signature on physical share certificates from remote village blocks.',
    by: 'CA Abhishek Agarwal',
    ts: new Date().toISOString(),
  },
];

export const TaskRegisterView: React.FC<TaskRegisterViewProps> = ({
  co,
  update,
  session,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState<TaskItem | null>(null);

  // Task creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('Accountant');
  const [newCategory, setNewCategory] = useState('Accounting & Vouchers');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newExpectedDate, setNewExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });

  // Task response modal state
  const [respStatus, setRespStatus] = useState<string>('Completed');
  const [respNotes, setRespNotes] = useState('');
  const [respProofAtt, setRespProofAtt] = useState<FileAttachment | null>(null);
  const [respReason, setRespReason] = useState('');
  const [respReasonAtt, setRespReasonAtt] = useState<FileAttachment | null>(null);
  const [respExpertFeedback, setRespExpertFeedback] = useState('');

  // Get all tasks (combine company tasks or defaults)
  const tasksList: TaskItem[] = co.tasks && co.tasks.length > 0 ? co.tasks : DEFAULT_TASKS;

  const isExpertOrCA =
    session.role === 'CA' ||
    session.role === 'Domain Expert' ||
    session.role === 'Admin' ||
    session.name.toLowerCase() === 'domainexpert';

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: 'task-' + Math.random().toString(36).slice(2, 9),
      companyId: co.id,
      assignee: newAssignee,
      assigneeRole: newAssignee.includes('Accountant') ? 'Accountant' : 'User',
      task: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      dateGiven: new Date().toISOString().slice(0, 10),
      expectedDate: newExpectedDate,
      status: 'Pending',
      by: session.name + ' (' + session.role + ')',
      ts: new Date().toISOString(),
    };

    update(c => {
      c.tasks = c.tasks || [...DEFAULT_TASKS];
      c.tasks.unshift(newTask);
    });

    setShowAssignModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (att: FileAttachment) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      callback({
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl,
        size: file.size,
        uploadedAt: new Date().toLocaleString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const openUpdateModal = (task: TaskItem) => {
    setActiveTaskModal(task);
    setRespStatus(task.status === 'Pending' ? 'Completed' : task.status);
    setRespNotes(task.completionNotes || '');
    setRespProofAtt(task.proofAttachment || null);
    setRespReason(task.reason || '');
    setRespReasonAtt(task.reasonAttachment || null);
    setRespExpertFeedback(task.expertFeedback || '');
  };

  const handleSaveTaskResponse = () => {
    if (!activeTaskModal) return;

    update(c => {
      const list = c.tasks && c.tasks.length > 0 ? c.tasks : [...DEFAULT_TASKS];
      const idx = list.findIndex(t => t.id === activeTaskModal.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: respStatus,
          completionNotes: respStatus === 'Completed' || respStatus === 'Approved by Expert' ? respNotes : list[idx].completionNotes,
          proofAttachment: respStatus === 'Completed' || respStatus === 'Approved by Expert' ? respProofAtt : list[idx].proofAttachment,
          reason: respStatus === 'Delayed / Not Done' ? respReason : list[idx].reason,
          reasonAttachment: respStatus === 'Delayed / Not Done' ? respReasonAtt : list[idx].reasonAttachment,
          completedAt: respStatus === 'Completed' ? new Date().toISOString() : list[idx].completedAt,
          expertFeedback: respExpertFeedback || list[idx].expertFeedback,
        };
      }
      c.tasks = list;
    });

    setActiveTaskModal(null);
  };

  // Filter tasks
  const filteredTasks = tasksList.filter(t => {
    const matchSearch =
      !search.trim() ||
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const pendingCount = tasksList.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedCount = tasksList.filter(t => t.status === 'Completed' || t.status === 'Approved by Expert').length;
  const delayedCount = tasksList.filter(t => t.status === 'Delayed / Not Done').length;

  return (
    <div className="space-y-6 text-xs text-slate-100">
      {/* Top Banner & Action */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h2 className="text-base font-bold text-slate-100">Task Register &amp; Deliverable Management</h2>
            <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              Domain Expert &amp; User Task Hub
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Domain Experts &amp; CAs assign tasks with expected delivery deadlines. Users submit deliverable proof or state delay reasons with supporting documents (PDF, Excel, PNG, etc.).
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto text-xs"
        >
          <span>➕</span>
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-slate-400 font-semibold text-[11px]">Total Active Tasks</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">{tasksList.length}</div>
        </div>

        <div className="bg-amber-950/30 border border-amber-900/60 p-3.5 rounded-xl">
          <div className="text-amber-300 font-semibold text-[11px]">⏳ Pending / In Progress</div>
          <div className="text-xl font-bold text-amber-200 font-mono mt-1">{pendingCount}</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/60 p-3.5 rounded-xl">
          <div className="text-emerald-300 font-semibold text-[11px]">✓ Completed / Approved</div>
          <div className="text-xl font-bold text-emerald-200 font-mono mt-1">{completedCount}</div>
        </div>

        <div className="bg-red-950/30 border border-red-900/60 p-3.5 rounded-xl">
          <div className="text-red-300 font-semibold text-[11px]">⚠️ Delayed / Not Done</div>
          <div className="text-xl font-bold text-red-200 font-mono mt-1">{delayedCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search tasks, assignees, category..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed / Not Done">Delayed / Not Done</option>
            <option value="Approved by Expert">Approved by Expert</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            No tasks match your search or filter options.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'Completed' || task.status === 'Approved by Expert';
            const isDelayed = task.status === 'Delayed / Not Done';

            // Check if overdue
            const now = new Date();
            const expDate = task.expectedDate ? new Date(task.expectedDate) : null;
            const isOverdue = expDate && expDate < now && !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-900/60'
                    : isDelayed
                    ? 'bg-red-950/20 border-red-900/60'
                    : isOverdue
                    ? 'bg-amber-950/30 border-amber-800/80'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-blue-300 border border-slate-700 px-2 py-0.5 rounded">
                        {task.category || 'General'}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          task.priority === 'High'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : task.priority === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {task.priority || 'Medium'} Priority
                      </span>

                      {isOverdue && (
                        <span className="text-[10px] font-bold bg-red-900 text-red-100 px-2 py-0.5 rounded border border-red-700 animate-pulse">
                          ⏰ Overdue Deadline
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{task.task}</h3>
                    {task.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span>👤 Assignee: <strong className="text-slate-200">{task.assignee}</strong></span>
                      <span>✍️ Given By: <strong className="text-slate-200">{task.by}</strong></span>
                      <span>📅 Date Given: <strong className="text-slate-300">{task.dateGiven}</strong></span>
                      <span>
                        🎯 Expected Delivery:{' '}
                        <strong className={isOverdue ? 'text-red-400 font-mono font-bold' : 'text-amber-300 font-mono'}>
                          {task.expectedDate ? new Date(task.expectedDate).toLocaleString() : 'Not Set'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Action Button */}
                  <div className="flex flex-col items-end gap-2 whitespace-nowrap self-start md:self-auto">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        task.status === 'Approved by Expert'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : task.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : task.status === 'Delayed / Not Done'
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : task.status === 'In Progress'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {task.status === 'Approved by Expert' ? '✓ Approved by CA/Expert' : task.status}
                    </span>

                    <button
                      onClick={() => openUpdateModal(task)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📝</span>
                      <span>{isExpertOrCA ? 'Review & Update Task' : 'Submit Proof / State Reason'}</span>
                    </button>
                  </div>
                </div>

                {/* Submissions Details box */}
                {(task.proofAttachment || task.reasonAttachment || task.completionNotes || task.reason || task.expertFeedback) && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                    {/* Completion notes & proof */}
                    {(task.completionNotes || task.proofAttachment) && (
                      <div className="space-y-1">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <span>✓ Deliverable Submitted:</span>
                        </div>
                        {task.completionNotes && <p className="text-slate-200 pl-4">{task.completionNotes}</p>}
                        {task.proofAttachment && (
                          <div className="mt-2 p-2 bg-slate-900 border border-emerald-800 rounded-lg flex items-center justify-between gap-2 max-w-lg">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-emerald-400 font-bold text-sm">📎</span>
                              <span className="text-slate-200 font-medium truncate">{task.proofAttachment.name}</span>
                              <span className="text-[10px] text-slate-400">({task.proofAttachment.uploadedAt})</span>
                            </div>
                            <a
                              href={task.proofAttachment.dataUrl}
                              download={task.proofAttachment.name}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors"
                            >
                              ⬇ Download Proof
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delay Reason & reason proof */}
                    {(task.reason || task.reasonAttachment) && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <div className="font-bold text-red-400 flex items-center gap-1.5">
                          <span>⚠️ Delay / Non-Completion Reason:</span>
                        </div>
                        {task.reason && <p className="text-slate-200 pl-4">{task.reason}</p>}
                        {task.reasonAttachment && (
                          <div className="mt-2 p-2 bg-slate-900 border border-red-800 rounded-lg flex items-center justify-between gap-2 max-w-lg">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-red-400 font-bold text-sm">📎</span>
                              <span className="text-slate-200 font-medium truncate">{task.reasonAttachment.name}</span>
                              <span className="text-[10px] text-slate-400">({task.reasonAttachment.uploadedAt})</span>
                            </div>
                            <a
                              href={task.reasonAttachment.dataUrl}
                              download={task.reasonAttachment.name}
                              className="bg-red-700 hover:bg-red-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors"
                            >
                              ⬇ Download Reason Proof
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expert Feedback */}
                    {task.expertFeedback && (
                      <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300">
                        <strong>💡 Expert Review Remark:</strong> {task.expertFeedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ASSIGN NEW TASK MODAL */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAssignModal(false)}
        >
          <form
            onSubmit={handleCreateTask}
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">➕ Assign New Task to User</h3>
              <p className="text-xs text-slate-400 mt-0.5">Specify task details, assignee, and expected delivery date &amp; time.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Task Title / Requirement *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Upload Bank Statement & Perform Bank Reconciliation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Detailed Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe step-by-step deliverable required from the user..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Assignee Person / Role</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    placeholder="e.g. Accountant, Data Entry, Board Member"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Accounting & Vouchers">Accounting &amp; Vouchers</option>
                    <option value="Bank Reconciliation">Bank Reconciliation</option>
                    <option value="GST Compliance">GST Compliance</option>
                    <option value="Income Tax & TDS">Income Tax &amp; TDS</option>
                    <option value="MCA Compliance">MCA Compliance</option>
                    <option value="Inventory Audit">Inventory Audit</option>
                    <option value="Statutory Audit">Statutory Audit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">⚪ Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Expected Delivery Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newExpectedDate}
                    onChange={e => setNewExpectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg text-xs transition-all"
              >
                ✓ Assign Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UPDATE TASK / SUBMIT DELIVERABLE / REASON MODAL */}
      {activeTaskModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveTaskModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 relative"
          >
            <button
              onClick={() => setActiveTaskModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                Task Update &amp; Deliverable Hub
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">{activeTaskModal.task}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Expected Delivery Deadline: <strong className="text-amber-300 font-mono">{activeTaskModal.expectedDate ? new Date(activeTaskModal.expectedDate).toLocaleString() : 'N/A'}</strong>
              </p>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Select Task Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'In Progress', label: '⏳ In Progress', color: 'bg-blue-950 text-blue-300 border-blue-700' },
                  { id: 'Completed', label: '✓ Completed (With Proof)', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
                  { id: 'Delayed / Not Done', label: '⚠️ Delayed (With Reason)', color: 'bg-red-950 text-red-300 border-red-700' },
                  ...(isExpertOrCA ? [{ id: 'Approved by Expert', label: '🌟 Approve & Close', color: 'bg-purple-950 text-purple-300 border-purple-700' }] : []),
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setRespStatus(s.id)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      respStatus === s.id ? `${s.color} ring-2 ring-blue-500 scale-[1.02]` : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* IF COMPLETED -> Notes & Proof Attachment */}
            {(respStatus === 'Completed' || respStatus === 'Approved by Expert') && (
              <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                  📝 Deliverable Completion Summary &amp; Proof Attachment
                </h4>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Completion Notes / Remarks</label>
                  <textarea
                    rows={2}
                    value={respNotes}
                    onChange={e => setRespNotes(e.target.value)}
                    placeholder="Enter details of work completed or report summary..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    📎 Upload Deliverable Proof Attachment (PDF, Excel, PNG, JPG, CSV, DOC)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={e => handleFileUpload(e, setRespProofAtt)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-emerald-100 hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Allowed formats: Bank PDF statement, GST return Excel sheet, portal screenshot (PNG/JPG), or signed DOC.
                  </p>

                  {respProofAtt && (
                    <div className="mt-3 p-2.5 bg-slate-950 border border-emerald-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-emerald-400 font-bold">📄</span>
                        <span className="text-slate-200 font-medium truncate">{respProofAtt.name}</span>
                        <span className="text-[10px] text-slate-400">({respProofAtt.uploadedAt})</span>
                      </div>
                      <a
                        href={respProofAtt.dataUrl}
                        download={respProofAtt.name}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                      >
                        ⬇ View / Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IF DELAYED / NOT DONE -> Reason & Reason Proof Attachment */}
            {respStatus === 'Delayed / Not Done' && (
              <div className="bg-red-950/30 border border-red-800/80 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-red-300 text-xs uppercase tracking-wider">
                  ⚠️ State Reason for Non-Delivery / Delay &amp; Attach Proof
                </h4>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Reason for Non-Delivery / Delay *</label>
                  <input
                    type="text"
                    value={respReason}
                    onChange={e => setRespReason(e.target.value)}
                    placeholder="e.g. Awaiting bank statement / GST portal error / Board approval pending"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-red-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'Bank Statement Awaited',
                      'Director Approval Pending',
                      'Portal Server Error',
                      'Supporting Invoices Missing',
                      'Auditor Review Pending',
                    ].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRespReason(r)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-red-200 border border-slate-700 px-2 py-0.5 rounded"
                      >
                        + {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    📎 Upload Supporting Proof for Reason (PDF, Excel, PNG, JPG, CSV, DOC)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={e => handleFileUpload(e, setRespReasonAtt)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-800 file:text-red-100 hover:file:bg-red-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Attach proof screenshot, official email copy, or notice PDF explaining reason for delay.
                  </p>

                  {respReasonAtt && (
                    <div className="mt-3 p-2.5 bg-slate-950 border border-red-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-red-400 font-bold">📄</span>
                        <span className="text-slate-200 font-medium truncate">{respReasonAtt.name}</span>
                        <span className="text-[10px] text-slate-400">({respReasonAtt.uploadedAt})</span>
                      </div>
                      <a
                        href={respReasonAtt.dataUrl}
                        download={respReasonAtt.name}
                        className="bg-red-700 hover:bg-red-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                      >
                        ⬇ View / Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expert Feedback Field */}
            {isExpertOrCA && (
              <div className="bg-purple-950/30 border border-purple-800/60 rounded-xl p-3.5 space-y-2 text-xs">
                <label className="text-purple-300 font-bold block uppercase text-[11px]">
                  💡 Domain Expert / CA Verification Comment
                </label>
                <input
                  type="text"
                  value={respExpertFeedback}
                  onChange={e => setRespExpertFeedback(e.target.value)}
                  placeholder="Enter expert review remarks or additional instructions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTaskResponse}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg text-xs transition-all"
              >
                ✓ Save Deliverable Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
