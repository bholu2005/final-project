import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Shield, Star, Info } from 'lucide-react';

const plans = [
    { name: 'Free', icon: Shield, basePrice: 0, requests: 10, scans: '3 scans / day', features: ['Core static scan', 'AI debugging: 10 requests / day', 'Community self-service'] },
    { name: 'Silver', icon: Star, basePrice: 800, requests: 50, scans: 'Higher scan allowance', features: ['Standard scan features', 'AI debugging: 50 requests / day', 'Email support'] },
    { name: 'Gold', icon: Zap, basePrice: 1100, requests: 150, scans: 'Higher scan allowance', features: ['Deep code analysis', 'AI debugging: 150 requests / day', 'Priority support'] },
    { name: 'Platinum', icon: Crown, basePrice: 2000, requests: 500, scans: 'Higher scan allowance', features: ['Advanced scan features', 'AI debugging: 500 requests / day', 'API access'] },
    { name: 'Diamond', icon: Crown, basePrice: 5000, requests: 1000, scans: 'Contact for capacity', features: ['Enterprise features', 'AI debugging: 1,000 requests / day', 'Dedicated support options'] },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const priceFor = (plan) => billingCycle === 'yearly' ? Math.round(plan.basePrice * 12 * 0.8) : plan.basePrice;

    return (
        <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen font-body text-black">
            <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                <span className="inline-flex rounded-full bg-black text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Plans & usage</span>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl mt-5 mb-4">Clear limits. No pretend checkout.</h1>
                <p className="text-black/60 text-base sm:text-lg">Prices shown in INR. AI requests reset daily at midnight in the application timezone. Each answer has a provider-configured output-token cap; provider API usage may also be billed separately.</p>
            </header>

            <div className="flex justify-center mb-8 sm:mb-12">
                <div className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full border border-black/10 bg-white p-1.5 shadow-sm" aria-label="Billing period">
                    {['monthly', 'yearly'].map((cycle) => (
                        <button key={cycle} type="button" aria-pressed={billingCycle === cycle} onClick={() => setBillingCycle(cycle)} className={`rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition ${billingCycle === cycle ? 'bg-black text-white' : 'text-black/60 hover:bg-gray-100'}`}>
                            {cycle === 'monthly' ? 'Monthly' : 'Yearly · save 20%'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-5 items-stretch">
                {plans.map((plan, index) => {
                    const Icon = plan.icon;
                    const price = priceFor(plan);
                    return (
                        <motion.article key={plan.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className={`relative flex flex-col rounded-3xl border bg-white p-5 sm:p-6 shadow-lg ${plan.name === 'Gold' ? 'border-purple-500 ring-2 ring-purple-500/10' : 'border-black/10'}`}>
                            {plan.name === 'Gold' && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Popular</span>}
                            <div className="flex items-center gap-3 mb-4"><div className="rounded-xl bg-gray-100 p-3"><Icon className="text-purple-600" size={21} /></div><h2 className="text-xl font-bold">{plan.name}</h2></div>
                            <div className="mb-1 text-3xl sm:text-4xl font-heading">{price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}</div>
                            <p className="text-xs text-black/50 mb-5">{price === 0 ? 'Always free' : billingCycle === 'yearly' ? 'per year' : 'per month'}</p>
                            <div className="rounded-2xl bg-purple-50 p-3 mb-4"><p className="text-xs font-bold text-purple-900">AI requests</p><p className="text-sm text-purple-800">{plan.requests.toLocaleString()} per day</p><p className="text-[10px] text-purple-800/70">Resets daily at midnight</p></div>
                            <div className="rounded-2xl bg-gray-50 p-3 mb-5"><p className="text-xs font-bold">Scans</p><p className="text-xs text-black/70">{plan.scans}</p></div>
                            <ul className="space-y-3 flex-grow mb-6">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-xs text-black/70"><Check size={15} className="text-green-600 shrink-0" /><span>{feature}</span></li>)}</ul>
                            <button type="button" disabled className="w-full rounded-xl bg-gray-200 px-4 py-3 text-xs font-bold text-gray-600 cursor-not-allowed">{plan.basePrice === 0 ? 'Current free tier' : 'Checkout not configured'}</button>
                        </motion.article>
                    );
                })}
            </div>

            <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
                <p className="flex items-center gap-2 font-bold"><Info size={15} /> Billing transparency</p>
                <p className="mt-2">Paid checkout is not connected yet, so upgrade buttons are intentionally disabled and no payment or plan upgrade is simulated. Daily AI request limits are enforced by the server; model token usage is controlled separately by the AI provider and configured output cap.</p>
            </aside>
        </section>
    );
}
