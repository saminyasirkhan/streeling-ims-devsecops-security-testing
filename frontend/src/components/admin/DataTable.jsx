
import React from 'react';

const DataTable = ({ columns, data, onEdit, onDelete, actions }) => {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No records found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-3 py-2 whitespace-nowrap text-xs">{col.header}</th>
                        ))}
                        {(onEdit || onDelete || actions) && <th className="px-3 py-2 text-right text-xs">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {data.map((row, rowIdx) => (
                        <tr key={row.id || rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                            {(onEdit || onDelete || actions) && (
                                <td className="px-3 py-2 text-right space-x-2">
                                    {actions && actions(row)}
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="text-red-600 hover:text-red-800 font-medium text-xs dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
