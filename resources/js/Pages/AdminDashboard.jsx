import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, DollarSign, Activity, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, revenue: 0, scans: 0, issues: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const res = await axios.get('http://127.0.0.1:8000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-600' },
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-600' },
        { title: 'Total Scans', value: stats.scans, icon: Activity, color: 'bg-purple-600' },
        { title: 'Open Tickets', value: stats.tickets || 0, icon: AlertTriangle, color: 'bg-orange-600' },
    ];

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black" size={40}/></div>;

    return (
        <div>
            <h2 className="text-4xl font-heading mb-8">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card, i) => (
                    <div key={i} className="bg-[#FDFBF7] p-6 rounded-[2rem] shadow-lg border border-white/50 hover:scale-105 transition flex items-center justify-between">
                        <div>
                            <p className="text-black/40 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-3xl font-bold mt-1 text-black">{card.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-[#FDFBF7] p-10 rounded-[2rem] shadow-xl border border-white/50 text-center">
                <h3 className="text-xl font-bold mb-4 text-black/50">Activity Graph</h3>
                <div className="h-40 flex items-center justify-center text-black/20 font-bold border-2 border-dashed border-black/5 rounded-xl">
                    Chart Integration Pending
                </div>
            </div>
        </div>
    );
}