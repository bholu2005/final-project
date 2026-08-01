import React, { useState } from 'react';
import { ArrowLeft, Play, Send, Key, FileCode, CheckCircle, Terminal, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function ApiPlaygroundPage({ onBack }) {
    const [apiKey, setApiKey] = useState('');
    const [endpoint, setEndpoint] = useState('POST /api/tools/headers');
    const [urlInput, setUrlInput] = useState('https://laravel.com');
    const [executing, setExecuting] = useState(false);
    const [responseBody, setResponseBody] = useState(null);

    const handleExecute = async () => {
        setExecuting(true);
        setResponseBody(null);

        // Simulation or real request trigger
        try {
            if (endpoint === 'POST /api/tools/headers') {
                const response = await axios.post('http://127.0.0.1:8000/api/tools/headers', {
                    url: urlInput
                });
                setResponseBody(response.data);
            } else {
                // Mock custom payload endpoints
                setTimeout(() => {
                    setResponseBody({
                        success: true,
                        timestamp: new Date().toISOString(),
                        scan_reference: "API_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                        results: {
                            status: "active",
                            api_security_compliant: true,
                            scanned_target: urlInput
                        }
                    });
                    setExecuting(false);
                }, 1500);
                return;
            }
        } catch (err) {
            setResponseBody({
                success: false,
                error: err.response?.data?.message || err.message,
                status: err.response?.status || 500
            });
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black p-4 md:p-8">
            {/* Top Bar */}
            <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/50 hover:bg-white text-black px-4 py-2 rounded-full font-bold transition shadow-sm text-sm">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Terminal size={12} className="text-green-400" /> Developer API Playground
                </div>
            </div>

            {/* Sandbox Console */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
                {/* Left Panel: Request config */}
                <div className="lg:col-span-5 bg-[#FDFBF7] rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/50 space-y-6">
                    <div>
                        <h3 className="font-heading text-3xl mb-2">Request Console</h3>
                        <p className="text-black/50 text-xs">Configure headers and execute live API calls.</p>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-black/60 flex items-center gap-1.5">
                            <Key size={14}/> Authorization Bearer Token
                        </label>
                        <input
                            type="text"
                            placeholder="sk_live_..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black font-mono text-xs shadow-inner"
                        />
                    </div>

                    {/* Endpoint Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-black/60">
                            HTTP Endpoint Method
                        </label>
                        <select
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black text-sm font-bold shadow-sm"
                        >
                            <option value="POST /api/tools/headers">POST /api/tools/headers</option>
                            <option value="POST /api/scan/initiate">POST /api/scan/initiate</option>
                            <option value="GET /api/scans">GET /api/scans</option>
                        </select>
                    </div>

                    {/* Request Body URL parameter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-black/60">
                            Request Parameter (JSON Body)
                        </label>
                        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-inner space-y-3">
                            <div className="text-[10px] font-mono text-black/40">{"{"}</div>
                            <div className="flex items-center gap-2 font-mono text-xs pl-4">
                                <span className="text-purple-600">"url":</span>
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    className="bg-transparent border-b border-black/10 focus:outline-none focus:border-black text-black w-full"
                                />
                            </div>
                            <div className="text-[10px] font-mono text-black/40">{"}"}</div>
                        </div>
                    </div>

                    {/* Run Action */}
                    <button
                        onClick={handleExecute}
                        disabled={executing}
                        className="w-full py-4 bg-black text-white hover:bg-gray-900 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                    >
                        {executing ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Executing...
                            </>
                        ) : (
                            <>
                                <Send size={16} /> Send Request
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel: Response log console */}
                <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-black overflow-hidden justify-between h-[600px]">
                    <div className="flex-grow">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                <FileCode size={14}/> Response Console Stream
                            </span>
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            </div>
                        </div>

                        {/* Interactive response body output */}
                        {responseBody ? (
                            <div className="overflow-auto max-h-[420px] custom-scrollbar">
                                <pre className="font-mono text-xs text-green-400 leading-relaxed">
                                    {JSON.stringify(responseBody, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-[350px] text-gray-500">
                                <Terminal size={40} className="text-white/10 mb-3 animate-pulse" />
                                <p className="text-sm font-bold font-mono">Terminal idle.</p>
                                <p className="text-xs text-white/30 max-w-xs mt-1">Configure inputs and execute the endpoint to see response parameters here.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                        <span>HTTPS/1.1 Protocol</span>
                        <span className="flex items-center gap-1"><Sparkles size={10} className="text-yellow-400" /> Powered by Merlin Engine</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
