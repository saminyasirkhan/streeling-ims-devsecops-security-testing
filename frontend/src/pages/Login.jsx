import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Login = () => {
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = { detail: 'An unexpected error occurred.' };
            }

            if (res.ok) {
                sessionStorage.setItem('user', JSON.stringify(data));
                toast.success(`Welcome back!`);

                if (data.role === 'Admin') navigate('/admin');
                else if (data.role === 'Librarian') navigate('/librarian');
                else navigate('/student');
            } else {
                let msg = data.detail || 'Login failed';
                if (res.status === 429) {
                    msg = "Too many login attempts. Cooldown active - please try again in a minute.";
                }
                setError(msg);
                toast.error(msg, { duration: 5000 });
            }
        } catch (err) {
            setError(err.message);
            toast.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-sm w-[400px] border border-gray-100">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Streeling Library</h1>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-2 text-sm rounded mb-4 text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 bg-blue-50/50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-300 transition-colors"
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 bg-blue-50/50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-300 transition-colors"
                                placeholder="Enter password"
                                required
                            />
                        </div>



                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow-sm mt-6 transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
