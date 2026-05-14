
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import toast from 'react-hot-toast';

const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [books, setBooks] = useState([]);
    const [orderData, setOrderData] = useState({ book_id: '', quantity: 1 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ id: '', name: '', contact: '', phone: '', status: 'Active', risk: 'Low' });
    const [isCreatingSup, setIsCreatingSup] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user'));

    const fetchSuppliers = () => {
        fetch('http://127.0.0.1:8000/suppliers', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSuppliers(data);
                    setFilteredData(data);
                }
            });
    };

    useEffect(() => {
        fetchSuppliers();

        fetch('http://127.0.0.1:8000/books/', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBooks(data);
            });
    }, []);

    useEffect(() => {
        let res = suppliers;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(s =>
                s.name.toLowerCase().includes(lower) ||
                s.contact.toLowerCase().includes(lower) ||
                s.id.toLowerCase().includes(lower)
            );
        }
        if (filters.Status) {
            res = res.filter(s => s.status === filters.Status);
        }
        setFilteredData(res);
    }, [search, filters, suppliers]);

    const handleOpenOrder = (supplier) => {
        setSelectedSupplier(supplier);
        setIsOrderModalOpen(true);
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const selectedBook = books.find(b => b.id === orderData.book_id);

        const payload = {
            book_id: orderData.book_id,
            book_name: selectedBook?.name || 'Unknown',
            supplier_id: selectedSupplier.id,
            quantity: parseInt(orderData.quantity)
        };

        fetch('http://127.0.0.1:8000/procurement/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.access_token}`
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                setIsSubmitting(false);
                if (data.status === 'success') {
                    toast.success("Procurement order placed successfully!");
                    setIsOrderModalOpen(false);
                    setOrderData({ book_id: '', quantity: 1 });
                } else {
                    toast.error(data.detail || "Failed to place order");
                }
            })
            .catch(() => setIsSubmitting(false));
    };

    const handleCreateSupplier = (e) => {
        e.preventDefault();
        setIsCreatingSup(true);

        fetch('http://127.0.0.1:8000/suppliers/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.access_token}`
            },
            body: JSON.stringify(newSupplier)
        })
            .then(res => res.json())
            .then(data => {
                setIsCreatingSup(false);
                if (data.status === 'success') {
                    setIsAddModalOpen(false);
                    setNewSupplier({ id: '', name: '', contact: '', phone: '', status: 'Active', risk: 'Low' });
                    fetchSuppliers();
                    toast.success("Supplier added successfully!");
                } else {
                    toast.error(data.detail || "Failed to add supplier");
                }
            })
            .catch(() => setIsCreatingSup(false));
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Supplier Name', accessor: 'name', render: (row) => <span className="font-bold text-gray-800 dark:text-gray-100">{row.name}</span> },
        { header: 'Contact', accessor: 'contact' },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Risk Profile',
            accessor: 'risk',
            render: (row) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${row.risk === 'Low' ? 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400' :
                    row.risk === 'Medium' ? 'border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400' :
                        'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400'
                    }`}>
                    {row.risk}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'procure',
            render: (row) => (
                <button
                    onClick={() => handleOpenOrder(row)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                >
                    Place Order
                </button>
            )
        }
    ];

    const handleEdit = (row) => toast('Edit feature coming soon', { icon: '🚧' });
    const handleDelete = (row) => {
        if (confirm(`Archive supplier ${row.name}?`)) {
            fetch(`http://127.0.0.1:8000/suppliers/${row.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            }).then(() => {
                fetchSuppliers();
                toast.success('Supplier archived');
            });
        }
    }

    const filterOptions = [
        { key: 'Status', label: 'Filter Status', options: ['Active', 'Review', 'Inactive'] }
    ];

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Supplier Management</h1>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm shadow-sm transition-colors"
                >
                    Add Supplier
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
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Place Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Place Stock Order</h2>
                        <p className="text-sm text-gray-500 mb-6">Supplier: <span className="font-bold text-gray-700 dark:text-gray-300">{selectedSupplier?.name}</span></p>

                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Select Resource</label>
                                <select
                                    required
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={orderData.book_id}
                                    onChange={e => setOrderData({ ...orderData, book_id: e.target.value })}
                                >
                                    <option value="">-- Choose Book --</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>{book.name} (Current: {book.available_copies})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={orderData.quantity}
                                    onChange={e => setOrderData({ ...orderData, quantity: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOrderModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-500 font-bold uppercase text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Supplier Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Register New Supplier</h2>

                        <form onSubmit={handleCreateSupplier} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Supplier ID</label>
                                    <input
                                        placeholder="SUP-X"
                                        required
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                        value={newSupplier.id}
                                        onChange={e => setNewSupplier({ ...newSupplier, id: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Company Name</label>
                                    <input
                                        required
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                        value={newSupplier.name}
                                        onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                    value={newSupplier.contact}
                                    onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Phone</label>
                                <input
                                    required
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                    value={newSupplier.phone}
                                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Risk Profile</label>
                                    <select
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                        value={newSupplier.risk}
                                        onChange={e => setNewSupplier({ ...newSupplier, risk: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Contract Status</label>
                                    <select
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                                        value={newSupplier.status}
                                        onChange={e => setNewSupplier({ ...newSupplier, status: e.target.value })}
                                    >
                                        <option>Active</option>
                                        <option>Review</option>
                                        <option>Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-500 font-bold uppercase text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingSup}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
                                >
                                    {isCreatingSup ? 'Adding...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSuppliers;
