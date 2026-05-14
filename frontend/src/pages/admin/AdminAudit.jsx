
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import toast from 'react-hot-toast';

const AdminAudit = () => {
    const [logs, setLogs] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedLog, setSelectedLog] = useState(null);

    const user = JSON.parse(sessionStorage.getItem('user'));

    const fetchLogs = () => {
        fetch('http://127.0.0.1:8000/audit', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLogs(data);
                    setFilteredData(data);
                }
            });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        let res = logs;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(l =>
                l.email.toLowerCase().includes(lower) ||
                l.action.toLowerCase().includes(lower) ||
                l.resource.toLowerCase().includes(lower)
            );
        }
        if (filters.Status) {
            res = res.filter(l => l.status === filters.Status);
        }
        setFilteredData(res);
    }, [search, filters, logs]);

    const columns = [
        { header: 'Time', accessor: 'timestamp', render: (row) => <span className="font-mono text-xs text-gray-500">{row.timestamp}</span> },
        {
            header: 'Identity', accessor: 'email', render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{row.role}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{row.email}</span>
                </div>
            )
        },
        {
            header: 'Action', accessor: 'action', render: (row) => (
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{row.action}</span>
            )
        },
        {
            header: 'Resource', accessor: 'resource', render: (row) => (
                <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">{row.resource}</span>
            )
        },
        {
            header: 'Outcome', accessor: 'status', render: (row) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${row.status === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleView = (row) => {
        setSelectedLog(row);
    };

    const handleFlag = (row) => {
        toast.success(`Log ${row.id} flagged for security review.`);
    };

    const actions = (row) => (
        <div className="flex justify-end gap-2">
            <button onClick={() => handleView(row)} className="text-gray-600 hover:text-blue-600 text-xs font-medium dark:text-gray-400 dark:hover:text-blue-400">Details</button>
            <button onClick={() => handleFlag(row)} className="text-gray-400 hover:text-red-600 text-xs font-medium dark:hover:text-red-400">Flag</button>
        </div>
    );

    const filterOptions = [
        { key: 'Status', label: 'All Statuses', options: ['Success', 'Failure'] }
    ];

    const handleExport = () => {
        fetch('http://127.0.0.1:8000/audit/export', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(err => console.error("Export failed:", err));
    };

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Audit Logs</h1>
                </div>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                </button>
            </div>

            <FilterBar
                onSearch={setSearch}
                filters={filterOptions}
                activeFilters={filters}
                onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
            />

            <DataTable
                columns={columns}
                data={filteredData}
                actions={actions}
            />

            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="font-mono text-sm opacity-50">#{selectedLog.id}</span>
                                Event Details
                            </h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Timestamp</label>
                                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{selectedLog.timestamp}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Role</label>
                                    <p className="font-medium text-sm text-blue-600 dark:text-blue-400">{selectedLog.role}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Email / Identity</label>
                                <p className="font-bold text-gray-800 dark:text-white">{selectedLog.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Action Type</label>
                                    <p className="font-bold text-gray-800 dark:text-white">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Resource</label>
                                    <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{selectedLog.resource}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-100 dark:border-gray-700">
                                <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Log String</label>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                                    {`[${selectedLog.timestamp}] ${selectedLog.role} ${selectedLog.email} ${selectedLog.action} ${selectedLog.resource} ${selectedLog.status}`}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 flex justify-end">
                            <button
                                onClick={() => { handleFlag(selectedLog); setSelectedLog(null); }}
                                className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-8a2 2 0 01-2-2h5l2 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4 0V5a2 2 0 114 0" /></svg>
                                Escalate Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAudit;
