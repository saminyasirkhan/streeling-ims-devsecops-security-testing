
import React from 'react';

const StatCard = ({ title, value, subtext, icon, color = 'blue' }) => {

    // Simple color mapping for themes
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        red: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{subtext}</p>}
            </div>

            <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
            </div>
        </div>
    );
};

export default StatCard;
