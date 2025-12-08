import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditSubscriptionModal({ isOpen, onClose, onSubmit, subscription }) {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        billing_cycle: 'monthly',
        next_billing_date: '',
        category: '',
        description: '',
        status: 'active',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Populate form when subscription changes
    useEffect(() => {
        if (subscription) {
            setFormData({
                name: subscription.name || '',
                amount: subscription.amount || '',
                billing_cycle: subscription.billing_cycle || 'monthly',
                next_billing_date: subscription.next_billing_date || '',
                category: subscription.category || '',
                description: subscription.description || '',
                status: subscription.status || 'active',
            });
        }
    }, [subscription]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Subscription name is required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.next_billing_date) newErrors.next_billing_date = 'Billing date is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(subscription.id, formData);
            onClose();
        } catch (error) {
            console.error('Failed to update subscription:', error);
            setErrors({ submit: 'Failed to update subscription. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !subscription) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Edit Subscription</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errors.submit}
                        </div>
                    )}

                    {/* Subscription Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subscription Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Netflix, Spotify"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (ZAR) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.amount ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                        )}
                    </div>

                    {/* Billing Cycle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Billing Cycle *
                        </label>
                        <select
                            name="billing_cycle"
                            value={formData.billing_cycle}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Next Billing Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Next Billing Date *
                        </label>
                        <input
                            type="date"
                            name="next_billing_date"
                            value={formData.next_billing_date}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.next_billing_date ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.next_billing_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.next_billing_date}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select category</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Music">Music</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Cloud Storage">Cloud Storage</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.status === 'paused' && 'Subscription is temporarily paused'}
                            {formData.status === 'cancelled' && 'Subscription has been cancelled'}
                            {formData.status === 'active' && 'Subscription is currently active'}
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add any notes about this subscription..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Subscription Info</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Monthly cost: R{parseFloat(formData.amount || 0).toFixed(2)}</li>
                            <li>• Yearly cost: R{(parseFloat(formData.amount || 0) * 12).toFixed(2)}</li>
                            {formData.next_billing_date && (
                                <li>• Next billing: {new Date(formData.next_billing_date).toLocaleDateString()}</li>
                            )}
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}