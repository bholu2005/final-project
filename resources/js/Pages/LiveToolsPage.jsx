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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
                    
                    {/* 1. Status Card */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-white/50">
                        <h3 className="font-heading text-xl mb-4 flex items-center gap-2"><Activity size={20}/> Connection Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-black/60">Response Code</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${result.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {result.status} {result.status === 200 ? 'OK' : 'Error'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-black/60">SSL / HTTPS</span>
                                <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold ${result.ssl ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {result.ssl ? <><Lock size={14}/> Secure</> : <><Unlock size={14}/> Insecure</>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-black/60">Server Technology</span>
                                <span className="font-mono text-sm">{result.server}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Raw Headers */}
                    <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="font-heading text-xl mb-4 flex items-center gap-2 relative z-10"><Server size={20}/> Raw Headers</h3>
                        
                        <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent font-mono text-xs space-y-2 relative z-10">
                            {Object.entries(result.headers).map(([key, value]) => (
                                <div key={key} className="border-b border-white/10 pb-2">
                                    <span className="text-blue-300 font-bold block mb-1">{key}</span>
                                    <span className="text-white/70 break-all">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            )}

        </div>
    );
}