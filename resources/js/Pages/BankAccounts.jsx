import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Building2, Check, Trash2, RefreshCw, TrendingUp } from 'lucide-react';
import PlaidLink from '@/Components/PlaidLink';
import Toast from '@/Components/Toast';
import api from '@/axios';

export default function BankAccounts({ auth }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/plaid/accounts');
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Failed to load accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaidSuccess = async (data) => {
        setToast({ message: 'Bank account connected successfully!', type: 'success' });
        await loadAccounts();
        await syncTransactions();
    };

    const handlePlaidExit = (err, metadata) => {
        if (err) {
            setToast({ message: 'Failed to connect bank account', type: 'error' });
        }
    };

    const syncTransactions = async () => {
        try {
            setSyncing(true);
            const response = await api.post('/plaid/sync');
            setToast({ 
                message: `Synced ${response.data.count} transactions successfully!`, 
                type: 'success' 
            });
        } catch (error) {
            console.error('Failed to sync transactions:', error);
            setToast({ message: 'Failed to sync transactions', type: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const deleteAccount = async (accountId) => {
        if (!confirm('Are you sure you want to disconnect this bank account?')) {
            return;
        }

        try {
            await api.delete(`/plaid/accounts/${accountId}`);
            setToast({ message: 'Bank account disconnected', type: 'success' });
            await loadAccounts();
        } catch (error) {
            console.error('Failed to delete account:', error);
            setToast({ message: 'Failed to disconnect account', type: 'error' });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Bank Accounts</h2>}
        >
            <Head title="Bank Accounts" />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start space-x-3">
                            <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Automatic Subscription Detection
                                </h3>
                                <p className="text-blue-700 text-sm mb-3">
                                    Connect your bank account to automatically detect recurring subscriptions from your transactions. 
                                    Your data is encrypted and secure.
                                </p>
                                <ul className="text-sm text-blue-600 space-y-1">
                                    <li>✓ Bank-level encryption</li>
                                    <li>✓ Read-only access</li>
                                    <li>✓ Automatic subscription detection</li>
                                    <li>✓ Transaction syncing</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Connected Accounts */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Connected Banks
                            </h3>
                            {accounts.length > 0 && (
                                <button
                                    onClick={syncTransactions}
                                    disabled={syncing}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                    <span>{syncing ? 'Syncing...' : 'Sync Transactions'}</span>
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading accounts...</p>
                            </div>
                        ) : accounts.length > 0 ? (
                            <div className="space-y-4">
                                {accounts.map((account) => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        onDelete={deleteAccount}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No banks connected
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Connect your first bank account to get started
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Connect New Account */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Connect New Bank Account
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Use Plaid to securely connect your bank account. We'll automatically detect 
                            your subscriptions and keep them up to date.
                        </p>
                        <PlaidLink
                            onSuccess={handlePlaidSuccess}
                            onExit={handlePlaidExit}
                        />
                    </div>

                    {/* Testing Instructions */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                            🧪 Sandbox Testing
                        </h4>
                        <p className="text-yellow-800 text-sm mb-3">
                            You're using Plaid Sandbox mode. Use these test credentials:
                        </p>
                        <div className="bg-white rounded p-3 text-sm space-y-1 font-mono">
                            <div><strong>Username:</strong> user_good</div>
                            <div><strong>Password:</strong> pass_good</div>
                            <div><strong>Bank:</strong> Select any bank from the list</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function AccountCard({ account, onDelete }) {
    const formattedDate = account.last_synced_at 
        ? new Date(account.last_synced_at).toLocaleDateString()
        : 'Never';

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">
                        {account.institution_name || 'Unknown Bank'}
                    </h4>
                    <p className="text-sm text-gray-600">
                        Last synced: {formattedDate}
                    </p>
                    {account.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-green-600 mt-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                        </span>
                    ) : (
                        <span className="text-xs text-red-600">Disconnected</span>
                    )}
                </div>
            </div>
            <button
                onClick={() => onDelete(account.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Disconnect bank"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}