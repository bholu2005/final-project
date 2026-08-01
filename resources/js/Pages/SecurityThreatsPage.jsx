import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Bug, RefreshCw, Lock, Loader2, Calendar, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function SecurityThreatsPage({ onBack }) {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchThreats = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/threat-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreats(res.data || []);
        } catch (err) {
            console.error("Threat logs fetch error:", err);
            setThreats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreats();
    }, []);

    const getThreatLevelColor = (level) => {
        if(level === 'critical') return 'text-red-700 bg-red-100 border-red-200';
        if(level === 'high') return 'text-orange-700 bg-orange-100 border-orange-200';
        return 'text-blue-700 bg-blue-100 border-blue-200';
    };

    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black p-4 md:p-8">
            {/* Top Bar */}
            <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/50 hover:bg-white text-black px-4 py-2 rounded-full font-bold transition shadow-sm text-sm">
                    <ArrowLeft size={18} /> Back to Admin
                </button>
                <div className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Lock size={12} className="animate-pulse" /> Self-Defense WAF Logs
                </div>
            </div>

            {/* Dashboard Workspace */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto bg-[#FDFBF7] rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/50 min-h-[600px]">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h3 className="font-heading text-4xl flex items-center gap-3">
                            <ShieldAlert size={36} className="text-red-600 animate-bounce" /> Intrusion Logs
                        </h3>
                        <p className="text-black/50 text-sm mt-1">Real-time alerts of blocked exploit payloads and scraper bots.</p>
                    </div>
                    <button onClick={fetchThreats} className="bg-black hover:bg-gray-900 text-white p-3 rounded-full transition shadow-md">
                        <RefreshCw size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="animate-spin text-black/50" size={40} />
                    </div>
                ) : threats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 text-black/40">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                            <Lock size={32} />
                        </div>
                        <p className="text-lg font-bold">WAF Shield Active</p>
                        <p className="text-xs text-black/30 mt-1 max-w-xs">No intrusion threats, SQLi payloads, or anomalous scraper bots detected yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-xs uppercase text-black/40 font-bold border-b border-black/5">
                                <tr>
                                    <th className="p-4 pl-0">IP Address</th>
                                    <th className="p-4">Attack Vector Type</th>
                                    <th className="p-4">Threat Level</th>
                                    <th className="p-4">Intercepted Target</th>
                                    <th className="p-4">Payload Snippet</th>
                                    <th className="p-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 text-sm">
                                {threats.map((log) => (
                                    <tr key={log.id} className="hover:bg-white transition-colors group">
                                        <td className="p-4 pl-0 font-mono text-black/60 group-hover:text-black transition">
                                            <span className="flex items-center gap-1.5"><Globe size={14}/> {log.ip_address}</span>
                                        </td>
                                        <td className="p-4 font-bold text-red-600">{log.attack_type}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getThreatLevelColor(log.threat_level)}`}>
                                                {log.threat_level}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-mono max-w-[200px] truncate">{log.target_url}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500 max-w-[250px] truncate">{log.payload}</td>
                                        <td className="p-4 text-right text-xs text-black/50 font-mono">
                                            <span className="flex items-center justify-end gap-1"><Calendar size={12}/> {new Date(log.created_at).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
