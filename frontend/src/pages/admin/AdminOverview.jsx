import React, { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBooks: 0,
        lowStock: 0,
        outOfStock: 0,
        failedLogins: 0,
        lockedAccounts: 0,
        activeSuppliers: 0,
        pendingApprovals: 0
    });
    const [lowStockUsers, setLowStockBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const user = JSON.parse(sessionStorage.getItem('user'));
    const token = user?.access_token;

    useEffect(() => {
        // Fetch stats
        fetch('http://127.0.0.1:8000/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Stats fetch error:", err));

        // Fetch detailed low-stock list
        fetch('http://127.0.0.1:8000/books/low-stock', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setLowStockBooks(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Low stock error:", err);
                setIsLoading(false);
            });
    }, [token]);

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
            </div>

            {/* Main Stats Row */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Books" value={stats.totalBooks} color="blue" subtext="Current catalog" />
                <StatCard title="Low Stock" value={stats.lowStock} color="amber" subtext="Under threshold" />
                <StatCard title="Failed Logins" value={stats.failedLogins} color="red" subtext="24h Window" />
                <StatCard title="Suppliers" value={stats.activeSuppliers} color="green" subtext="Active vendors" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Low Stock Priority Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Priority Restock Items
                        </h3>
                        <button
                            onClick={() => navigate('/admin/inventory')}
                            className="text-xs text-blue-600 font-bold hover:underline"
                        >
                            View All Inventory
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Book ID</th>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Level</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {lowStockUsers.length > 0 ? (
                                    lowStockUsers.map(book => (
                                        <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{book.id}</td>
                                            <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">{book.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${book.available_copies === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {book.available_copies} Left
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => navigate('/admin/suppliers')}
                                                    className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-blue-700"
                                                >
                                                    Order More
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-10 text-center text-gray-400 italic">
                                            {isLoading ? 'Scanning inventory...' : 'All inventory levels are healthy!'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Security Status */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Security Pulse
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Locked Accounts</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stats.lockedAccounts}</p>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Active Suppliers</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stats.activeSuppliers}</p>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/audit')}
                            className="w-full py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors uppercase tracking-wider"
                        >
                            View Audit History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
