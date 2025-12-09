import React from 'react';
import { DollarSign } from 'lucide-react';

export default function ApplicationLogo({ className = '' }) {
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SubTrack
            </span>
        </div>
    );
}