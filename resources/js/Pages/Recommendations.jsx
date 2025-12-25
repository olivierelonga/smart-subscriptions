import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Lightbulb, TrendingDown, Users, X, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Toast from '@/Components/Toast';
import axios from 'axios';

export default function Recommendations({ auth }) {
    const [recommendations, setRecommendations] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/recommendations');
            setRecommendations(response.data.recommendations || []);
            setTotalSavings(response.data.total_potential_savings || 0);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            setToast({ message: 'Failed to load recommendations', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const generateRecommendations = async () => {
        setGenerating(true);
        try {
            const response = await axios.post('/api/recommendations/generate');
            setRecommendations(response.data.recommendations || []);
            setTotalSavings(response.data.total_potential_savings || 0);
            setToast({ message: `Generated ${response.data.count} new recommendations!`, type: 'success' });
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            setToast({ message: 'Failed to generate recommendations', type: 'error' });
        } finally {
            setGenerating(false);
        }
    };

    const dismissRecommendation = async (id) => {
        try {
            await axios.post(`/api/recommendations/${id}/dismiss`);
            setRecommendations(recommendations.filter(r => r.id !== id));
            setToast({ message: 'Recommendation dismissed', type: 'success' });
        } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
            setToast({ message: 'Failed to dismiss recommendation', type: 'error' });
        }
    };

    const completeRecommendation = async (id) => {
        try {
            await axios.post(`/api/recommendations/${id}/complete`);
            setRecommendations(recommendations.filter(r => r.id !== id));
            setToast({ message: 'Great job! Recommendation completed 🎉', type: 'success' });
        } catch (error) {
            console.error('Failed to complete recommendation:', error);
            setToast({ message: 'Failed to complete recommendation', type: 'error' });
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'redundant':
                return <TrendingDown className="w-6 h-6" />;
            case 'share':
                return <Users className="w-6 h-6" />;
            case 'upgrade':
                return <Sparkles className="w-6 h-6" />;
            case 'cancel':
                return <AlertCircle className="w-6 h-6" />;
            default:
                return <Lightbulb className="w-6 h-6" />;
        }
    };

    const getColor = (priority) => {
        if (priority >= 8) return 'red';
        if (priority >= 5) return 'orange';
        return 'blue';
    };

    const getTypeLabel = (type) => {
        const labels = {
            redundant: '🔄 Redundant Service',
            share: '👥 Share to Save',
            upgrade: '⬆️ Upgrade Plan',
            cancel: '❌ Consider Cancelling',
        };
        return labels[type] || '💡 Recommendation';
    };

    if (loading) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="AI Recommendations" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl">Loading recommendations...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">AI Recommendations</h2>}
        >
            <Head title="AI Recommendations" />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                            <p className="text-gray-600 mt-1">Smart suggestions to save money on your subscriptions</p>
                        </div>
                        <button
                            onClick={generateRecommendations}
                            disabled={generating}
                            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 shadow-md"
                        >
                            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                            <span>{generating ? 'Analyzing...' : 'Refresh Recommendations'}</span>
                        </button>
                    </div>

                    {/* Total Savings Banner */}
                    {totalSavings > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl mb-8 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">
                                        R{totalSavings.toFixed(2)}
                                    </h2>
                                    <p className="text-green-50">
                                        Potential annual savings available!
                                    </p>
                                    <p className="text-sm text-green-100 mt-1">
                                        Implement these {recommendations.length} recommendations to save money
                                    </p>
                                </div>
                                <div className="hidden sm:block">
                                    <Sparkles className="w-20 h-20 text-green-200 opacity-50" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start space-x-3">
                            <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    How AI Recommendations Work
                                </h3>
                                <p className="text-blue-700 text-sm mb-3">
                                    Our AI analyzes your subscription spending patterns and identifies opportunities to save money through:
                                </p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>✓ Detecting redundant or overlapping services</li>
                                    <li>✓ Suggesting family plan upgrades for better value</li>
                                    <li>✓ Identifying unused subscriptions you might want to cancel</li>
                                    <li>✓ Finding cost-sharing opportunities with friends</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations List */}
                    {recommendations.length > 0 ? (
                        <div className="space-y-4">
                            {recommendations
                                .sort((a, b) => b.priority - a.priority)
                                .map((rec) => (
                                    <RecommendationCard
                                        key={rec.id}
                                        recommendation={rec}
                                        onDismiss={dismissRecommendation}
                                        onComplete={completeRecommendation}
                                        icon={getIcon(rec.type)}
                                        color={getColor(rec.priority)}
                                        typeLabel={getTypeLabel(rec.type)}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No recommendations yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Add more subscriptions or click "Refresh Recommendations" to get AI-powered savings suggestions
                            </p>
                            <button
                                onClick={generateRecommendations}
                                disabled={generating}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {generating ? 'Generating...' : 'Generate Recommendations'}
                            </button>
                        </div>
                    )}

                    {/* Educational Section */}
                    <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-900 mb-3">
                            💡 Pro Tips for Maximum Savings
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                            <div>
                                <p className="font-medium mb-1">🎯 Review regularly</p>
                                <p className="text-purple-700">Check recommendations monthly to catch new savings opportunities</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">👥 Share more</p>
                                <p className="text-purple-700">Family plans typically save 40-60% when shared among members</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">📊 Track usage</p>
                                <p className="text-purple-700">Cancel subscriptions you haven't used in the last 30 days</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">💰 Bundle services</p>
                                <p className="text-purple-700">Look for bundle deals that combine multiple services</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RecommendationCard({ recommendation, onDismiss, onComplete, icon, color, typeLabel }) {
    const colorClasses = {
        red: 'border-l-red-500 bg-red-50',
        orange: 'border-l-orange-500 bg-orange-50',
        blue: 'border-l-blue-500 bg-blue-50',
    };

    const iconColorClasses = {
        red: 'text-red-600',
        orange: 'text-orange-600',
        blue: 'text-blue-600',
    };

    const priorityLabels = {
        10: '🔥 High Priority',
        8: '⚡ Important',
        6: '💡 Recommended',
        4: '📌 Consider',
        2: 'ℹ️ Info',
    };

    const getPriorityLabel = (priority) => {
        if (priority >= 10) return priorityLabels[10];
        if (priority >= 8) return priorityLabels[8];
        if (priority >= 6) return priorityLabels[6];
        if (priority >= 4) return priorityLabels[4];
        return priorityLabels[2];
    };

    return (
        <div className={`bg-white border-l-4 ${colorClasses[color]} rounded-lg shadow-md p-6 hover:shadow-lg transition`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                    <div className={`flex-shrink-0 ${iconColorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-medium bg-white px-2 py-1 rounded-full border border-gray-200">
                                {typeLabel}
                            </span>
                            <span className="text-xs font-medium bg-white px-2 py-1 rounded-full border border-gray-200">
                                {getPriorityLabel(recommendation.priority)}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Save R{parseFloat(recommendation.potential_savings).toFixed(2)}/year
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {recommendation.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            {recommendation.description}
                        </p>

                        {/* Action Suggestion */}
                        <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">✨ Suggested Action:</p>
                            <p className="text-sm text-gray-600">
                                {recommendation.type === 'redundant' && "Review which service you use most and consider cancelling the others."}
                                {recommendation.type === 'share' && "Create a cost-sharing group and invite friends or family to split the cost."}
                                {recommendation.type === 'upgrade' && "Upgrade to a family plan and share with others to pay less per person."}
                                {recommendation.type === 'cancel' && "Review your usage over the last 30 days and decide if you still need this service."}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                        onClick={() => onComplete(recommendation.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                        title="Mark as completed"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDismiss(recommendation.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}