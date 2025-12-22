import React, { useEffect, useState } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function PlaidLink({ onSuccess, onExit }) {
    const [linkToken, setLinkToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load Plaid script
        const script = document.createElement('script');
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        const createLinkToken = async () => {
            try {
                setLoading(true);
                // Use axios with CSRF token from Laravel
                const response = await axios.post('/plaid/link-token');
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

    const openPlaid = () => {
        if (!window.Plaid || !linkToken) {
            console.error('Plaid not loaded or no link token');
            return;
        }

        const handler = window.Plaid.create({
            token: linkToken,
            onSuccess: async (publicToken, metadata) => {
                try {
                    const response = await axios.post('/plaid/exchange-token', {
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
            },
            onExit: (err, metadata) => {
                console.log('Plaid Link exited:', err, metadata);
                if (onExit) {
                    onExit(err, metadata);
                }
            },
        });

        handler.open();
    };

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
            onClick={openPlaid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg"
        >
            <Building2 className="w-5 h-5" />
            <span>Connect Bank Account</span>
        </button>
    );
}