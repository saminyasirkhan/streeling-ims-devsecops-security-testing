
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Student' });
    const [isCreating, setIsCreating] = useState(false);

    // reset pwd
    const [resetData, setResetData] = useState(null); // { username: '', password: '' }
    // Removed local toast state

    const fetchUsers = () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        fetch('http://127.0.0.1:8000/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                // If it's an array (success)
                if (Array.isArray(data)) {
                    const augmented = data.map(u => ({ ...u, status: 'Active', lastLogin: '-' }));
                    setUsers(augmented);
                    setFilteredData(augmented);
                } else {
                    console.error("Failed to fetch users:", data);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let res = users;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(u => u.username.toLowerCase().includes(lower));
        }
        if (filters.Role) {
            res = res.filter(u => u.role === filters.Role);
        }
        setFilteredData(res);
    }, [search, filters, users]);

    const handleToggleLock = (row) => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;
        const newLockedStatus = !row.is_locked;

        if (confirm(`${newLockedStatus ? 'Lock' : 'Unlock'} account for ${row.username}?`)) {
            fetch(`http://127.0.0.1:8000/users/${row.username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_locked: newLockedStatus })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        fetchUsers();
                        toast.success(`Account ${newLockedStatus ? 'locked' : 'unlocked'} successfully`);
                    } else {
                        toast.error(`Action failed: ${data.detail}`);
                    }
                });
        }
    };

    const initiateReset = (row) => {
        setResetData({ username: row.username, password: '' });
    };

    const handleConfirmReset = (e) => {
        e.preventDefault();
        if (!resetData || !resetData.password) return;

        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        fetch(`http://127.0.0.1:8000/users/${resetData.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: resetData.password })
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        let msg = "Failed to update password";
                        if (typeof data.detail === 'string') {
                            msg = data.detail;
                        } else if (Array.isArray(data.detail)) {
                            msg = data.detail.map(err => err.msg).join(', ');
                        }
                        throw new Error(msg);
                    });
                }
                return res.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    toast.success(`Password updated for ${resetData.username}`);
                    setResetData(null);
                }
            })
            .catch(err => {
                console.error("Reset error:", err);
                toast.error(err.message || "An error occurred during password reset");
            });
    };

    const handleDelete = (row) => {
        if (confirm(`Permanently remove ${row.username}?`)) {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const token = user?.access_token;

            fetch(`http://127.0.0.1:8000/users/${row.username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        fetchUsers();
                        toast.success('User removed successfully');
                    } else {
                        toast.error(data.detail || "Delete failed");
                    }
                });
        }
    }

    const handleCreateUser = (e) => {
        e.preventDefault();
        setIsCreating(true);
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        fetch('http://127.0.0.1:8000/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newUser)
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        let msg = "Failed to create user";
                        if (typeof data.detail === 'string') {
                            msg = data.detail;
                        } else if (Array.isArray(data.detail)) {
                            // Handle Pydantic validation errors (422)
                            msg = data.detail.map(err => err.msg).join(', ');
                        }
                        throw new Error(msg);
                    });
                }
                return res.json();
            })
            .then(data => {
                setIsCreating(false);
                if (data.status === 'success') {
                    setIsModalOpen(false);
                    setNewUser({ username: '', password: '', role: 'Student' });
                    fetchUsers();
                    toast.success('User created successfully');
                }
            })
            .catch(err => {
                setIsCreating(false);
                console.error("User Creation Error:", err);
                toast.error(err.message || "An error occurred");
            });
    };

    const columns = [
        {
            header: 'Username', accessor: 'username', render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {row.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                </div>
            )
        },
        {
            header: 'Role', accessor: 'role', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    row.role === 'Librarian' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Status', accessor: 'status', render: (row) => (
                <span className="flex items-center gap-1.5 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${row.is_locked ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <span className={row.is_locked ? 'text-red-600' : 'text-green-600'}>{row.is_locked ? 'Locked' : 'Active'}</span>
                </span>
            )
        },
        { header: 'Last Login', accessor: 'lastLogin' },
    ];

    const actions = (row) => {
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        const isSelf = row.username === currentUser?.username;

        return (
            <div className="flex justify-end gap-2 text-gray-600 dark:text-gray-400">
                <button
                    onClick={() => handleToggleLock(row)}
                    disabled={isSelf}
                    className={`${row.is_locked ? 'text-green-600 hover:text-green-800' : 'text-amber-600 hover:text-amber-800'} text-xs font-medium ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={isSelf ? "You cannot lock yourself" : ""}
                >
                    {row.is_locked ? 'Unlock' : 'Lock'}
                </button>
                <button onClick={() => initiateReset(row)} className="hover:text-gray-900 text-xs font-medium dark:hover:text-white">Reset Pwd</button>
                <button
                    onClick={() => handleDelete(row)}
                    disabled={isSelf}
                    className={`text-red-600 hover:text-red-900 text-xs font-medium ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={isSelf ? "You cannot remove yourself" : ""}
                >
                    Remove
                </button>
            </div>
        );
    };

    const filterOptions = [
        { key: 'Role', label: 'Filter Role', options: ['Student', 'Librarian', 'Admin'] }
    ];

    return (
        <div className="animate-fade-in">
            {/* Toast removed (using global) */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm shadow-sm transition-colors"
                >
                    Create User
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Username (Email)</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="role.name@streeling.ac.uk"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                                    Must follow: {newUser.role.toLowerCase()}...@streeling.ac.uk
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Initial Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                                    Min. 10 chars: Uppercase, lowercase, number, & special char (!@#$%).
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">User Role</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Librarian">Librarian</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resetData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Reset Password</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For user: {resetData.username}</p>
                        </div>
                        <form onSubmit={handleConfirmReset} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={resetData.password}
                                    onChange={e => setResetData({ ...resetData, password: e.target.value })}
                                    autoFocus
                                />
                                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                                    Min. 10 chars: Uppercase, lowercase, number, & special char (!@#$%).
                                </p>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setResetData(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-amber-900/20"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
