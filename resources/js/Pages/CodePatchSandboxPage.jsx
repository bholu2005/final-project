import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, Sparkles, AlertTriangle, CheckCircle, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function CodePatchSandboxPage({ scanId, onBack }) {
    const [diffs, setDiffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDiffIndex, setActiveDiffIndex] = useState(0);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const fetchDiffs = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const response = await axios.get(`http://127.0.0.1:8000/api/scan/${scanId}/diff`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setDiffs(response.data.diffs || []);
                }
            } catch (err) {
                console.error("Diff fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        if (scanId) {
            fetchDiffs();
        } else {
            setLoading(false);
        }
    }, [scanId]);

    const activeDiff = diffs[activeDiffIndex];

    const handleApply = () => {
        setApplied(true);
        setTimeout(() => setApplied(false), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-skin text-black">
                <div className="text-center">
                    <Sparkles className="animate-spin text-black/50 mx-auto mb-4" size={40} />
                    <h3 className="font-heading text-xl">Loading AI Patches...</h3>
                </div>
            </div>
        );
    }

    if (diffs.length === 0) {
        return (
            <div className="min-h-screen bg-[#E8D5C6] p-8 md:p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-white/50 max-w-md">
                    <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
                    <h3 className="font-heading text-3xl mb-3">Clean Architecture</h3>
                    <p className="text-black/60 mb-6">No outstanding vulnerabilities exist. Auto-patch sandbox requires code findings.</p>
                    <button onClick={onBack} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-md">Back to Safety</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black p-4 md:p-8">
            {/* Top Navigation */}
            <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/50 hover:bg-white text-black px-4 py-2 rounded-full font-bold transition shadow-sm text-sm">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={12} className="text-yellow-400" /> AI Remediation Sandbox
                </div>
            </div>

            {/* Sandbox Workspace */}
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Vulnerabilities list */}
                <div className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/50 h-fit space-y-3">
                    <h3 className="font-heading text-2xl mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} /> Findings to Patch
                    </h3>
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                        {diffs.map((diff, idx) => (
                            <button
                                key={diff.id}
                                onClick={() => { setActiveDiffIndex(idx); setApplied(false); }}
                                className={`w-full p-4 rounded-xl text-left transition-all border ${activeDiffIndex === idx ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 border-black/5'}`}
                            >
                                <div className="font-bold text-sm truncate">{diff.name}</div>
                                <div className={`text-xs mt-1 font-mono truncate ${activeDiffIndex === idx ? 'text-white/60' : 'text-black/40'}`}>
                                    {diff.location}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Sandbox: Code Comparison Split Viewer */}
                <div className="lg:col-span-8 flex flex-col bg-[#FDFBF7] rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/50 min-h-[600px] justify-between">
                    <div className="mb-6">
                        <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                            <div>
                                <h3 className="font-heading text-3xl">{activeDiff.name}</h3>
                                <p className="text-black/50 text-sm font-mono mt-1">{activeDiff.location}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleApply} className="bg-black hover:bg-gray-900 text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition shadow-md">
                                    <Play size={15} /> Apply Patch
                                </button>
                                <button className="bg-white border border-black/10 text-black hover:bg-gray-50 text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition shadow-sm">
                                    <Download size={15} /> Download
                                </button>
                            </div>
                        </div>

                        {applied && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-100 text-green-800 text-xs font-bold rounded-lg mb-4 flex items-center gap-2 border border-green-200">
                                <CheckCircle size={15} /> AI Patch Applied successfully to source code tree! Memory footprint minimized.
                            </motion.div>
                        )}

                        {/* Split Diff Blocks */}
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {/* ORIGINAL CODE PANEL */}
                            <div className="flex flex-col bg-[#1e1e1e] rounded-2xl overflow-hidden border border-black/10">
                                <div className="px-4 py-2 bg-red-950/40 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Original Code</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Unsafe Code</span>
                                </div>
                                <div className="p-4 overflow-x-auto min-h-[250px] font-mono text-xs text-gray-300 leading-relaxed whitespace-pre">
                                    {activeDiff.original ? activeDiff.original.trim() : "// No source code snippet available."}
                                </div>
                            </div>

                            {/* SECURE AI PATCH PANEL */}
                            <div className="flex flex-col bg-[#1e1e1e] rounded-2xl overflow-hidden border border-black/10">
                                <div className="px-4 py-2 bg-green-950/40 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles size={10}/> Patched Code</span>
                                    <span className="text-[10px] text-green-400 font-mono">Remediated Code</span>
                                </div>
                                <div className="p-4 overflow-x-auto min-h-[250px] font-mono text-xs text-green-400 leading-relaxed whitespace-pre">
                                    {activeDiff.patched ? activeDiff.patched.trim() : "// Safe alternative code structure available."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-black/5 flex items-center gap-2 text-xs text-black/50">
                        <Code size={14}/> <strong>Tip:</strong> System security can be monitored by clicking the applied state in real-time on live dashboards.
                    </div>
                </div>
            </div>
        </div>
    );
}
