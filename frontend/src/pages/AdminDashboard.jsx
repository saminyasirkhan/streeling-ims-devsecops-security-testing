import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch('http://127.0.0.1:8000/users');
        const data = await res.json();
        setUsers(data);
    };

    const handleDelete = async (username) => {
        if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
            await fetch(`http://127.0.0.1:8000/users/${username}`, { method: 'DELETE' });
            fetchUsers();
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6]">
            <Navbar />

            <main className="p-8 flex justify-center">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-4xl p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    </div>

                    <div className="border border-gray-200 rounded overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-4">Username</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 text-gray-800 font-medium">{user.username}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(user.username)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Remove User
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
