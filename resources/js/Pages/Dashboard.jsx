import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, Calendar, TrendingUp, Users, Plus, RefreshCw } from 'lucide-react';
import SubscriptionList from '@/Components/Dashboard/SubscriptionList';
import AddSubscriptionModal from '@/Components/Modals/AddSubscriptionModal';
import EditSubscriptionModal from '@/Components/Modals/EditSubscriptionModal';
import Toast from '@/Components/Toast';

export default function Dashboard({ auth }) {
    // State management
    const [stats, setStats] = useState({
        totalMonthly: 0,
        totalYearly: 0,
        activeSubscriptions: 0,
        savingsFromSharing: 0,
    });

    const [subscriptions, setSubscriptions] = useState([
        // Sample data - will be replaced with API data later
        {
            id: 1,
            name: 'Netflix Premium',
            amount: 199.99,
            billing_cycle: 'monthly',
            next_billing_date: '2024-12-15',
            category: 'Entertainment',
            status: 'active',
            is_shared: true,
            description: 'Family plan shared with 4 members',
        },
        {
            id: 2,
            name: 'Spotify Premium',
            amount: 59.99,
            billing_cycle: 'monthly',
            next_billing_date: '2024-12-20',
            category: 'Music',
            status: 'active',
            is_shared: false,
            description: 'Individual plan',
        },
        {
            id: 3,
            name: 'Adobe Creative Cloud',
            amount: 679.99,
            billing_cycle: 'monthly',
            next_billing_date: '2024-12-10',
            category: 'Productivity',
            status: 'active',
            is_shared: false,
            description: 'Photography plan',
        },
        {
            id: 4,
            name: 'YouTube Premium',
            amount: 119.99,
            billing_cycle: 'monthly',
            next_billing_date: '2024-12-25',
            category: 'Entertainment',
            status: 'active',
            is_shared: true,
            description: 'Family plan',
        },
        {
            id: 5,
            name: 'Disney+',
            amount: 89.99,
            billing_cycle: 'monthly',
            next_billing_date: '2025-01-05',
            category: 'Entertainment',
            status: 'paused',
            is_shared: false,
            description: 'Temporarily paused',
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // Calculate stats whenever subscriptions change
    useEffect(() => {
        calculateStats();
    }, [subscriptions]);

    // Calculate statistics
    const calculateStats = () => {
        const monthly = subscriptions.reduce((sum, sub) => {
            if (sub.status === 'active') {
                const amount = parseFloat(sub.amount);
                switch (sub.billing_cycle) {
                    case 'daily':
                        return sum + (amount * 30);
                    case 'weekly':
                        return sum + (amount * 4);
                    case 'monthly':
                        return sum + amount;
                    case 'yearly':
                        return sum + (amount / 12);
                    default:
                        return sum + amount;
                }
            }
            return sum;
        }, 0);

        // Calculate savings from shared subscriptions
        const sharedSavings = subscriptions
            .filter(sub => sub.is_shared && sub.status === 'active')
            .reduce((sum, sub) => sum + (parseFloat(sub.amount) * 0.5), 0); // Assume 50% savings

        setStats({
            totalMonthly: monthly,
            totalYearly: monthly * 12,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            savingsFromSharing: sharedSavings,
        });
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Add new subscription
    const handleAddSubscription = async (formData) => {
        try {
            const newSubscription = {
                id: Date.now(), // Temporary ID, will be replaced by database ID
                ...formData,
                status: 'active',
                is_shared: false,
                amount: parseFloat(formData.amount),
            };
            
            setSubscriptions(prev => [...prev, newSubscription]);
            showToast('Subscription added successfully!', 'success');
            
            // TODO: Replace with actual API call
            // const response = await api.post('/subscriptions', formData);
            // setSubscriptions(prev => [...prev, response.data.subscription]);
        } catch (error) {
            console.error('Failed to add subscription:', error);
            showToast('Failed to add subscription', 'error');
        }
    };

    // Open edit modal
    const handleEditSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setShowEditModal(true);
    };

    // Update existing subscription
    const handleUpdateSubscription = async (id, formData) => {
        try {
            setSubscriptions(prev => 
                prev.map(sub => 
                    sub.id === id 
                        ? { ...sub, ...formData, amount: parseFloat(formData.amount) }
                        : sub
                )
            );
            
            showToast('Subscription updated successfully!', 'success');
            
            // TODO: Replace with actual API call
            // await api.put(`/subscriptions/${id}`, formData);
            
            setShowEditModal(false);
            setSelectedSubscription(null);
        } catch (error) {
            console.error('Failed to update subscription:', error);
            showToast('Failed to update subscription', 'error');
        }
    };

    // Delete subscription
    const handleDeleteSubscription = (id) => {
        if (confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
            try {
                setSubscriptions(prev => prev.filter(sub => sub.id !== id));
                showToast('Subscription deleted successfully!', 'success');
                
                // TODO: Replace with actual API call
                // await api.delete(`/subscriptions/${id}`);
            } catch (error) {
                console.error('Failed to delete subscription:', error);
                showToast('Failed to delete subscription', 'error');
            }
        }
    };

    // Refresh data (placeholder for now)
    const handleRefresh = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await api.get('/subscriptions');
            // setSubscriptions(response.data.subscriptions);
            
            showToast('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            showToast('Failed to refresh data', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm">Refresh</span>
                    </button>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Message */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden shadow-lg sm:rounded-lg mb-6">
                        <div className="p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">
                                Welcome back, {auth.user.name}! 👋
                            </h3>
                            <p className="text-purple-100">
                                Here's an overview of your subscription spending
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard
                            icon={<DollarSign className="w-6 h-6" />}
                            title="Monthly Total"
                            value={`R${stats.totalMonthly.toFixed(2)}`}
                            subtitle={`R${stats.totalYearly.toFixed(2)}/year`}
                            color="blue"
                            trend="+2.5% from last month"
                        />
                        <StatCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Active Subscriptions"
                            value={stats.activeSubscriptions}
                            subtitle={`${subscriptions.length} total`}
                            color="green"
                            trend={`${subscriptions.filter(s => s.status === 'paused').length} paused`}
                        />
                        <StatCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Monthly Savings"
                            value={`R${stats.savingsFromSharing.toFixed(2)}`}
                            subtitle="From sharing"
                            color="purple"
                            trend={`R${(stats.savingsFromSharing * 12).toFixed(2)}/year`}
                        />
                        <StatCard
                            icon={<Users className="w-6 h-6" />}
                            title="Sharing Groups"
                            value={subscriptions.filter(s => s.is_shared).length}
                            subtitle={`${subscriptions.filter(s => s.is_shared).length} shared subscriptions`}
                            color="pink"
                            trend="Save more by sharing"
                        />
                    </div>

                    {/* Subscriptions Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Your Subscriptions
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Manage all your recurring payments in one place
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Subscription</span>
                                </button>
                            </div>

                            <SubscriptionList
                                subscriptions={subscriptions}
                                onEdit={handleEditSubscription}
                                onDelete={handleDeleteSubscription}
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickAction
                            title="Connect Bank Account"
                            description="Automatically detect subscriptions from your transactions"
                            buttonText="Connect Now"
                            color="blue"
                            icon={<DollarSign className="w-5 h-5" />}
                            onClick={() => showToast('Bank connection coming soon!', 'warning')}
                        />
                        <QuickAction
                            title="Create Sharing Group"
                            description="Split subscription costs with friends and family"
                            buttonText="Create Group"
                            color="purple"
                            icon={<Users className="w-5 h-5" />}
                            onClick={() => showToast('Sharing groups coming soon!', 'warning')}
                        />
                        <QuickAction
                            title="Get Recommendations"
                            description="AI-powered suggestions to save money"
                            buttonText="View Insights"
                            color="green"
                            icon={<TrendingUp className="w-5 h-5" />}
                            onClick={() => showToast('AI recommendations coming soon!', 'warning')}
                        />
                    </div>

                    {/* Category Breakdown */}
                    <div className="mt-6 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Spending by Category
                            </h3>
                            <CategoryBreakdown subscriptions={subscriptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Subscription Modal */}
            <AddSubscriptionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSubscription}
            />

            {/* Edit Subscription Modal */}
            <EditSubscriptionModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedSubscription(null);
                }}
                onSubmit={handleUpdateSubscription}
                subscription={selectedSubscription}
            />
        </AuthenticatedLayout>
    );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color, trend }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-4 shadow-md`}>
                {icon}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-gray-500 text-sm">{subtitle}</p>
            {trend && (
                <p className="text-xs text-gray-400 mt-2">{trend}</p>
            )}
        </div>
    );
}

// Quick Action Component
function QuickAction({ title, description, buttonText, color, icon, onClick }) {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        purple: 'bg-purple-600 hover:bg-purple-700',
        green: 'bg-green-600 hover:bg-green-700',
    };

    const bgColorClasses = {
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        green: 'bg-green-50',
    };

    return (
        <div className={`${bgColorClasses[color]} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
            <div className="flex items-center space-x-2 mb-3">
                <div className={`${colorClasses[color]} p-2 rounded-lg text-white`}>
                    {icon}
                </div>
                <h4 className="font-semibold text-gray-900">{title}</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <button 
                onClick={onClick}
                className={`w-full ${colorClasses[color]} text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg`}
            >
                {buttonText}
            </button>
        </div>
    );
}

// Category Breakdown Component
function CategoryBreakdown({ subscriptions }) {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    
    // Group by category and calculate totals
    const categoryData = activeSubscriptions.reduce((acc, sub) => {
        const category = sub.category || 'Other';
        if (!acc[category]) {
            acc[category] = {
                count: 0,
                total: 0,
            };
        }
        acc[category].count += 1;
        acc[category].total += parseFloat(sub.amount);
        return acc;
    }, {});

    const categories = Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total);

    const categoryColors = {
        Entertainment: 'bg-purple-500',
        Music: 'bg-pink-500',
        Productivity: 'bg-blue-500',
        'Cloud Storage': 'bg-green-500',
        Fitness: 'bg-orange-500',
        Shopping: 'bg-red-500',
        Other: 'bg-gray-500',
    };

    const total = categories.reduce((sum, [, data]) => sum + data.total, 0);

    if (categories.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No active subscriptions to display
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {categories.map(([category, data]) => {
                const percentage = ((data.total / total) * 100).toFixed(1);
                return (
                    <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${categoryColors[category] || categoryColors.Other}`}></div>
                                <span className="font-medium text-gray-900">{category}</span>
                                <span className="text-sm text-gray-500">({data.count} subscription{data.count !== 1 ? 's' : ''})</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-gray-900">R{data.total.toFixed(2)}</span>
                                <span className="text-sm text-gray-500 ml-2">{percentage}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${categoryColors[category] || categoryColors.Other}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}