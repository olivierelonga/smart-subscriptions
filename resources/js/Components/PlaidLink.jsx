import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from '../axios';

export default function PlaidLink({ onSuccess }) {
    const [linkToken, setLinkToken] = useState(null);

    useEffect(() => {
        // Get link token from backend
        const createLinkToken = async () => {
            try {
                const response = await api.post('/plaid/link-token');
                setLinkToken(response.data.link_token);
            } catch (error) {
                console.error('Failed to create link token:', error);
            }
        };
        createLinkToken();
    }, []);

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
            try {
                // Exchange public token on backend
                await api.post('/plaid/exchange-token', {
                    public_token: publicToken,
                    metadata: metadata,
                });
                onSuccess();
            } catch (error) {
                console.error('Failed to exchange token:', error);
            }
        },
    });

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Connect Bank Account
        </button>
    );
}