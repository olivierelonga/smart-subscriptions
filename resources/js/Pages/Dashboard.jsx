import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, Calendar, TrendingUp, Users, Plus } from 'lucide-react';
import SubscriptionList from '@/Components/Dashboard/SubscriptionList';
import AddSubscriptionModal from '@/Components/Modals/AddSubscriptionModal';

export default function Dashboard({ auth }) {
    const [stats, setStats] = useState({
        totalMonthly: 0,
        totalYearly: 0,
        activeSubscriptions: 0,
        savingsFromSharing: 0,
    });

    const [subscriptions, setSubscriptions] = useState([
        // Sample data
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
    ]);

    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        calculateStats();
    }, [subscriptions]);

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

        setStats({
            totalMonthly: monthly,
            totalYearly: monthly * 12,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            savingsFromSharing: 150.00, // Example savings
        });
    };

    const handleAddSubscription = async (formData) => {
        // For now, add to local state
        // Later, this will make an API call
        const newSubscription = {
            id: Date.now(),
            ...formData,
            status: 'active',
            is_shared: false,
        };
        
        setSubscriptions(prev => [...prev, newSubscription]);
        
        // TODO: Replace with actual API call
        // await api.post('/subscriptions', formData);
    };

    const handleEditSubscription = (subscription) => {
        console.log('Edit subscription:', subscription);
        // TODO: Implement edit modal
        alert('Edit functionality coming soon!');
    };

    const handleDeleteSubscription = (id) => {
        if (confirm('Are you sure you want to delete this subscription?')) {
            setSubscriptions(prev => prev.filter(sub => sub.id !== id));
            
            // TODO: Replace with actual API call
            // await api.delete(`/subscriptions/${id}`);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Message */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-2xl font-bold mb-2">
                                Welcome back, {auth.user.name}! 👋
                            </h3>
                            <p className="text-gray-600">
                                Here's an overview of your subscription spending
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <StatCard
                            icon={<DollarSign className="w-6 h-6" />}
                            title="Monthly Total"
                            value={`R${stats.totalMonthly.toFixed(2)}`}
                            subtitle={`R${stats.totalYearly.toFixed(2)}/year`}
                            color="blue"
                        />
                        <StatCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Active Subscriptions"
                            value={stats.activeSubscriptions}
                            subtitle="Currently tracking"
                            color="green"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Savings"
                            value={`R${stats.savingsFromSharing.toFixed(2)}`}
                            subtitle="From sharing"
                            color="purple"
                        />
                        <StatCard
                            icon={<Users className="w-6 h-6" />}
                            title="Groups"
                            value={0}
                            subtitle="0 owned, 0 joined"
                            color="pink"
                        />
                    </div>

                    {/* Subscriptions Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Your Subscriptions
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <QuickAction
                            title="Connect Bank Account"
                            description="Automatically detect subscriptions from your transactions"
                            buttonText="Connect Now"
                            color="blue"
                        />
                        <QuickAction
                            title="Create Sharing Group"
                            description="Split subscription costs with friends and family"
                            buttonText="Create Group"
                            color="purple"
                        />
                        <QuickAction
                            title="Get Recommendations"
                            description="AI-powered suggestions to save money"
                            buttonText="View Insights"
                            color="green"
                        />
                    </div>
                </div>
            </div>

            {/* Add Subscription Modal */}
            <AddSubscriptionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSubscription}
            />
        </AuthenticatedLayout>
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

// Quick Action Component
function QuickAction({ title, description, buttonText, color }) {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        purple: 'bg-purple-600 hover:bg-purple-700',
        green: 'bg-green-600 hover:bg-green-700',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <button className={`w-full ${colorClasses[color]} text-white px-4 py-2 rounded-lg transition`}>
                {buttonText}
            </button>
        </div>
    );
}