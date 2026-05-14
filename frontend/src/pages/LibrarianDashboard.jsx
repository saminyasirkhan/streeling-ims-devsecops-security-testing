import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const LibrarianDashboard = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', category: '' });
    const [newBook, setNewBook] = useState({
        id: '',
        name: '',
        author: '',
        status: 'Available',
        category: '',
        releaseDate: ''
    });

    const [activeTab, setActiveTab] = useState('inventory');
    const [issueForm, setIssueForm] = useState({ studentId: '', bookId: '' });
    const [returnBookId, setReturnBookId] = useState('');
    const [pendingLoans, setPendingLoans] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentLoans, setStudentLoans] = useState([]);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    const [activeAction, setActiveAction] = useState(null); // { type: 'approve' | 'deny', loanId: '', username: '' }
    const [actionInput, setActionInput] = useState('');

    const [editingBook, setEditingBook] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isProcurementLoading, setIsProcurementLoading] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    useEffect(() => {
        fetchBooks();
        fetchPendingLoans();
        fetchSuppliers();
        fetchOrders();
        fetchActivityLogs();
    }, []);

    const user = JSON.parse(sessionStorage.getItem('user'));

    const fetchBooks = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/books');
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
                setFilteredBooks(data);
            }
        } catch (error) {
            console.error('Failed to fetch books:', error);
        }
    };

    useEffect(() => {
        let filtered = books;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(book =>
                book.name.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.id.toLowerCase().includes(query)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(book => book.status === filters.status);
        }

        if (filters.category) {
            filtered = filtered.filter(book => book.category === filters.category);
        }

        setFilteredBooks(filtered);
    }, [searchQuery, filters, books]);

    const fetchPendingLoans = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/loans/pending', {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingLoans(data);
            }
        } catch (error) {
            console.error('Failed to fetch pending loans:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/suppliers', {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    const fetchOrders = async () => {
        setIsProcurementLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/procurement/orders', {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsProcurementLoading(false);
        }
    };

    const fetchActivityLogs = async () => {
        setIsLogsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/audit/staff', {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActivityLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setIsLogsLoading(false);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://127.0.0.1:8000/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook)
            });
            fetchBooks();
            setNewBook({ id: '', name: '', author: '', status: 'Available', category: '', releaseDate: '' });
        } catch (error) {
            console.error('Failed to add book:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await fetch(`http://127.0.0.1:8000/books/${id}`, { method: 'DELETE' });
                fetchBooks();
                toast.success("Book deleted successfully");
            } catch (error) {
                console.error('Failed to delete book:', error);
                toast.error("Failed to delete book");
            }
        }
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://127.0.0.1:8000/books/${editingBook.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.access_token}`
                },
                body: JSON.stringify({
                    name: editingBook.name,
                    author: editingBook.author,
                    status: editingBook.status,
                    category: editingBook.category,
                    releaseDate: editingBook.releaseDate,
                    total_copies: editingBook.total_copies,
                    available_copies: editingBook.available_copies,
                    description: editingBook.description
                })
            });
            if (res.ok) {
                toast.success("Book updated successfully!");
                fetchBooks();
                setEditingBook(null);
            } else {
                const data = await res.json();
                toast.error(data.detail || "Update failed");
            }
        } catch (error) {
            console.error('Failed to update book:', error);
            toast.error("Error connecting to server");
        }
    };

    const handleIssueBook = (e) => {
        e.preventDefault();
        console.log('Issuing book:', issueForm);
        toast.success(`Book ${issueForm.bookId} issued to ${issueForm.studentId}`);
        setIssueForm({ studentId: '', bookId: '' });
    };

    const handleReturnBook = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://127.0.0.1:8000/loans/return-by-book/${returnBookId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                toast.success(`Book ${returnBookId} returned successfully!`);
                setReturnBookId('');
                fetchBooks();
                fetchPendingLoans();
            } else {
                const data = await res.json();
                toast.error(data.detail || "Return failed. Check Book ID.");
            }
        } catch (error) {
            console.error('Failed to return book:', error);
            toast.error("Error connecting to server");
        }
    };

    const initiateApprove = (loan) => {
        setActiveAction({ type: 'approve', loanId: loan.id, username: loan.username });
        setActionInput('2024-01-15'); // Default due date
    };

    const initiateDeny = (loan) => {
        setActiveAction({ type: 'deny', loanId: loan.id, username: loan.username });
        setActionInput('');
    };

    const handleConfirmAction = async (e) => {
        e.preventDefault();
        if (!activeAction) return;

        const { type, loanId } = activeAction;

        try {
            if (type === 'approve') {
                const res = await fetch(`http://127.0.0.1:8000/loans/${loanId}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.access_token}`
                    },
                    body: JSON.stringify({ due_date: actionInput })
                });
                if (res.ok) {
                    toast.success("Loan approved!");
                    fetchPendingLoans();
                    fetchBooks();
                    setActiveAction(null);
                } else {
                    const data = await res.json();
                    toast.error(data.detail || "Approval failed");
                }
            } else if (type === 'deny') {
                const res = await fetch(`http://127.0.0.1:8000/loans/${loanId}/deny`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.access_token}`
                    },
                    body: JSON.stringify({ denial_reason: actionInput })
                });
                if (res.ok) {
                    toast.success("Loan denied.");
                    fetchPendingLoans();
                    setActiveAction(null);
                } else {
                    const data = await res.json();
                    toast.error(data.detail || "Denial failed");
                }
            }
        } catch (error) {
            console.error(`Failed to ${type} loan:`, error);
            toast.error(`Error processing request`);
        }
    };

    const handleViewStudentProfile = async (studentId, username) => {
        setSelectedStudent({ id: studentId, username });
        setIsProfileLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/loans/user/${studentId}`, {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudentLoans(data);
            }
        } catch (error) {
            console.error('Failed to fetch student profile data:', error);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const StudentProfileModal = ({ student, loans, onClose, loading }) => {
        if (!student) return null;
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="p-6 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl text-white">
                                {student.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{student.username}'s Profile</h2>
                                <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Student ID: {student.id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Loan History & Status</h3>

                        {loading ? (
                            <div className="py-20 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : loans.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 text-xs font-bold text-slate-500 uppercase px-4 pb-2 border-b border-slate-700/50">
                                    <div className="col-span-1 text-left">Book Title</div>
                                    <div className="col-span-1 text-center">Status</div>
                                    <div className="col-span-1 text-center">Due Date</div>
                                    <div className="col-span-1 text-right">Reason</div>
                                </div>
                                {loans.map(loan => (
                                    <div key={loan.id} className="grid grid-cols-4 items-center bg-slate-900/30 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-700/30 transition-colors">
                                        <div className="col-span-1">
                                            <p className="font-semibold text-white truncate text-sm">{loan.book_name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{loan.book_id}</p>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${loan.status === 'Active' ? 'bg-green-900/30 text-green-400 border-green-900/50' :
                                                loan.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' :
                                                    loan.status === 'Denied' ? 'bg-red-900/30 text-red-400 border-red-900/50' :
                                                        'bg-slate-700 text-slate-300 border-slate-600'
                                                }`}>
                                                {loan.status}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-center text-xs text-slate-300 font-mono">
                                            {loan.due_date || '-'}
                                        </div>
                                        <div className="col-span-1 text-right text-[10px] text-slate-500 italic max-h-12 overflow-hidden">
                                            {loan.denial_reason || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 italic">
                                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                <span>No loan history found for this student.</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30">
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            <Navbar />

            <main className="p-8 flex justify-center">
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Librarian Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8 bg-slate-800/50 p-2 rounded-xl w-fit border border-slate-700/50">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'inventory'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Inventory Management
                        </button>
                        <button
                            onClick={() => setActiveTab('circulation')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'circulation'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Circulation Desk
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'reservations'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Reservations
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {pendingLoans.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('suppliers')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'suppliers'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Suppliers & Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'activity'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            Library Activity
                        </button>
                    </div>

                    <div className="animation-fade-in">

                        {activeTab === 'inventory' && (
                            <div className="space-y-8">
                                <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700/50">
                                    <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4">
                                        Add New Book
                                    </h2>
                                    <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Book ID</label>
                                            <input
                                                placeholder="e.g. 101"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={newBook.id}
                                                onChange={e => setNewBook({ ...newBook, id: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Title</label>
                                            <input
                                                placeholder="The Great Gatsby"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={newBook.name}
                                                onChange={e => setNewBook({ ...newBook, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Author</label>
                                            <input
                                                placeholder="Scott Fitzgerald"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={newBook.author}
                                                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Status</label>
                                            <select
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={newBook.status}
                                                onChange={e => setNewBook({ ...newBook, status: e.target.value })}
                                            >
                                                <option>Available</option>
                                                <option>Checked Out</option>
                                                <option>Reserved</option>
                                                <option>Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category</label>
                                            <input
                                                placeholder="Fiction"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={newBook.category}
                                                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="lg:col-span-1 flex items-end">
                                            <button
                                                type="submit"
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-green-900/30 transition-all"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700/50 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            placeholder="Search by book name, author, or ID..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-900/50 text-slate-300 font-semibold border-b border-slate-700">
                                                <tr>
                                                    <th className="p-5 w-24">ID</th>
                                                    <th className="p-5">Book Name</th>
                                                    <th className="p-5">Author</th>
                                                    <th className="p-5">Status</th>
                                                    <th className="p-5">Copies (Avail/Total)</th>
                                                    <th className="p-5">Category</th>
                                                    <th className="p-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                                                    <tr key={book.id} className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-5 font-mono text-slate-400">{book.id}</td>
                                                        <td className="p-5 font-medium text-white">{book.name}</td>
                                                        <td className="p-5 text-slate-400">{book.author}</td>
                                                        <td className="p-5">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${book.available_copies > 0
                                                                    ? 'bg-green-900/30 text-green-400 border-green-900/50'
                                                                    : 'bg-amber-900/30 text-amber-400 border-amber-900/50'
                                                                    }`}
                                                            >
                                                                {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="p-5 text-slate-400 font-mono">
                                                            {book.available_copies} / {book.total_copies}
                                                        </td>
                                                        <td className="p-5 text-slate-400">{book.category}</td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setEditingBook(book)}
                                                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(book.id)}
                                                                    className="text-red-400 hover:text-red-300 font-medium transition-colors hover:bg-red-900/20 px-3 py-1.5 rounded-lg"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="7" className="p-10 text-center text-slate-400 italic">
                                                            No books found matching "{searchQuery}"
                                                        </td>
                                                    </tr>
                                                )}
                                                {books.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="p-12 text-center text-slate-500">
                                                            No books found in inventory.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Circulation Desk Tab */}
                        {activeTab === 'circulation' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-8 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                                        <div className="bg-blue-600/20 p-2 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Issue Book</h2>
                                    </div>

                                    <form onSubmit={handleIssueBook} className="space-y-6 flex-1 flex flex-col">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Student Username / ID</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. johndoe"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={issueForm.studentId}
                                                onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Book ID</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CS-101"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
                                                value={issueForm.bookId}
                                                onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98]"
                                            >
                                                Confirm Issue
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-8 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                                        <div className="bg-green-600/20 p-2 rounded-lg">
                                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Return Book</h2>
                                    </div>

                                    <form onSubmit={handleReturnBook} className="space-y-6 flex-1 flex flex-col">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Book ID</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CS-101"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-slate-500 transition-all"
                                                value={returnBookId}
                                                onChange={e => setReturnBookId(e.target.value)}
                                                required
                                            />
                                            <div className="mt-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                                                <p className="text-sm text-slate-400 flex items-start gap-2">
                                                    <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Scan the barcode or enter ID manually. Returned books will be marked 'Available' immediately.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="submit"
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-900/30 transition-all transform active:scale-[0.98]"
                                            >
                                                Confirm Return
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reservations' && (
                            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900/50 text-slate-300 font-semibold border-b border-slate-700">
                                            <tr>
                                                <th className="p-5">Student</th>
                                                <th className="p-5">Book Requested</th>
                                                <th className="p-5">Request Date</th>
                                                <th className="p-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {pendingLoans.map((loan) => (
                                                <tr key={loan.id} className="hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-5">
                                                        <button
                                                            onClick={() => handleViewStudentProfile(loan.user_id, loan.username)}
                                                            className="flex items-center gap-3 hover:text-blue-400 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white group-hover:bg-blue-500 shadow-lg shadow-blue-900/30">
                                                                {loan.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-semibold">{loan.username}</span>
                                                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </button>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-medium text-white">{loan.book_name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{loan.book_id}</div>
                                                    </td>
                                                    <td className="p-5 text-slate-400 font-mono">{loan.borrow_date}</td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => initiateApprove(loan)}
                                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-green-900/20"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => initiateDeny(loan)}
                                                                className="bg-slate-700 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Deny
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {pendingLoans.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="p-12 text-center text-slate-500">
                                                        No pending reservations found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Suppliers & Orders Tab */}
                        {activeTab === 'suppliers' && (
                            <div className="space-y-8">
                                {/* Top Half: Suppliers */}
                                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                                    <div className="p-6 border-b border-slate-700 bg-slate-900/30">
                                        <h2 className="text-xl font-bold text-white">Registered Suppliers</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-900/50 text-slate-300 font-semibold border-b border-slate-700">
                                                <tr>
                                                    <th className="p-5">Vendor Name</th>
                                                    <th className="p-5">Contact</th>
                                                    <th className="p-5">Phone</th>
                                                    <th className="p-5">Status</th>
                                                    <th className="p-5">Risk</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {suppliers.length > 0 ? suppliers.map((sup) => (
                                                    <tr key={sup.id} className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-5">
                                                            <div className="font-bold text-white">{sup.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono uppercase">{sup.id}</div>
                                                        </td>
                                                        <td className="p-5 text-slate-300">{sup.contact}</td>
                                                        <td className="p-5 text-slate-400 font-mono text-xs">{sup.phone}</td>
                                                        <td className="p-5">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sup.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-amber-900/30 text-amber-400 border border-amber-900/50'}`}>
                                                                {sup.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${sup.risk === 'Low' ? 'border-green-900/50 text-green-400' : sup.risk === 'Medium' ? 'border-amber-900/50 text-amber-400' : 'border-red-900/50 text-red-400'}`}>
                                                                {sup.risk}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="p-10 text-center text-slate-500 italic">No suppliers found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Bottom Half: Outstanding Orders */}
                                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                                    <div className="p-6 border-b border-slate-700 bg-slate-900/30">
                                        <h2 className="text-xl font-bold text-white">Outstanding Procurement Orders</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-900/50 text-slate-300 font-semibold border-b border-slate-700">
                                                <tr>
                                                    <th className="p-5">Book Title</th>
                                                    <th className="p-5">Supplier</th>
                                                    <th className="p-5 text-center">Qty</th>
                                                    <th className="p-5">Order Date</th>
                                                    <th className="p-5">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {orders.filter(o => o.status === 'Ordered').length > 0 ? orders.filter(o => o.status === 'Ordered').map((order) => (
                                                    <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-5">
                                                            <div className="font-semibold text-white">{order.book_name}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono">{order.book_id}</div>
                                                        </td>
                                                        <td className="p-5 text-slate-400 font-medium">{order.supplier_id}</td>
                                                        <td className="p-5 text-center font-mono text-blue-400">{order.quantity}</td>
                                                        <td className="p-5 text-slate-400 font-mono text-xs">{order.order_date}</td>
                                                        <td className="p-5">
                                                            <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded-full text-[10px] font-bold animate-pulse">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="p-10 text-center text-slate-500 italic">No outstanding orders currently.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Activity Log Tab */}
                        {activeTab === 'activity' && (
                            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                                <div className="p-6 border-b border-slate-700 bg-slate-900/30">
                                    <h2 className="text-xl font-bold text-white">Recent Library Operations</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900/50 text-slate-300 font-semibold border-b border-slate-700">
                                            <tr>
                                                <th className="p-5">Time</th>
                                                <th className="p-5">Staff member</th>
                                                <th className="p-5">Action</th>
                                                <th className="p-5">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {activityLogs.length > 0 ? activityLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-5 text-slate-400 font-mono text-xs">{log.timestamp}</td>
                                                    <td className="p-5">
                                                        <span className="font-semibold text-white">{log.username?.split('@')[0]}</span>
                                                        <span className="ml-2 px-1.5 py-0.5 bg-slate-700 text-slate-400 text-[10px] uppercase rounded">{log.role}</span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">{log.action?.replace('_', ' ')}</span>
                                                    </td>
                                                    <td className="p-5 text-slate-300 font-mono text-xs italic">{log.target}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="p-10 text-center text-slate-500 italic">No recent activity found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Modal */}
                    {activeAction && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                                <div className="p-6 border-b border-slate-700">
                                    <h3 className="text-xl font-bold text-white">
                                        {activeAction.type === 'approve' ? 'Approve Loan Request' : 'Deny Loan Request'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Transaction for {activeAction.username}
                                    </p>
                                </div>
                                <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">
                                            {activeAction.type === 'approve' ? 'Due Date (YYYY-MM-DD)' : 'Reason for Denial (Optional)'}
                                        </label>
                                        <input
                                            type={activeAction.type === 'approve' ? "date" : "text"}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                                            value={actionInput}
                                            onChange={(e) => setActionInput(e.target.value)}
                                            required={activeAction.type === 'approve'}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveAction(null)}
                                            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={`flex-1 px-4 py-2.5 font-bold rounded-xl text-white shadow-lg transition-all transform active:scale-[0.98] ${activeAction.type === 'approve'
                                                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/30'
                                                : 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                                                }`}
                                        >
                                            Confirm {activeAction.type === 'approve' ? 'Approve' : 'Deny'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {selectedStudent && (
                        <StudentProfileModal
                            student={selectedStudent}
                            loans={studentLoans}
                            loading={isProfileLoading}
                            onClose={() => setSelectedStudent(null)}
                        />
                    )}

                    {editingBook && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Edit Book Details</h3>
                                        <p className="text-slate-400 text-sm mt-1">ID: {editingBook.id}</p>
                                    </div>
                                    <button onClick={() => setEditingBook(null)} className="text-slate-400 hover:text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateBook} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book Title</label>
                                            <input
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={editingBook.name}
                                                onChange={e => setEditingBook({ ...editingBook, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Author</label>
                                            <input
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={editingBook.author}
                                                onChange={e => setEditingBook({ ...editingBook, author: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                                            <input
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={editingBook.category}
                                                onChange={e => setEditingBook({ ...editingBook, category: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Copies</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={editingBook.total_copies}
                                                onChange={e => setEditingBook({ ...editingBook, total_copies: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Copies</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                value={editingBook.available_copies}
                                                onChange={e => setEditingBook({ ...editingBook, available_copies: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                            <textarea
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-24 resize-none"
                                                value={editingBook.description || ''}
                                                onChange={e => setEditingBook({ ...editingBook, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-6 border-t border-slate-700 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setEditingBook(null)}
                                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98]"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LibrarianDashboard;
