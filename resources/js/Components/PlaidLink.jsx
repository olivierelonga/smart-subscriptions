import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Building2 } from 'lucide-react';
import api from '@/axios';

export default function PlaidLink({ onSuccess, onExit }) {
    const [linkToken, setLinkToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create link token when component mounts
    useEffect(() => {
        const createLinkToken = async () => {
            try {
                setLoading(true);
                const response = await api.post('/plaid/link-token');
                setLinkToken(response.data.link_token);
            } catch (err) {
                console.error('Failed to create link token:', err);
                setError('Failed to initialize Plaid. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        createLinkToken();
    }, []);

    const onSuccessCallback = useCallback(async (publicToken, metadata) => {
        try {
            // Exchange public token for access token
            const response = await api.post('/plaid/exchange-token', {
                public_token: publicToken,
                metadata: metadata,
            });

            console.log('Bank account connected:', response.data);
            
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (err) {
            console.error('Failed to exchange token:', err);
            setError('Failed to connect bank account. Please try again.');
        }
    }, [onSuccess]);

    const onExitCallback = useCallback((err, metadata) => {
        console.log('Plaid Link exited:', err, metadata);
        if (onExit) {
            onExit(err, metadata);
        }
    }, [onExit]);

    const config = {
        token: linkToken,
        onSuccess: onSuccessCallback,
        onExit: onExitCallback,
    };

    const { open, ready } = usePlaidLink(config);

    if (loading) {
        return (
            <button
                disabled
                className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing...</span>
            </button>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
            <Building2 className="w-5 h-5" />
            <span>Connect Bank Account</span>
        </button>
    );
}