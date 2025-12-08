import React, { useState, useEffect } from 'react';
import api from '../axios';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import SubscriptionList from '../Components/SubscriptionList';
import AddSubscriptionModal from '../Components/AddSubscriptionModal';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await api.get('/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const { summary, upcoming_bills, by_category, sharing } = dashboardData;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Track and manage all your subscriptions</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<DollarSign className="w-6 h-6" />}
                        title="Monthly Total"
                        value={`${summary.total_monthly}`}
                        subtitle={`${summary.total_yearly}/year`}
                        color="blue"
                    />
                    <StatCard
                        icon={<Calendar className="w-6 h-6" />}
                        title="Active Subscriptions"
                        value={summary.active_subscriptions}
                        subtitle="Currently tracking"
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Savings"
                        value={`${summary.savings_from_sharing}`}
                        subtitle="From sharing"
                        color="purple"
                    />
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title="Groups"
                        value={sharing.groups_owned + sharing.groups_joined}
                        subtitle={`${sharing.groups_owned} owned, ${sharing.groups_joined} joined`}
                        color="pink"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Bills */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Upcoming Bills</h2>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Add Subscription
                            </button>
                        </div>
                        {upcoming_bills.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming_bills.map((sub) => (
                                    <UpcomingBillItem key={sub.id} subscription={sub} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                No upcoming bills in the next 30 days
                            </p>
                        )}
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">By Category</h2>
                        <div className="space-y-3">
                            {by_category.map((cat, idx) => (
                                <CategoryItem key={idx} data={cat} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Subscription Modal */}
            {showAddModal && (
                <AddSubscriptionModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadDashboard();
                    }}
                />
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-4`}>
                {icon}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
    );
}

// Upcoming Bill Item Component
function UpcomingBillItem({ subscription }) {
    const daysUntil = Math.ceil(
        (new Date(subscription.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
                <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                <p className="text-sm text-gray-500">
                    Due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                </p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-900">${subscription.amount}</p>
                <p className="text-xs text-gray-500">{subscription.billing_cycle}</p>
            </div>
        </div>
    );
}

// Category Item Component
function CategoryItem({ data }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-900">{data.category}</p>
                <p className="text-sm text-gray-500">{data.count} subscriptions</p>
            </div>
            <p className="font-semibold text-gray-900">${data.amount.toFixed(2)}</p>
        </div>
    );
}