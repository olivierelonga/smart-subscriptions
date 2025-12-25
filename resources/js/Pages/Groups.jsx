import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Users, Plus, Copy, Check, Trash2, LogOut, Crown } from 'lucide-react';
import Toast from '@/Components/Toast';
import axios from 'axios';

export default function Groups({ auth }) {
    const [ownedGroups, setOwnedGroups] = useState([]);
    const [memberGroups, setMemberGroups] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadGroups();
        loadSubscriptions();
    }, []);

    const loadGroups = async () => {
        try {
            const response = await axios.get('/api/groups');
            setOwnedGroups(response.data.owned_groups || []);
            setMemberGroups(response.data.member_groups || []);
        } catch (error) {
            console.error('Failed to load groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptions = async () => {
        try {
            const response = await axios.get('/api/subscriptions');
            setSubscriptions(response.data.subscriptions || []);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
        }
    };

    const handleCreateGroup = async (formData) => {
        try {
            await axios.post('/api/groups', formData);
            setToast({ message: 'Group created successfully!', type: 'success' });
            setShowCreateModal(false);
            await loadGroups();
        } catch (error) {
            setToast({ message: 'Failed to create group', type: 'error' });
        }
    };

    const handleJoinGroup = async (inviteCode) => {
        try {
            await axios.post('/api/groups/join', { invite_code: inviteCode });
            setToast({ message: 'Joined group successfully!', type: 'success' });
            setShowJoinModal(false);
            await loadGroups();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to join group', type: 'error' });
        }
    };

    const handleLeaveGroup = async (groupId) => {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            await axios.delete(`/api/groups/${groupId}/leave`);
            setToast({ message: 'Left group successfully', type: 'success' });
            await loadGroups();
        } catch (error) {
            setToast({ message: 'Failed to leave group', type: 'error' });
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm('Are you sure you want to delete this group? All members will be removed.')) return;

        try {
            await axios.delete(`/api/groups/${groupId}`);
            setToast({ message: 'Group deleted successfully', type: 'success' });
            await loadGroups();
        } catch (error) {
            setToast({ message: 'Failed to delete group', type: 'error' });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Cost-Sharing Groups</h2>}
        >
            <Head title="Groups" />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Group</span>
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-md"
                        >
                            <Users className="w-5 h-5" />
                            <span>Join Group</span>
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            💰 Save Money Together
                        </h3>
                        <p className="text-blue-700 text-sm">
                            Create cost-sharing groups to split subscription costs with friends and family. 
                            Share Netflix, Spotify, or any subscription - everyone pays their fair share automatically!
                        </p>
                    </div>

                    {/* Groups You Own */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            <span>Groups You Manage</span>
                        </h3>

                        {loading ? (
                            <p className="text-gray-500 text-center py-8">Loading...</p>
                        ) : ownedGroups.length > 0 ? (
                            <div className="space-y-4">
                                {ownedGroups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        isOwner={true}
                                        onDelete={handleDeleteGroup}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                You haven't created any groups yet
                            </p>
                        )}
                    </div>

                    {/* Groups You're In */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Groups You've Joined</h3>

                        {memberGroups.length > 0 ? (
                            <div className="space-y-4">
                                {memberGroups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        isOwner={false}
                                        onLeave={handleLeaveGroup}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                You haven't joined any groups yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <CreateGroupModal
                    subscriptions={subscriptions}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateGroup}
                />
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <JoinGroupModal
                    onClose={() => setShowJoinModal(false)}
                    onSubmit={handleJoinGroup}
                />
            )}
        </AuthenticatedLayout>
    );
}

function GroupCard({ group, isOwner, onDelete, onLeave }) {
    const [copied, setCopied] = useState(false);

    const copyInviteCode = () => {
        navigator.clipboard.writeText(group.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const memberCount = group.members?.length || 0;
    const costPerMember = memberCount > 0 ? (group.total_cost / memberCount).toFixed(2) : group.total_cost;

    return (
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                    {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        {group.subscription?.name || 'Subscription'}
                    </p>
                </div>
                {isOwner && (
                    <button
                        onClick={() => onDelete(group.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete group"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Total Cost</p>
                    <p className="font-semibold text-gray-900">R{parseFloat(group.total_cost).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Your Share</p>
                    <p className="font-semibold text-purple-600">R{costPerMember}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Members</p>
                    <p className="font-semibold text-gray-900">{memberCount}/{group.max_members}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {group.status}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                        {group.invite_code}
                    </code>
                    <button
                        onClick={copyInviteCode}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Copy invite code"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {!isOwner && (
                    <button
                        onClick={() => onLeave(group.id)}
                        className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-3 py-1 rounded transition text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Leave</span>
                    </button>
                )}
            </div>
        </div>
    );
}

function CreateGroupModal({ subscriptions, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        subscription_id: '',
        name: '',
        description: '',
        max_members: 4,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold">Create Sharing Group</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Subscription *
                        </label>
                        <select
                            value={formData.subscription_id}
                            onChange={(e) => setFormData({ ...formData, subscription_id: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value="">Choose a subscription</option>
                            {subscriptions.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name} - R{sub.amount}/{sub.billing_cycle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Family Netflix"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add any notes..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Members *
                        </label>
                        <input
                            type="number"
                            value={formData.max_members}
                            onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                            min="2"
                            max="20"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function JoinGroupModal({ onClose, onSubmit }) {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(inviteCode);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold">Join Group</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invite Code *
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Enter 8-character code"
                            required
                            maxLength={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none font-mono text-lg"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Get the invite code from the group owner
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || inviteCode.length !== 8}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}