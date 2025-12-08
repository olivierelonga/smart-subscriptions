import React from 'react';
import { Calendar, Edit2, Trash2, Users } from 'lucide-react';

export default function SubscriptionList({ subscriptions, onEdit, onDelete }) {
    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No subscriptions yet
                </h3>
                <p className="text-gray-600 mb-6">
                    Start tracking your subscriptions to see insights and save money
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {subscriptions.map((subscription) => (
                <SubscriptionItem
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

function SubscriptionItem({ subscription, onEdit, onDelete }) {
    const daysUntil = Math.ceil(
        (new Date(subscription.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const categoryColors = {
        Entertainment: 'bg-purple-100 text-purple-800',
        Music: 'bg-pink-100 text-pink-800',
        Productivity: 'bg-blue-100 text-blue-800',
        'Cloud Storage': 'bg-green-100 text-green-800',
        Fitness: 'bg-orange-100 text-orange-800',
        Other: 'bg-gray-100 text-gray-800',
    };

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        paused: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition group">
            <div className="flex items-center space-x-4 flex-1">
                {/* Icon/Logo */}
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {subscription.name.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">
                            {subscription.name}
                        </h4>
                        {subscription.is_shared && (
                            <span className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                <Users className="w-3 h-3" />
                                <span>Shared</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[subscription.category] || categoryColors.Other}`}>
                            {subscription.category || 'Other'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[subscription.status]}`}>
                            {subscription.status}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {daysUntil > 0 
                                    ? `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`
                                    : daysUntil === 0
                                    ? 'Due today'
                                    : 'Overdue'}
                            </span>
                        </span>
                    </div>

                    {subscription.description && (
                        <p className="text-sm text-gray-500 mt-2 truncate">
                            {subscription.description}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-xl">
                        R{parseFloat(subscription.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                        per {subscription.billing_cycle}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        R{(parseFloat(subscription.amount) * 12).toFixed(2)}/year
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                        onClick={() => onEdit(subscription)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit subscription"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(subscription.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete subscription"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}