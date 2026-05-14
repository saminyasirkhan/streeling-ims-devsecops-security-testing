
import React from 'react';

const AdminRoles = () => {

    const permissions = [
        { resource: 'Inventory', read: ['Student', 'Librarian', 'Admin'], write: ['Librarian', 'Admin'], delete: ['Admin'] },
        { resource: 'Suppliers', read: ['Librarian', 'Admin'], write: ['Admin'], delete: ['Admin'] },
        { resource: 'Users', read: ['Admin'], write: ['Admin'], delete: ['Admin'] },
        { resource: 'Audit Logs', read: ['Admin'], write: [], delete: [] },
        { resource: 'Reservations', read: ['Student', 'Librarian', 'Admin'], write: ['Student', 'Librarian', 'Admin'], delete: ['Librarian', 'Admin'] },
    ];

    const roles = ['Student', 'Librarian', 'Admin'];

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Roles & Permissions</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-semibold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-4 w-1/4">Resource / Action</th>
                            {roles.map(role => (
                                <th key={role} className="p-4 text-center w-1/4">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {permissions.map((perm, idx) => (
                            <React.Fragment key={idx}>
                                {/* Resource Header Row */}
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <td className="p-3 pl-4 font-bold text-gray-700 dark:text-gray-300" colSpan={4}>
                                        {perm.resource} Module
                                    </td>
                                </tr>
                                {/* Action Rows */}
                                {['read', 'write', 'delete'].map(action => (
                                    <tr key={`${perm.resource}-${action}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="p-3 pl-8 text-gray-600 dark:text-gray-400 capitalize flex items-center gap-2">
                                            {action === 'delete' && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                                            {action}
                                        </td>
                                        {roles.map(role => {
                                            const hasPerm = perm[action].includes(role);
                                            return (
                                                <td key={role} className="p-3 text-center">
                                                    {hasPerm ? (
                                                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <span className="text-gray-300 dark:text-gray-600">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm border border-blue-100 dark:border-blue-900">
                <p><strong>Note:</strong> Permissions are currently enforcing "Secure Defaults". To request role modifications, please contact the System Super Admin.</p>
            </div>
        </div>
    );
};

export default AdminRoles;
