import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';

import StudentInventory from './pages/StudentInventory';
import LibrarianDashboard from './pages/LibrarianDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminProcurement from './pages/admin/AdminProcurement';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminAudit from './pages/admin/AdminAudit';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <Router>
            <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/student" element={
                    <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                        <StudentInventory />
                    </ProtectedRoute>
                } />
                <Route path="/librarian" element={
                    <ProtectedRoute allowedRoles={['Librarian', 'Admin']}>
                        <LibrarianDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<AdminOverview />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="suppliers" element={<AdminSuppliers />} />
                    <Route path="procurement" element={<AdminProcurement />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="roles" element={<AdminRoles />} />
                    <Route path="audit" element={<AdminAudit />} />
                </Route>

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
