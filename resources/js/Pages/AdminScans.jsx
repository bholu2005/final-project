import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Loader2, FileText } from 'lucide-react';

export default function AdminScans() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        axios.get('http://127.0.0.1:8000/api/admin/scans', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setScans(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto"/></div>;

    return (
        <div className="bg-[#FDFBF7] p-8 rounded-[2rem] shadow-xl border border-white/50">
            <h2 className="text-3xl font-heading mb-6">Global Scan Logs</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-black/5 text-xs uppercase text-black/50 font-bold">
                        <tr>
                            <th className="p-4">Ref ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Target</th>
                            <th className="p-4">Score</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {scans.map(s => (
                            <tr key={s.id} className="hover:bg-white transition">
                                <td className="p-4 font-mono text-xs">{s.scan_reference}</td>
                                <td className="p-4 uppercase text-xs font-bold">{s.target_type}</td>
                                <td className="p-4 text-black/60 truncate max-w-[200px]">{s.target_value}</td>
                                <td className="p-4 font-bold">{s.score}/100</td>
                                <td className="p-4 text-xs text-black/50">{new Date(s.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}