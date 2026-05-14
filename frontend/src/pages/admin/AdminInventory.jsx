import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import Toast from '../../components/Toast';

const AdminInventory = () => {
    const [books, setBooks] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        author: '',
        status: 'Available',
        category: 'Fiction',
        releaseDate: '',
        description: '',
        total_copies: 3,
        available_copies: 3
    });
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const fetchBooks = () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        fetch('http://127.0.0.1:8000/books/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBooks(data);
                    setFilteredData(data);
                }
            });
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Filter Logic
    useEffect(() => {
        let res = books;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(b =>
                b.name.toLowerCase().includes(lower) ||
                b.author.toLowerCase().includes(lower) ||
                b.id.toLowerCase().includes(lower)
            );
        }
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                let dataKey = key.toLowerCase();
                if (key === 'Status') dataKey = 'status';
                if (key === 'Category') dataKey = 'category';
                res = res.filter(b => b[dataKey] === filters[key]);
            }
        });
        setFilteredData(res);
    }, [search, filters, books]);

    const handleSave = async (e) => {
        e.preventDefault();
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        const method = editBook ? 'PUT' : 'POST';
        const url = editBook ? `http://127.0.0.1:8000/books/${editBook.id}` : 'http://127.0.0.1:8000/books/';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(editBook ? 'Book updated successfully!' : 'Book added successfully!', 'success');
                setIsModalOpen(false);
                setEditBook(null);
                fetchBooks();
            } else {
                showToast('Failed to save book', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const handleEdit = (row) => {
        setEditBook(row);
        setFormData({
            ...row,
            description: row.description || '',
            total_copies: row.total_copies || 3,
            available_copies: row.available_copies || 3
        });
        setIsModalOpen(true);
    };

    const handleDelete = (row) => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = user?.access_token;

        if (window.confirm(`Archive "${row.name}"? This action cannot be undone.`)) {
            fetch(`http://127.0.0.1:8000/books/${row.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    showToast('Book archived successfully', 'success');
                    fetchBooks();
                })
                .catch(() => showToast('Failed to archive book', 'error'));
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Book Name', accessor: 'name', render: (row) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.name}</span> },
        { header: 'Author', accessor: 'author' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    row.status === 'Reserved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Total',
            accessor: 'total_copies',
            render: (row) => <span className="font-mono text-xs">{row.total_copies || 0}</span>
        },
        {
            header: 'Avail',
            accessor: 'available_copies',
            render: (row) => {
                const count = row.available_copies || 0;
                const colorClass = count === 0 ? 'text-red-600 dark:text-red-400' :
                    count === 1 ? 'text-amber-600 dark:text-amber-400' :
                        'text-green-600 dark:text-green-400';
                return <span className={`font-mono text-xs font-bold ${colorClass}`}>{count}</span>;
            }
        },
    ];

    const filterOptions = [
        { key: 'Status', label: 'Filter Status', options: ['Available', 'Checked Out', 'Reserved', 'Maintenance'] },
        { key: 'Category', label: 'Filter Category', options: ['Computer Science', 'Fiction', 'Fantasy', 'Business', 'Sci-Fi'] }
    ];

    return (
        <div className="animate-fade-in text-gray-600 dark:text-gray-300">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory Management</h1>
                </div>
                <button
                    onClick={() => {
                        setEditBook(null);
                        setFormData({
                            id: '',
                            name: '',
                            author: '',
                            status: 'Available',
                            category: 'Fiction',
                            releaseDate: '2024',
                            description: '',
                            total_copies: 3,
                            available_copies: 3
                        });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm shadow-sm transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Item
                </button>
            </div>

            <FilterBar onSearch={setSearch} filters={filterOptions} activeFilters={filters} onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} />

            <DataTable columns={columns} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{editBook ? 'Edit Book' : 'Add New Book'}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Book ID</label>
                                <input disabled={!!editBook} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" placeholder="e.g. 076" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Name</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Author</label>
                                <input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Release Date</label>
                                <input value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" placeholder="2024" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                                    <option>Available</option>
                                    <option>Checked Out</option>
                                    <option>Reserved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none">
                                    <option>Fiction</option>
                                    <option>Classic</option>
                                    <option>Sci-Fi</option>
                                    <option>Computer Science</option>
                                    <option>Business</option>
                                    <option>Fantasy</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Total Copies</label>
                                <input type="number" min="0" value={formData.total_copies} onChange={e => setFormData({ ...formData, total_copies: parseInt(e.target.value) })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Available Copies</label>
                                <input type="number" min="0" value={formData.available_copies} onChange={e => setFormData({ ...formData, available_copies: parseInt(e.target.value) })} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none" />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none resize-none"
                                rows="4"
                                placeholder="Enter book description, synopsis, or notes..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Save</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
