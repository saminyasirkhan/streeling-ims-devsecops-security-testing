import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import toast from 'react-hot-toast';

const AdminProcurement = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user'));

    const fetchOrders = () => {
        setIsLoading(true);
        fetch('http://127.0.0.1:8000/procurement/orders', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleReceive = (orderId) => {
        if (confirm("Mark this order as received? Stocks will be added to inventory automatically.")) {
            fetch(`http://127.0.0.1:8000/procurement/orders/${orderId}/receive`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        toast.success("Stock received and inventory updated!");
                        fetchOrders();
                    } else {
                        toast.error(data.detail || "Action failed");
                    }
                });
        }
    };

    const handleCancel = (orderId) => {
        if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            fetch(`http://127.0.0.1:8000/procurement/orders/${orderId}/cancel`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        toast.success("Order cancelled successfully.");
                        fetchOrders();
                    } else {
                        toast.error(data.detail || "Action failed");
                    }
                });
        }
    };

    const columns = [
        { header: 'Order ID', accessor: 'id' },
        { header: 'Book Title', accessor: 'book_name', render: (row) => <span className="font-bold text-gray-800 dark:text-gray-100">{row.book_name}</span> },
        { header: 'Supplier', accessor: 'supplier_id' },
        { header: 'QTY', accessor: 'quantity' },
        { header: 'Order Date', accessor: 'order_date' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Received' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    row.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Date Received', accessor: 'received_date' }
    ];

    const actions = (row) => {
        if (row.status !== 'Ordered') return <span className="text-xs text-gray-400 font-medium">No actions</span>;

        return (
            <div className="flex gap-4">
                <button
                    onClick={() => handleReceive(row.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                >
                    Mark Received
                </button>
                <button
                    onClick={() => handleCancel(row.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-tighter"
                >
                    Cancel
                </button>
            </div>
        );
    };

    // Calculate Summary Stats
    const pendingCount = orders.filter(o => o.status === 'Ordered').length;
    const receivedThisMonth = orders.filter(o => o.status === 'Received').length;
    const totalOrderedQty = orders.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Procurement Tracking</h1>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase">Pending Shipments</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase">Successful Deliveries</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{receivedThisMonth}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Items Ordered</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{totalOrderedQty}</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                actions={actions}
            />
        </div>
    );
};

export default AdminProcurement;
