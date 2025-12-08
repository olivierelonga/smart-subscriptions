import React, { useState } from 'react';
import api from '../axios';

export default function PayFastCheckout({ plan }) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await api.post('/subscribe', { plan });
            
            // Create hidden form and auto-submit to PayFast
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = response.data.url;
            form.style.display = 'none';

            // Add all payment data as hidden inputs
            Object.keys(response.data.data).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = response.data.data[key];
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Failed to initiate payment:', error);
            alert('Failed to start payment process');
            setLoading(false);
        }
    };

    const planDetails = {
        pro: { name: 'Pro', price: 'R89.99' },
        family: { name: 'Family', price: 'R179.99' }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
            {loading ? 'Processing...' : `Subscribe - ${planDetails[plan].price}/month`}
        </button>
    );
}