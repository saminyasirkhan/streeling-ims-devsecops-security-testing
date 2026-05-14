import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentInventory = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user'));


    useEffect(() => {
        if (!user) navigate('/');
    }, [navigate, user]);


    const [books, setBooks] = useState([]);

    const [myBooks, setMyBooks] = useState([]);


    const [activeTab, setActiveTab] = useState('browse');
    const [selectedBook, setSelectedBook] = useState(null);


    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 10;


    const fetchBooks = () => {
        fetch('http://127.0.0.1:8000/books')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error("Failed to fetch books:", err));
    };

    const fetchMyLoans = () => {
        if (!user?.access_token) return;
        fetch('http://127.0.0.1:8000/loans/me', {
            headers: { 'Authorization': `Bearer ${user.access_token}` }
        })
            .then(res => res.json())
            .then(data => setMyBooks(data))
            .catch(err => console.error("Failed to fetch my loans:", err));
    };

    useEffect(() => {
        fetchBooks();
        fetchMyLoans();
    }, []);


    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.id.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterField && filterValue) {
            let dataKey = filterField.toLowerCase();
            if (filterField === 'Book Name') dataKey = 'name';
            if (filterField === 'Release Date') dataKey = 'releaseDate';
            matchesFilter = String(book[dataKey]) === filterValue;
        }

        return matchesSearch && matchesFilter;
    });

    const getUniqueValues = (field) => {
        if (!field) return [];
        let dataKey = field.toLowerCase();
        if (field === 'Book Name') dataKey = 'name';
        if (field === 'Release Date') dataKey = 'releaseDate';
        const values = books.map(b => b[dataKey]).filter(Boolean);
        return [...new Set(values)].sort();
    };


    const handleReserve = (book, e) => {
        if (e) e.stopPropagation();
        if (!user?.access_token) {
            toast.error("Please log in to reserve books.");
            return;
        }

        fetch('http://127.0.0.1:8000/loans/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            },
            body: JSON.stringify({
                book_id: book.id,
                book_name: book.name
            })
        })
            .then(res => {
                if (res.ok) {
                    toast.success(`Reservation requested for "${book.name}"`);
                    fetchBooks();
                    fetchMyLoans();
                } else {
                    res.json().then(data => toast.error(`Error: ${data.detail || 'Reservation failed'}`));
                }
            })
            .catch(err => console.error("Reservation error:", err));
    };

    const handleRenew = (loanId) => {
        fetch(`http://127.0.0.1:8000/loans/${loanId}/renew`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${user.access_token}` }
        })
            .then(res => res.ok ? res.json() : res.json().then(e => { throw e }))
            .then(data => {
                toast.success(`Book renewed! New due date: ${data.new_due_date}`);
                fetchMyLoans();
            })
            .catch(err => toast.error(err.detail || "Renewal failed"));
    };

    const handleReturn = (loanId) => {
        if (!window.confirm("Are you sure you want to return this book?")) return;
        fetch(`http://127.0.0.1:8000/loans/${loanId}/return`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${user.access_token}` }
        })
            .then(res => res.ok ? res.json() : res.json().then(e => { throw e }))
            .then(() => {
                toast.success("Book returned successfully!");
                fetchBooks();
                fetchMyLoans();
            })
            .catch(err => toast.error(err.detail || "Return failed"));
    };

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    const BookDetailModal = ({ book, onClose }) => {
        if (!book) return null;
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Mock Cover Image */}
                        <div className="bg-blue-600 md:w-1/3 flex items-center justify-center p-8 text-white">
                            <div className="text-center">
                                <span className="text-6xl font-serif block mb-2">{book.name.charAt(0)}</span>
                                <span className="text-sm opacity-75">Book Cover</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8 md:w-2/3">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{book.name}</h2>
                                    <p className="text-blue-600 font-medium dark:text-blue-400">{book.author}</p>
                                </div>
                                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                    {book.description || "No description available for this title."}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                        <span className="block text-gray-500 text-xs uppercase tracking-wide">Category</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{book.category}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                        <span className="block text-gray-500 text-xs uppercase tracking-wide">Book ID</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{book.id}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                        <span className="block text-gray-500 text-xs uppercase tracking-wide">Released</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{book.releaseDate}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                        <span className="block text-gray-500 text-xs uppercase tracking-wide">Available Copies</span>
                                        <span className={`font-medium ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>{book.available_copies} / {book.total_copies}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    {book.status === 'Available' ? (
                                        <button
                                            onClick={(e) => { handleReserve(book, e); onClose(); }}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span>Request Reservation</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                                            Currently Unavailable
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="p-6 flex justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-6xl p-6 transition-colors duration-200 min-h-[80vh]">

                    {/* Tabs */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Dashboard</h1>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('browse')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'browse'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                Browse Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('mybooks')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'mybooks'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                My Borrowed Books
                            </button>
                        </div>
                    </div>

                    {/* Search and Browse */}
                    {activeTab === 'browse' && (
                        <div className="animate-fade-in">
                            <div className="flex gap-4 mb-6 flex-wrap bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                <input
                                    type="text"
                                    placeholder="Search by Name, Author, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 p-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={filterField}
                                        onChange={(e) => { setFilterField(e.target.value); setFilterValue(''); }}
                                        className="p-2.5 border border-gray-200 rounded-md text-sm text-gray-600 min-w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Sort by...</option>
                                        <option>Status</option>
                                        <option>Category</option>
                                        <option>Author</option>
                                        <option>Release Date</option>
                                    </select>

                                    <select
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        disabled={!filterField}
                                        className="p-2.5 border border-gray-200 rounded-md text-sm text-gray-600 min-w-[140px] disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Any</option>
                                        {getUniqueValues(filterField).map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                                {(searchTerm || filterField) && (
                                    <button
                                        onClick={() => { setSearchTerm(''); setFilterField(''); setFilterValue(''); }}
                                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium transition-colors dark:bg-red-900/20 dark:text-red-400"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-semibold border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="p-4 w-24">ID</th>
                                            <th className="p-4">Book Details</th>
                                            <th className="p-4">Availability</th>
                                            <th className="p-4 hidden md:table-cell">Category</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {currentBooks.length > 0 ? (
                                            currentBooks.map((book) => (
                                                <tr
                                                    key={book.id}
                                                    onClick={() => setSelectedBook(book)}
                                                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                                                >
                                                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400 text-xs">{book.id}</td>
                                                    <td className="p-4">
                                                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-base">{book.name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{book.author} • {book.releaseDate}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${book.available_copies > 0 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' :
                                                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900'
                                                            }`}>
                                                            {book.available_copies > 0 ? `${book.available_copies} Available` : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">{book.category}</td>
                                                    <td className="p-4 text-right">
                                                        {book.available_copies > 0 ? (
                                                            <button
                                                                onClick={(e) => handleReserve(book, e)}
                                                                className="px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-xs font-semibold uppercase tracking-wide transition-all shadow-sm hover:shadow dark:bg-gray-800 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-gray-700"
                                                            >
                                                                Reserve
                                                            </button>
                                                        ) : (
                                                            <button disabled className="text-gray-400 cursor-not-allowed text-xs font-medium px-4">
                                                                Unavailable
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center text-gray-500">
                                                    No books found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center mt-4 px-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing {indexOfFirstBook + 1} - {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={indexOfLastBook >= filteredBooks.length}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mybooks' && (
                        <div className="animate-fade-in">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3 dark:bg-blue-900/10 dark:border-blue-900/30">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Library Policy</h3>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                                        Books must be returned within 14 days. Overdue items may incur a fine of £0.50 per day.
                                        Please visit the Librarian desk to return items.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myBooks.map((loan) => {
                                    let borderColor = 'border-gray-200';
                                    let statusColor = 'bg-gray-100 text-gray-700';
                                    let statusPulse = '';

                                    if (loan.status === 'Pending') {
                                        borderColor = 'border-yellow-400';
                                        statusColor = 'bg-yellow-100 text-yellow-700';
                                    } else if (loan.status === 'Denied') {
                                        borderColor = 'border-red-500';
                                        statusColor = 'bg-red-100 text-red-700';
                                    } else if (loan.status === 'Active') {
                                        const now = new Date();
                                        const due = new Date(loan.due_date);
                                        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

                                        if (diffDays < 0) {
                                            borderColor = 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]';
                                            statusColor = 'bg-red-100 text-red-700';
                                        } else if (diffDays <= 3) {
                                            borderColor = 'border-orange-500';
                                            statusColor = 'bg-orange-100 text-orange-700';
                                            statusPulse = 'animate-pulse';
                                        } else {
                                            borderColor = 'border-green-500';
                                            statusColor = 'bg-green-100 text-green-700';
                                        }
                                    }

                                    return (
                                        <div key={loan.id} className={`border ${borderColor} rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden dark:bg-gray-800`}>
                                            <div className="flex justify-between items-start mb-4 pl-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{loan.book_name}</h3>
                                                    <p className="text-gray-500 text-sm">Status: {loan.status}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColor} ${statusPulse}`}>
                                                    {loan.status}
                                                </span>
                                            </div>

                                            <div className="pl-2 space-y-3 mt-4">
                                                {loan.status === 'Active' && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                                            {loan.due_date}
                                                        </span>
                                                    </div>
                                                )}
                                                {loan.status === 'Denied' && (
                                                    <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                                                        <strong>Reason:</strong> {loan.denial_reason || 'No reason provided.'}
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Book ID</span>
                                                    <span className="font-mono text-gray-600 dark:text-gray-300">{loan.book_id}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 pl-2 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                                                {loan.status === 'Active' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRenew(loan.id)}
                                                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                                                        >
                                                            Renew
                                                        </button>
                                                        <button
                                                            onClick={() => handleReturn(loan.id)}
                                                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase rounded transition-colors dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400"
                                                        >
                                                            Return
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setSelectedBook(books.find(b => b.id === loan.book_id))}
                                                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold uppercase rounded transition-colors dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-400 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer dark:border-gray-600 dark:hover:bg-gray-800" onClick={() => setActiveTab('browse')}>
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 dark:bg-gray-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="font-medium">Borrow New Book</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL OVERLAY */}
                {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
            </main>
        </div>
    );
};

export default StudentInventory;
