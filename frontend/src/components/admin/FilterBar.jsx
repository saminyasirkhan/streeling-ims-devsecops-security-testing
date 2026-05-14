
import React from 'react';

const FilterBar = ({ onSearch, filters = [], onFilterChange, activeFilters = {} }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            {/* Search Input */}
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    onChange={(e) => onSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search keywords..."
                />
            </div>

            {/* Dynamic Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {filters.map((filter) => (
                    <select
                        key={filter.key}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">{filter.label}</option>
                        {filter.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
