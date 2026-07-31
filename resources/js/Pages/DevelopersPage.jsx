import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Key, Copy, RefreshCw, Trash2, ArrowLeft, Check, Code2, ShieldAlert, Loader2 } from 'lucide-react';

export default function DevelopersPage({ onBack }) {
    const [apiKey, setApiKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('curl'); // curl, node, python

    // 1. Fetch Key on Load
    useEffect(() => {
        fetchKey();
    }, []);

    const fetchKey = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.get('http://127.0.0.1:8000/api/developer/key', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiKey(res.data.api_key);
        } catch (err) { 
            console.error("API Fetch Error", err); 
        } finally { 
            setLoading(false); 
        }
    };

    // 2. Generate Key Function
    const generateKey = async () => {
        if(apiKey && !confirm("This will invalidate your old key. Continue?")) return;
        
        setLoading(true);
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.post('http://127.0.0.1:8000/api/developer/generate', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if(res.data.success) {
                setApiKey(res.data.api_key);
            }
        } catch (err) { 
            console.error(err);
            alert("Failed to generate key. Check Console."); 
        } finally { 
            setLoading(false); 
        }
    };

    // 3. Revoke Key Function
    const revokeKey = async () => {
        if(!confirm("Are you sure? API access will stop immediately.")) return;
        
        setLoading(true);
        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/developer/revoke', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiKey(null);
        } catch (err) { 
            alert("Failed to revoke key."); 
        } finally { 
            setLoading(false); 
        }
    };

    const copyToClipboard = () => {
        if(apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const snippets = {
        curl: `curl -X POST http://127.0.0.1:8000/api/scan/initiate \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -F "file=@project.zip"`,
        node: `const axios = require('axios');\nconst formData = new FormData();\nformData.append('file', fs.createReadStream('project.zip'));\n\naxios.post('http://127.0.0.1:8000/api/scan/initiate', formData, {\n  headers: { 'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}' }\n});`,
        python: `import requests\n\nfiles = {'file': open('project.zip', 'rb')}\nheaders = {'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}'}\n\nr = requests.post('http://127.0.0.1:8000/api/scan/initiate', files=files, headers=headers)`
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black">
            
            <div className="mb-8">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-black/50 hover:text-black transition">
                    <ArrowLeft size={16} /> Back to Settings
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                
                {/* LEFT: KEY MANAGEMENT */}
                <div className="lg:col-span-5 space-y-6">
                    <div>
                        <h2 className="font-heading text-4xl mb-2">Developer API</h2>
                        <p className="text-black/60">Integrate Merlin security scanning directly into your CI/CD pipeline.</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-black/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Key size={20}/> Secret Key</h3>
                            {apiKey && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>}
                        </div>

                        {loading ? (
                            <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-black/20"/></div>
                        ) : apiKey ? (
                            <div className="bg-black text-white p-4 rounded-xl font-mono text-sm break-all relative group cursor-pointer border border-black/10 shadow-inner" onClick={copyToClipboard}>
                                {apiKey}
                                <div className="absolute right-2 top-2 bg-white/20 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                    {copied ? <Check size={14}/> : <Copy size={14}/>}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-50 border-2 border-dashed border-black/10 rounded-xl text-center text-sm text-black/40">
                                No API Key generated yet.
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            <button onClick={generateKey} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition flex justify-center gap-2 shadow-lg">
                                <RefreshCw size={16}/> {apiKey ? 'Roll New Key' : 'Generate Key'}
                            </button>
                            {apiKey && (
                                <button onClick={revokeKey} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition border border-red-100">
                                    <Trash2 size={20}/>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Security Warning (Static UI - Not an Error) */}
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex gap-3">
                        <ShieldAlert className="text-orange-600 shrink-0" size={24}/>
                        <p className="text-xs text-orange-800 leading-relaxed">
                            <strong>Warning:</strong> Your API key carries the same privileges as your account. Never share it or commit it to public repositories.
                        </p>
                    </div>
                </div>

                {/* RIGHT: DOCUMENTATION */}
                <div className="lg:col-span-7">
                    <div className="bg-[#1e1e1e] text-white p-1 rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="bg-black/40 p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"/>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                                <div className="w-3 h-3 rounded-full bg-green-500"/>
                            </div>
                            <div className="flex bg-white/10 rounded-lg p-1 text-[10px] font-bold font-mono">
                                {['curl', 'node', 'python'].map(lang => (
                                    <button 
                                        key={lang} 
                                        onClick={() => setActiveTab(lang)}
                                        className={`px-3 py-1 rounded-md transition ${activeTab === lang ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
                            <div className="text-gray-500 mb-4">// Request Example: Upload and Scan</div>
                            <pre className="text-green-400 whitespace-pre-wrap">
                                {snippets[activeTab]}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                            <h4 className="font-bold mb-1 flex items-center gap-2 text-lg"><Terminal size={18}/> CLI Ready</h4>
                            <p className="text-xs text-black/50">Run scans directly from your terminal or CI/CD pipeline.</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                            <h4 className="font-bold mb-1 flex items-center gap-2 text-lg"><Code2 size={18}/> JSON Output</h4>
                            <p className="text-xs text-black/50">Get detailed analysis results in machine-readable JSON format.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}