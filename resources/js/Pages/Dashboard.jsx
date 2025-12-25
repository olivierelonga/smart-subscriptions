import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Users,
    Plus,
    RefreshCw,
    Sparkles,
    Lightbulb
} from 'lucide-react';

import SubscriptionList from '@/Components/Dashboard/SubscriptionList';
import AddSubscriptionModal from '@/Components/Modals/AddSubscriptionModal';
import EditSubscriptionModal from '@/Components/Modals/EditSubscriptionModal';
import Toast from '@/Components/Toast';

export default function Dashboard({ auth }) {
    /* ================= STATE ================= */
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({
        totalMonthly: 0,
        totalYearly: 0,
        activeSubscriptions: 0,
        savingsFromSharing: 0,
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        fetchSubscriptions();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [subscriptions]);

    const fetchSubscriptions = async () => {
        try {
            const response = await axios.get('/subscriptions');
            setSubscriptions(response.data.subscriptions || []);
        } catch (error) {
            console.error(error);
            showToast('Failed to load subscriptions', 'error');
        }
    };

    /* ================= STATS ================= */
    const calculateStats = () => {
        const monthly = subscriptions.reduce((sum, sub) => {
            if (sub.status !== 'active') return sum;

            const amount = parseFloat(sub.amount);
            switch (sub.billing_cycle) {
                case 'daily':
                    return sum + amount * 30;
                case 'weekly':
                    return sum + amount * 4;
                case 'yearly':
                    return sum + amount / 12;
                default:
                    return sum + amount;
            }
        }, 0);

        const sharedSavings = subscriptions
            .filter(sub => sub.is_shared && sub.status === 'active')
            .reduce((sum, sub) => sum + parseFloat(sub.amount) * 0.5, 0);

        setStats({
            totalMonthly: monthly,
            totalYearly: monthly * 12,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            savingsFromSharing: sharedSavings,
        });
    };

    /* ================= TOAST ================= */
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    /* ================= ADD ================= */
    const handleAddSubscription = async (formData) => {
        try {
            const response = await axios.post('/subscriptions', formData);
            setSubscriptions(prev => [...prev, response.data.subscription]);
            showToast('Subscription added successfully!');
            setShowAddModal(false);
        } catch (error) {
            console.error(error);
            showToast('Failed to add subscription', 'error');
        }
    };

    /* ================= EDIT ================= */
    const handleEditSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setShowEditModal(true);
    };

    const handleUpdateSubscription = async (id, formData) => {
        try {
            const response = await axios.put(`/subscriptions/${id}`, formData);
            setSubscriptions(prev =>
                prev.map(sub =>
                    sub.id === id ? response.data.subscription : sub
                )
            );
            showToast('Subscription updated successfully!');
            setShowEditModal(false);
            setSelectedSubscription(null);
        } catch (error) {
            console.error(error);
            showToast('Failed to update subscription', 'error');
        }
    };

    const handleDeleteSubscription = async (id) => {
        if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/subscriptions/${id}`);
            setSubscriptions(prev => prev.filter(sub => sub.id !== id));
            showToast('Subscription deleted successfully!');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete subscription', 'error');
        }
    };

    /* ================= REFRESH ================= */
    const handleRefresh = async () => {
        setLoading(true);
        await fetchSubscriptions();
        setLoading(false);
        showToast('Data refreshed successfully!');
    };

    /* ================= RENDER ================= */
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard
                    </h2>
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

            {toast && (
                <Toast {...toast} onClose={() => setToast(null)} />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* WELCOME */}
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

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard icon={<DollarSign className="w-6 h-6" />} title="Monthly Total" value={`R${stats.totalMonthly.toFixed(2)}`} />
                        <StatCard icon={<Calendar className="w-6 h-6" />} title="Active Subscriptions" value={stats.activeSubscriptions} />
                        <StatCard icon={<TrendingUp className="w-6 h-6" />} title="Yearly Spend" value={`R${stats.totalYearly.toFixed(2)}`} />
                        <StatCard icon={<Users className="w-6 h-6" />} title="Sharing Savings" value={`R${stats.savingsFromSharing.toFixed(2)}`} />
                    </div>

                    {/* SUBSCRIPTIONS */}
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

                    {/* AI Recommendations Preview */}
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <span>AI Recommendations</span>
                            </h3>
                            <Link
                                href="/recommendations"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                View All →
                            </Link>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Get personalized suggestions to save money on your subscriptions
                        </p>
                        <Link
                            href="/recommendations"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-md"
                        >
                            <Lightbulb className="w-5 h-5" />
                            <span>Get AI Recommendations</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AddSubscriptionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSubscription}
            />

            <EditSubscriptionModal
                isOpen={showEditModal}
                subscription={selectedSubscription}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedSubscription(null);
                }}
                onSubmit={handleUpdateSubscription}
            />
        </AuthenticatedLayout>
    );
}

/* ================= STAT CARD ================= */
function StatCard({ icon, title, value }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                {icon}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}