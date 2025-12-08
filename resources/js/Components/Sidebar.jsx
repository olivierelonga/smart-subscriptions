import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, CreditCard, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';

export default function Sidebar() {
    const { logout } = useAuth();
    const { url } = usePage();

    const isActive = (path) => url.startsWith(path);

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        { path: '/groups', icon: Users, label: 'Sharing Groups' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-8 p-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">SubTrack</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <button
                onClick={logout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition w-full mt-auto absolute bottom-4"
            >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
    );
}