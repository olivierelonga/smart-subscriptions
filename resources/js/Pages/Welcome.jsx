import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { DollarSign, TrendingUp, Users, Calendar, Shield, Zap } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="SubTrack - Smart Subscription Management" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
                {/* Navigation */}
                <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold">SubTrack</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-gray-300 hover:text-white transition"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-sm">Stop wasting money on forgotten subscriptions</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                            Take Control of Your Subscriptions
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                            Track, share, and save on all your recurring payments. Join thousands who've recovered an average of <span className="text-purple-400 font-semibold">R1,500/month</span> in hidden subscription costs.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-purple-500/50 transition"
                            >
                                Start Saving Now
                            </Link>

                            <a
                                href="#features"
                                className="border border-purple-500/50 hover:bg-purple-500/10 px-8 py-4 rounded-xl text-lg font-semibold transition"
                            >
                                Learn More
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div>
                                <div className="text-3xl font-bold text-purple-400">R1,500</div>
                                <div className="text-sm text-slate-400">Avg. Monthly Savings</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-400">12+</div>
                                <div className="text-sm text-slate-400">Subscriptions Tracked</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-400">85%</div>
                                <div className="text-sm text-slate-400">Money Recovered</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 px-4 bg-slate-900/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4">Everything You Need to Save</h2>
                            <p className="text-xl text-slate-400">Powerful features that put money back in your pocket</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                title="Smart Detection"
                                description="Automatically identifies all your recurring subscriptions and shows exactly where your money goes."
                            />
                            <FeatureCard
                                icon={<Users className="w-6 h-6" />}
                                title="Easy Cost-Sharing"
                                description="Split family plans with friends seamlessly. We handle payments, reminders, and all the awkward follow-ups."
                            />
                            <FeatureCard
                                icon={<Zap className="w-6 h-6" />}
                                title="AI Savings Engine"
                                description="Get personalized recommendations to cut redundant services and upgrade to better family plans."
                            />
                            <FeatureCard
                                icon={<Shield className="w-6 h-6" />}
                                title="Bank-Level Security"
                                description="Your financial data is encrypted and protected with enterprise-grade security."
                            />
                            <FeatureCard
                                icon={<Calendar className="w-6 h-6" />}
                                title="Billing Reminders"
                                description="Never miss a payment date again. Get timely reminders before each subscription renews."
                            />
                            <FeatureCard
                                icon={<DollarSign className="w-6 h-6" />}
                                title="Save Money"
                                description="Track spending patterns and discover where you can save. Average user saves R18,000 per year."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-3xl shadow-2xl">
                            <h2 className="text-4xl font-bold mb-6">Ready to Stop Wasting Money?</h2>
                            <p className="text-xl mb-8 text-purple-100">Join thousands already saving with SubTrack</p>
                            <Link
                                href="/register"
                                className="inline-block bg-white text-purple-600 hover:bg-slate-100 px-10 py-4 rounded-xl text-lg font-semibold transition"
                            >
                                Get Started Free
                            </Link>
                            <p className="text-sm text-purple-200 mt-4">No credit card required • Free 30-day trial</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-4 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto text-center text-slate-400">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">SubTrack</span>
                        </div>
                        <p className="mb-4">Take control of your subscriptions and save money effortlessly.</p>
                        <p className="text-sm">© 2026 SubTrack. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}