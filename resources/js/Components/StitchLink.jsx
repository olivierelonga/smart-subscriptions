import React, { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function StitchLink({ onSuccess }) {
    const [loading, setLoading] = useState(false);

    const connectBank = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/stitch/authorize');
            
            // Redirect user to Stitch authorization page
            // Stitch handles everything and redirects back to our callback
            window.location.href = response.data.authorization_url;
        } catch (error) {
            console.error('Failed to start Stitch authorization:', error);
            alert('Failed to connect bank account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={connectBank}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Redirecting to Stitch...</span>
                </>
            ) : (
                <>
                    <Building2 className="w-5 h-5" />
                    <span>Connect South African Bank</span>
                </>
            )}
        </button>
    );
}