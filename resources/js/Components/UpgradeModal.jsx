import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function UpgradeModal({ onClose }) {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('pro');

    const handleSubscribe = async (plan) => {
        setLoading(true);
        try {
            // Simulated API call
            console.log('Subscribing to:', plan);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(`Subscribed to ${plan} plan!`);
            setLoading(false);
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden" style={{ maxHeight: '85vh' }}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 bg-white rounded-full shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side - Value Prop (Marketing) */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-yellow-400 mb-4">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="font-bold tracking-wide uppercase text-xs">Validating Savings</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                            Pay as you save.
                        </h2>

                        <p className="text-indigo-200 text-base md:text-lg mb-6 leading-relaxed">
                            Unlock the full power of SubTrack. Our average Pro user saves <span className="text-white font-bold">R19,500/year</span>
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Bank Integration</h4>
                                    <p className="text-xs text-indigo-300">Connect your accounts securely</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Group Sharing</h4>
                                    <p className="text-xs text-indigo-300">Split costs with friends</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-xs text-indigo-400">
                        Secure payment via PayFast
                    </div>
                </div>

                {/* Right Side - Plans */}
                <div className="w-full md:w-3/5 p-6 md:p-8 bg-gray-50 flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">Choose your plan</h3>

                    <div className="grid gap-3 flex-1">
                        {/* Pro Plan */}
                        <div
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-purple-600 bg-white shadow-lg' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                            onClick={() => setSelectedPlan('pro')}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-base text-gray-900">Pro Monthly</h4>
                                {selectedPlan === 'pro' && <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">SELECTED</div>}
                            </div>
                            <div className="flex items-baseline mb-2">
                                <span className="text-2xl font-extrabold text-gray-900">R89.99</span>
                                <span className="text-gray-500 ml-1 text-sm">/month</span>
                            </div>
                            <ul className="space-y-1">
                                <li className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                    <span className="font-bold">Advanced AI Insights</span>
                                </li>
                                <li className="flex items-center text-xs text-gray-500 ml-6">
                                    • Spending Anomaly Detection
                                </li>
                                <li className="flex items-center text-xs text-gray-500 ml-6">
                                    • Trial Subscription Tracking
                                </li>
                                <li className="flex items-center text-xs text-gray-500 ml-6">
                                    • Smart Bundle Optimization
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                    Create Sharing Groups
                                </li>
                            </ul>
                        </div>

                        {/* Family Plan */}
                        <div
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPlan === 'family' ? 'border-purple-600 bg-white shadow-lg' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                            onClick={() => setSelectedPlan('family')}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-base text-gray-900">Family Plan</h4>
                                {selectedPlan === 'family' && <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">SELECTED</div>}
                            </div>
                            <div className="flex items-baseline mb-2">
                                <span className="text-2xl font-extrabold text-gray-900">R179.99</span>
                                <span className="text-gray-500 ml-1 text-sm">/month</span>
                            </div>
                            <ul className="space-y-1">
                                <li className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                    Up to 5 Family Members
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                    All Pro Features
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubscribe(selectedPlan)}
                        disabled={loading}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <span>Upgrade Now</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-gray-400 text-xs mt-3">
                        Cancel anytime. No hidden fees.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Demo wrapper to show the modal
function App() {
    const [showModal, setShowModal] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <button
                onClick={() => setShowModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
            >
                Open Upgrade Modal
            </button>
            
            {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
        </div>
    );
}