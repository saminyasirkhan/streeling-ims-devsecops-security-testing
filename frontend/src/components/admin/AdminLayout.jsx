
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const avatar = localStorage.getItem('profile_avatar');

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <AdminSidebar />

            <div className="flex-1 ml-64 transition-all duration-300">

                {/* top bar */}
                <header className="bg-white dark:bg-gray-800 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Streeling University Library Portal</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">{(user?.username || 'Admin').split('@')[0]}</p>
                                    <p className="text-[10px] text-green-600 font-semibold uppercase mt-1 tracking-tighter">Secure Session</p>
                                </div>
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                        {(user?.username || 'A').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 dark:bg-gray-800 dark:border-gray-700">
                                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 mb-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Authenticated As</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.username}</p>
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">System Administrator</p>
                                </div>

                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Manage Account
                                </Link>
                                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    System Settings
                                </Link>

                                <div className="border-t border-gray-50 dark:border-gray-700/50 my-1"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Sign Out Securely
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
