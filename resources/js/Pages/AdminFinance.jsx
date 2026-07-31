import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Loader2 } from 'lucide-react';

export default function AdminFinance() {
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        axios.get('http://127.0.0.1:8000/api/admin/finance', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setTxs(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto"/></div>;

    return (
        <div className="bg-[#FDFBF7] p-8 rounded-[2rem] shadow-xl border border-white/50">
            <h2 className="text-3xl font-heading mb-6">Revenue & Transactions</h2>
            <table className="w-full text-left">
                <thead className="bg-black/5 text-xs uppercase text-black/50 font-bold">
                    <tr><th className="p-4">Invoice</th><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                    {txs.map(t => (
                        <tr key={t.id}>
                            <td className="p-4 font-mono text-xs">{t.invoice_id}</td>
                            <td className="p-4">{t.user?.name || 'Unknown'}</td>
                            <td className="p-4 font-bold">₹{t.amount}</td>
                            <td className="p-4 text-xs text-black/50">{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}