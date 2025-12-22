import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Building2, Check, Trash2, RefreshCw, TrendingUp, MapPin } from 'lucide-react';
import StitchLink from '@/Components/StitchLink'; // Change this import
import Toast from '@/Components/Toast';
import axios from 'axios';

export default function BankAccounts({ auth, flash }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    // Show flash messages from Laravel redirects
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        }
        if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/stitch/accounts');
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Failed to load accounts:', error);
            setToast({ message: 'Failed to load accounts', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const syncTransactions = async () => {
        try {
            setSyncing(true);
            const response = await axios.post('/stitch/sync');
            setToast({ 
                message: `Synced ${response.data.count} transactions successfully!`, 
                type: 'success' 
            });
            await loadAccounts();
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
            await axios.delete(`/stitch/accounts/${accountId}`);
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
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center space-x-2">
                                    <span>South African Bank Integration</span>
                                    <span className="text-2xl">🇿🇦</span>
                                </h3>
                                <p className="text-green-700 text-sm mb-3">
                                    Connect your South African bank account securely using Stitch. 
                                    Supports all major SA banks including Standard Bank, FNB, Nedbank, Absa, and Capitec.
                                </p>
                                <ul className="text-sm text-green-600 space-y-1">
                                    <li>✓ Bank-level encryption</li>
                                    <li>✓ Read-only access</li>
                                    <li>✓ Automatic subscription detection</li>
                                    <li>✓ Real-time transaction syncing</li>
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
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
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
                            Securely connect your South African bank account. We'll automatically detect 
                            your subscriptions and keep them up to date.
                        </p>
                        <StitchLink onSuccess={loadAccounts} />
                    </div>

                    {/* Supported Banks */}
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">
                            🏦 Supported South African Banks
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Standard Bank', 'FNB', 'Nedbank', 'Absa', 'Capitec', 'Investec', 'TymeBank', 'Discovery Bank'].map((bank) => (
                                <div key={bank} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-700">{bank}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testing Instructions */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                            🧪 Sandbox Testing Mode
                        </h4>
                        <p className="text-yellow-800 text-sm mb-3">
                            You're currently in sandbox mode. To test:
                        </p>
                        <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                            <li>Click "Connect South African Bank"</li>
                            <li>You'll be redirected to Stitch's test environment</li>
                            <li>Select any bank from the test list</li>
                            <li>Use the test credentials provided by Stitch</li>
                            <li>Authorize the connection</li>
                            <li>You'll be redirected back here automatically</li>
                        </ol>
                        <p className="text-xs text-yellow-600 mt-3">
                            Note: You need to sign up at <a href="https://stitch.money/developers" target="_blank" className="underline">stitch.money/developers</a> and add credentials to your .env file
                        </p>
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
            <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">
                        {account.account_name || 'Bank Account'}
                    </h4>
                    <p className="text-sm text-gray-600">
                        Account: •••• {account.account_number?.slice(-4)}
                    </p>
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
            <div className="text-right mr-4">
                {account.current_balance !== null && (
                    <p className="font-semibold text-gray-900">
                        R{parseFloat(account.current_balance).toFixed(2)}
                    </p>
                )}
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