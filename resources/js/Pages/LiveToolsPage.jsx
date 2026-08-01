import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Globe, Search, Shield, Server, Activity, Loader2, Lock, Unlock } from 'lucide-react';

export default function LiveToolsPage() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkHeaders = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setResult(null);
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/tools/headers', { url });
            setResult(response.data);
        } catch (err) {
            setError('Failed to connect to the URL. Check validity or server status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black">
            
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <span className="text-xs font-bold tracking-widest uppercase bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                    Developer Utilities
                </span>
                <h2 className="font-heading text-4xl md:text-5xl mt-4 mb-3">Live Header Inspector</h2>
                <p className="text-black/60 max-w-xl mx-auto">
                    Instantly fetch server headers, SSL status, and response codes without running a full scan.
                </p>
            </motion.div>

            {/* Input Section */}
            <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-black/5 flex items-center gap-2 mb-10">
                <div className="pl-4 text-black/40"><Globe size={20} /></div>
                <input 
                    type="text" 
                    placeholder="https://example.com" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent p-3 outline-none text-lg font-mono"
                />
                <button 
                    onClick={checkHeaders}
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
                    Inspect
                </button>
            </div>

            {/* ERROR MSG */}
            {error && (
                <div className="max-w-2xl mx-auto mb-8 bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold border border-red-100">
                    {error}
                </div>
            )}

            {/* RESULTS GRID */}
            {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 1. Status Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-black/5 flex flex-col justify-between">
                            <div>
                                <h3 className="font-heading text-2xl mb-6 flex items-center gap-2 text-black">
                                    <Activity size={22} className="text-black" /> Connection Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
                                        <span className="text-sm font-bold text-black/60">Response Code</span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${result.status === 200 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                            {result.status} {result.status === 200 ? 'OK' : 'Error'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
                                        <span className="text-sm font-bold text-black/60">SSL / HTTPS</span>
                                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${result.ssl ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                                            {result.ssl ? <><Lock size={12}/> Secure</> : <><Unlock size={12}/> Insecure</>}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-black/5">
                                        <span className="text-sm font-bold text-black/60">Server Technology</span>
                                        <span className="font-mono text-sm text-black/80">{result.server || 'Hidden/Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Security Headers Audit */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-black/5">
                            <h3 className="font-heading text-2xl mb-6 flex items-center gap-2 text-black">
                                <Shield size={22} className="text-black" /> Security Headers Audit
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Content-Security-Policy', desc: 'Prevents XSS & data injection' },
                                    { name: 'Strict-Transport-Security', desc: 'Enforces HTTPS connections' },
                                    { name: 'X-Frame-Options', desc: 'Protects against clickjacking' },
                                    { name: 'X-Content-Type-Options', desc: 'Prevents MIME-sniffing' },
                                    { name: 'Referrer-Policy', desc: 'Controls referrer data sent' }
                                ].map((h) => {
                                    // Case-insensitive key check
                                    const headerKey = Object.keys(result.headers).find(k => k.toLowerCase() === h.name.toLowerCase());
                                    const hasHeader = !!headerKey;
                                    return (
                                        <div key={h.name} className="flex justify-between items-start p-3 bg-gray-50 rounded-2xl border border-black/5">
                                            <div>
                                                <h4 className="text-xs font-mono font-bold text-black">{h.name}</h4>
                                                <p className="text-[10px] text-black/50">{h.desc}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${hasHeader ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                {hasHeader ? 'Secure' : 'Missing'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3. Raw Headers (Full width Terminal style) */}
                    <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-gray-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="font-heading text-2xl flex items-center gap-2"><Server size={22}/> Raw Response Headers</h3>
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto pr-2 font-mono text-sm space-y-3 relative z-10 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                            {Object.entries(result.headers).map(([key, value]) => (
                                <div key={key} className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 border-b border-white/5 pb-3">
                                    <span className="text-blue-400 font-bold shrink-0 md:w-64 select-none">{key}:</span>
                                    <span className="text-gray-300 break-all">{Array.isArray(value) ? value.join(', ') : value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
    );
}