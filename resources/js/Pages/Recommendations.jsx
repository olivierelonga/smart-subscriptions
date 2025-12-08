import React, { useState, useEffect } from 'react';
import api from '../axios';
import { Lightbulb, TrendingDown, Users, X, Check, RefreshCw } from 'lucide-react';
import Sidebar from '../Components/Sidebar';

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const response = await api.get('/recommendations');
            setRecommendations(response.data.recommendations);
            setTotalSavings(response.data.total_potential_savings);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRecommendations = async () => {
        setGenerating(true);
        try {
            const response = await api.post('/recommendations/generate');
            setRecommendations(response.data.recommendations);
            alert('New recommendations generated!');
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            alert('Failed to generate recommendations');
        } finally {
            setGenerating(false);
        }
    };

    const dismissRecommendation = async (id) => {
        try {
            await api.post(`/recommendations/${id}/dismiss`);
            setRecommendations(recommendations.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
        }
    };

    const completeRecommendation = async (id) => {
        try {
            await api.post(`/recommendations/${id}/complete`);
            setRecommendations(recommendations.filter(r => r.id !== id));
            alert('Great job! Recommendation marked as completed.');
        } catch (error) {
            console.error('Failed to complete recommendation:', error);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'redundant':
                return <TrendingDown className="w-6 h-6" />;
            case 'share':
                return <Users className="w-6 h-6" />;
            default:
                return <Lightbulb className="w-6 h-6" />;
        }
    };

    const getColor = (priority) => {
        if (priority >= 8) return 'red';
        if (priority >= 5) return 'orange';
        return 'blue';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading recommendations...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                        <p className="text-gray-600">Smart suggestions to save money</p>
                    </div>
                    <button
                        onClick={generateRecommendations}
                        disabled={generating}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                        <span>{generating ? 'Generating...' : 'Refresh Recommendations'}</span>
                    </button>
                </div>

                {/* Total Savings Banner */}
                {totalSavings > 0 && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg mb-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">
                            Potential Annual Savings: ${totalSavings.toFixed(2)}
                        </h2>
                        <p>Implement these {recommendations.length} recommendations to save money!</p>
                    </div>
                )}

                {/* Recommendations List */}
                {recommendations.length > 0 ? (
                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <RecommendationCard
                                key={rec.id}
                                recommendation={rec}
                                onDismiss={dismissRecommendation}
                                onComplete={completeRecommendation}
                                icon={getIcon(rec.type)}
                                color={getColor(rec.priority)}
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
                            Add more subscriptions or connect your bank account to get personalized recommendations
                        </p>
                        <button
                            onClick={generateRecommendations}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                            Generate Recommendations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function RecommendationCard({ recommendation, onDismiss, onComplete, icon, color }) {
    const colorClasses = {
        red: 'border-l-red-500 bg-red-50',
        orange: 'border-l-orange-500 bg-orange-50',
        blue: 'border-l-blue-500 bg-blue-50',
    };

    return (
        <div className={`bg-white border-l-4 ${colorClasses[color]} rounded-lg shadow p-6`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 text-gray-700">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {recommendation.title}
                            </h3>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Save ${recommendation.potential_savings.toFixed(2)}/year
                            </span>
                        </div>
                        <p className="text-gray-600">{recommendation.description}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
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