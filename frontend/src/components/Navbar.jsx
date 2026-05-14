import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        if (user?.access_token) {
            fetch('http://127.0.0.1:8000/profile/me', {
                headers: { 'Authorization': `Bearer ${user.access_token}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.avatar_path) {
                        const filename = data.avatar_path.split(/[\\/]/).pop();
                        setAvatar(`http://127.0.0.1:8000/avatars/${filename}`);
                    }
                })
                .catch(err => console.error("Avatar fetch error", err));
        }
    }, [user?.access_token]);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    const getHomePath = () => {
        if (!user) return '/';
        if (user.role === 'Admin') return '/admin';
        if (user.role === 'Librarian') return '/librarian';
        return '/student';
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center gap-8">
                <Link to={getHomePath()} className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Streeling Library
                </Link>
                <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <div className="relative group/about">
                        <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</button>
                        <div className="absolute left-0 mt-2 w-64 bg-white p-4 rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/about:opacity-100 group-hover/about:visible transition-all z-50 dark:bg-gray-800 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Streeling University Library system for students to be able to borrow and manage books, search the inventory and request reservations with ease.
                            </p>
                        </div>
                    </div>
                    <div className="relative group/contact">
                        <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</button>
                        <div className="absolute left-0 mt-2 w-64 bg-white p-4 rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover/contact:opacity-100 group-hover/contact:visible transition-all z-50 dark:bg-gray-800 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-800 dark:text-white mb-1">Streeling University</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Streeling Street, CV4 7AL<br />
                                Phone: 0300 555 8171
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm dark:bg-blue-900 dark:text-blue-300">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.username.split('@')[0]}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 dark:bg-gray-800 dark:border-gray-700">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.username}</p>
                            </div>
                            <Link to={getHomePath()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                Manage Account
                            </Link>
                            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                Settings
                            </Link>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2">
                            Login
                        </Link>
                        <button
                            onClick={() => toast.error("Registration Restricted: Please contact admin@streeling.ac.uk in order to get registered.", { duration: 6000 })}
                            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
