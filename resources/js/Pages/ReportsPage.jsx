import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Globe, Calendar, ChevronRight, Search, Loader2 } from 'lucide-react';

export default function ReportsPage({ onViewReport }) {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Fetch Data
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const response = await axios.get('http://127.0.0.1:8000/api/scans', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setScans(response.data.data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Filter Logic
    const filteredScans = scans.filter(s => 
        s.scan_reference.toLowerCase().includes(search.toLowerCase()) ||
        s.target_value.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-body text-black">
            
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <span className="text-xs font-bold tracking-widest uppercase bg-black/5 px-3 py-1 rounded-full border border-black/10">Audit Logs</span>
                    <h2 className="font-heading text-4xl md:text-5xl mt-3">Scan History</h2>
                    <p className="text-black/60 mt-2">View and analyze past security reports.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-3 text-black/40" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Scan ID or File..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition shadow-sm"
                    />
                </div>
            </motion.div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-black/50"/></div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl border border-white/50 overflow-hidden">
                    {filteredScans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/5 text-xs font-bold uppercase text-black/50">
                                    <tr>
                                        <th className="p-6">Type</th>
                                        <th className="p-6">Target / Reference</th>
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Score</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {filteredScans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-gray-50 transition group cursor-pointer" onClick={() => onViewReport(scan.scan_reference)}>
                                            <td className="p-6">
                                                {scan.target_type === 'zip' ? (
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700"><FileText size={20}/></div>
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700"><Globe size={20}/></div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-lg">{scan.scan_reference}</div>
                                                <div className="text-sm text-black/50 truncate max-w-[200px]">{scan.target_value}</div>
                                            </td>
                                            <td className="p-6 text-sm text-black/60">
                                                <div className="flex items-center gap-2"><Calendar size={14}/> {new Date(scan.created_at).toLocaleDateString()}</div>
                                                <div className="ml-6 text-xs opacity-70">{new Date(scan.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                    scan.score >= 80 ? 'bg-green-100 text-green-700' : 
                                                    scan.score >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {scan.score}/100
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); onViewReport(scan.scan_reference); }} className="bg-black text-white p-2 rounded-full hover:scale-110 transition shadow-md">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-black/40">No scans found matching your search.</div>
                    )}
                </div>
            )}
        </div>
    );
}