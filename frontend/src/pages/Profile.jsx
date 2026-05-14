import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Profile = () => {
    const user = JSON.parse(sessionStorage.getItem('user')) || {};
    const token = user.access_token;

    // form fields
    const [fullName, setFullName] = useState('');
    const [libraryName, setLibraryName] = useState('Streeling University Library');
    const [location, setLocation] = useState('Streeling University Campus');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(null); // URL string

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (!token) return;

        fetch('http://127.0.0.1:8000/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch profile');
                return res.json();
            })
            .then(data => {
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
                setEmail(data.username || ''); // DB username is email

                setLocation(data.location || 'Streeling University Campus');
                setLibraryName(data.organization || 'Streeling University Library');

                if (data.avatar_path) {
                    const filename = data.avatar_path.split(/[\\/]/).pop();
                    setAvatar(`http://127.0.0.1:8000/avatars/${filename}`);
                } else {
                    setAvatar(null);
                }
            })
            .catch(err => console.error(err));
    }, [token]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const body = {
                full_name: fullName,
                // Only send phone if NOT student
                phone: user.role === 'Student' ? null : phone,
                // Enforce defaults
                location: 'Streeling University Campus',
                organization: 'Streeling University Library'
            };

            const res = await fetch('http://127.0.0.1:8000/profile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setStatus('success');
                setMessage('Profile updated successfully!');

                // Update local constraints
                setLocation('Streeling University Campus');
                setLibraryName('Streeling University Library');
            } else {
                setStatus('error');
                setMessage('Update failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!password) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/users/${user.username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage('Password updated successfully!');
                setPassword('');
            } else {
                setStatus('error');
                setMessage(data.detail || 'Update failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview locally
        const reader = new FileReader();
        reader.onloadend = () => setAvatar(reader.result);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('http://127.0.0.1:8000/profile/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                setMessage('Avatar uploaded!');
                setStatus('success');
            } else {
                const d = await res.json();
                setMessage(d.detail || 'Upload failed'); // e.g. "Only students can upload"
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="p-8 flex justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-4xl p-8 transition-colors duration-200">

                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-sm flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                                            {(user.username || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">My Profile</h1>
                                <div className="flex flex-col gap-2">
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 transition ease-in-out duration-150">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        Upload Avatar
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Max size 2MB. Formats: JPG, PNG.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-900' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">My Role</label>
                            <input
                                type="text"
                                disabled
                                value={user.role}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed uppercase font-bold text-xs tracking-wider"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username / Email</label>
                            <input
                                type="email"
                                disabled
                                value={email} // Display only
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Your Name"
                            />
                        </div>

                        {user.role !== 'Student' && (
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="Contact Number"
                                />
                            </div>
                        )}

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location <span className="text-[10px] text-amber-600 font-bold">(FIXED)</span></label>
                            <input
                                type="text"
                                disabled
                                value="Streeling University Campus"
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization <span className="text-[10px] text-amber-600 font-bold">(FIXED)</span></label>
                            <input
                                type="text"
                                disabled
                                value="Streeling University Library"
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                Save Profile Changes
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Security Settings</h2>
                        <form onSubmit={handleUpdatePassword} className="max-w-md">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="Enter new password"
                                    minLength={4}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 shadow-sm transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Profile;
