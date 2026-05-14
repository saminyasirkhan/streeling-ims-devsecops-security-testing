import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="p-8 flex justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-2xl p-6 transition-colors duration-200">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-2">Preferences</h2>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">Dark Mode</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme for the application</p>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-2 mt-4">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your account</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-2">About</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Streeling University Library System
                                <br />
                                Version 1.0.0
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
