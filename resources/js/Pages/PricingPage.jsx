import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Shield, Star, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function PricingPage({ onBack }) {
    const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, biannual, yearly
    const [processing, setProcessing] = useState(null);

    // Plans Data (INR)
    const plans = [
        { 
            name: 'Silver', 
            icon: Shield, 
            color: 'text-gray-500', 
            basePrice: 800, 
            features: ['Standard Scan Speed', 'Basic Security Checks', 'PDF Report Export', 'Email Support'] 
        },
        { 
            name: 'Gold', 
            icon: Star, 
            color: 'text-yellow-500', 
            basePrice: 1100, 
            features: ['2x Faster Scanning', 'Deep Code Analysis', 'AI Fix Suggestions', 'Priority Support'] 
        },
        { 
            name: 'Platinum', 
            icon: Zap, 
            color: 'text-blue-500', 
            basePrice: 2000, 
            features: ['5x Lightning Speed', 'Full Security Suite', 'Auto-Patch Code', 'API Access', 'Live URL Monitoring'] 
        },
        { 
            name: 'Diamond', 
            icon: Crown, 
            color: 'text-purple-500', 
            basePrice: 5000, 
            isDiamond: true,
            features: ['Dedicated Server', 'Enterprise Security', '24/7 Dedicated Agent', 'Custom Compliance Reports', 'Unlimited Users'] 
        }
    ];

    // Price Calculator
    const getPrice = (plan) => {
        if (plan.isDiamond) return 5000;
        
        if (billingCycle === 'monthly') return plan.basePrice;
        if (billingCycle === 'biannual') return Math.round(plan.basePrice * 6 * 0.90);
        if (billingCycle === 'yearly') return Math.round(plan.basePrice * 12 * 0.80);
    };

    // Label Text
    const getDurationText = (plan) => {
        if (plan.isDiamond) return '/year';
        if (billingCycle === 'monthly') return '/mo';
        if (billingCycle === 'biannual') return '/6mo';
        if (billingCycle === 'yearly') return '/year';
    };

    // Real-simulation Payment Handler
    const handlePurchase = async (index) => {
        setProcessing(index);
        const plan = plans[index];
        const price = getPrice(plan);
        const token = sessionStorage.getItem('auth_token');

        try {
            if (!token) {
                alert("Please log in to upgrade your subscription.");
                setProcessing(null);
                return;
            }

            // Call real backend API
            const response = await axios.post('http://127.0.0.1:8000/api/subscription/upgrade', {
                plan_name: plan.name,
                amount: price
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert(`Payment Gateway Simulation: Successfully upgraded to ${plan.name}!`);
                if (onBack) onBack();
            } else {
                alert("Upgrade failed: " + (response.data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Upgrade Error:", err);
            alert("Failed to connect to the subscription server. Please try again.");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen font-body text-black">
            
            {/* Header */}
            <div className="text-center mb-12">
                <span className="text-xs font-bold tracking-widest uppercase bg-black text-white px-4 py-1.5 rounded-full shadow-lg">Premium Upgrade</span>
                <h2 className="font-heading text-5xl md:text-6xl mt-6 mb-4">Unlock Maximum Power</h2>
                <p className="text-black/60 text-lg max-w-2xl mx-auto">
                    Scale your security testing with our premium tiers. Prices in INR.
                </p>
            </div>

            {/* Toggle Duration */}
            <div className="flex justify-center mb-16">
                <div className="bg-white p-1.5 rounded-full border border-black/10 shadow-sm flex gap-1">
                    {['monthly', 'biannual', 'yearly'].map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === cycle ? 'bg-black text-white shadow-md' : 'text-black/50 hover:bg-gray-50'}`}
                        >
                            {cycle === 'monthly' ? 'Monthly' : cycle === 'biannual' ? '6 Months (-10%)' : 'Yearly (-20%)'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, i) => {
                    const price = getPrice(plan);
                    const duration = getDurationText(plan);
                    const isLocked = plan.isDiamond && billingCycle !== 'yearly';

                    return (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }}
                            className={`bg-white rounded-[2.5rem] p-8 shadow-xl border-2 relative overflow-hidden group flex flex-col hover:scale-105 transition-transform duration-300 ${plan.isDiamond ? 'border-purple-200' : 'border-white'}`}
                        >
                            {/* Background Icon */}
                            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition ${plan.color} rotate-12`}>
                                <plan.icon size={120} />
                            </div>
                            
                            {/* Header */}
                            <div className="mb-6 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${plan.isDiamond ? 'bg-purple-100' : 'bg-gray-50'}`}>
                                    <plan.icon size={28} className={plan.color} />
                                </div>
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                {plan.isDiamond && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Enterprise</span>}
                            </div>

                            {/* Price (INR) */}
                            <div className="mb-8 relative z-10">
                                <div className="text-4xl lg:text-5xl font-heading flex items-end gap-1">
                                    ₹{price.toLocaleString('en-IN')}
                                    <span className="text-lg text-black/40 font-body mb-2">{duration}</span>
                                </div>
                                {plan.isDiamond && billingCycle !== 'yearly' && (
                                    <p className="text-xs text-red-500 mt-1 font-bold">*Available only on Yearly Plan</p>
                                )}
                            </div>
                            
                            {/* Features */}
                            <div className="space-y-4 mb-10 flex-grow relative z-10">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-start gap-3 text-sm text-black/70">
                                        <Check size={16} className="text-green-600 mt-0.5 shrink-0" /> 
                                        <span className="leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => handlePurchase(i)}
                                disabled={isLocked || processing === i}
                                className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 relative z-10
                                    ${plan.isDiamond 
                                        ? (isLocked ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200') 
                                        : 'bg-black hover:bg-gray-900'}
                                `}
                            >
                                {processing === i ? <Loader2 className="animate-spin"/> : (isLocked ? 'Switch to Yearly' : 'Choose Plan')}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}