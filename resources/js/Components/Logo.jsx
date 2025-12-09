import React from 'react';
import { DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Logo({ size = 'md', showText = true, href = '/' }) {
    const sizes = {
        sm: {
            container: 'w-6 h-6',
            icon: 'w-4 h-4',
            text: 'text-base',
        },
        md: {
            container: 'w-8 h-8',
            icon: 'w-5 h-5',
            text: 'text-xl',
        },
        lg: {
            container: 'w-10 h-10',
            icon: 'w-6 h-6',
            text: 'text-2xl',
        },
        xl: {
            container: 'w-12 h-12',
            icon: 'w-7 h-7',
            text: 'text-3xl',
        },
    };

    const currentSize = sizes[size];

    const LogoContent = () => (
        <div className="flex items-center space-x-2">
            <div className={`${currentSize.container} bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-md`}>
                <DollarSign className={currentSize.icon} />
            </div>
            {showText && (
                <span className={`${currentSize.text} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                    SubTrack
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex hover:opacity-80 transition">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
}