import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Receipt, Download, Calendar, CheckCircle, ArrowLeft, Loader2, CreditCard, Crown, Clock } from 'lucide-react';

export default function BillingPage({ onBack }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState('Free');

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                
                // Fetch User Plan
                const userRes = await axios.get('http://127.0.0.1:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentPlan(userRes.data.plan_type);

                // Fetch History (Ensure SubscriptionController exists backend side)
                const res = await axios.get('http://127.0.0.1:8000/api/subscription/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(res.data.data || []);
            } catch (err) {
                console.error("Billing Fetch Error:", err);
                // Fallback empty if API fails (Prevent Crash)
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBilling();
    }, []);

    // Helper for Plan Color
    const getPlanColor = (plan) => {
        if(plan === 'diamond') return 'text-purple-600 bg-purple-100 border-purple-200';
        if(plan === 'platinum') return 'text-blue-600 bg-blue-100 border-blue-200';
        if(plan === 'gold') return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        return 'text-gray-600 bg-gray-100 border-gray-200';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#E8D5C6]"><Loader2 size={40} className="animate-spin text-black"/></div>;

    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black p-4 md:p-8">
            
            {/* Top Bar */}
            <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/50 hover:bg-white text-black px-4 py-2 rounded-full font-bold transition-all shadow-sm text-sm">
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8"
            >
                {/* LEFT: Current Plan Status */}
                <div className="lg:col-span-4 bg-[#FDFBF7] rounded-[2.5rem] p-8 shadow-xl border border-white/50 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Crown size={150} /></div>
                    
                    <h3 className="font-heading text-3xl mb-2">Current Plan</h3>
                    <p className="text-black/50 text-sm mb-6">Your active subscription details.</p>

                    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${getPlanColor(currentPlan)}`}>
                            <Crown size={32} />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">{currentPlan}</h2>
                        <p className="text-xs text-black/40 font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block">ACTIVE</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-black/5">
                            <span className="text-sm font-bold text-black/60 flex items-center gap-2"><CreditCard size={16}/> Next Billing</span>
                            <span className="text-sm font-mono">Auto-Renew</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-black/5">
                            <span className="text-sm font-bold text-black/60 flex items-center gap-2"><Clock size={16}/> Status</span>
                            <span className="text-sm font-mono text-green-600 font-bold">Good</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Transaction History */}
                <div className="lg:col-span-8 bg-[#FDFBF7] rounded-[2.5rem] p-8 shadow-xl border border-white/50 min-h-[600px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-heading text-3xl">Billing History</h3>
                        <div className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold">{transactions.length} Records</div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Receipt size={32} className="text-black/20"/></div>
                            <p className="text-black/40 font-bold">No transactions found.</p>
                            <p className="text-xs text-black/30 mt-1">Purchases will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-xs uppercase text-black/40 font-bold border-b border-black/5">
                                    <tr>
                                        <th className="p-4 pl-0">Invoice</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 text-sm">
                                    {transactions.map((tx, i) => (
                                        <tr key={i} className="group hover:bg-white transition-colors">
                                            <td className="p-4 pl-0 font-mono text-black/60 group-hover:text-black transition">{tx.invoice_id}</td>
                                            <td className="p-4 font-bold capitalize">{tx.plan_name}</td>
                                            <td className="p-4 text-black/60">{new Date(tx.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold">₹{parseInt(tx.amount).toLocaleString('en-IN')}</td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 rounded-full hover:bg-black hover:text-white transition text-black/40">
                                                    <Download size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
}