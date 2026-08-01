import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Download, ArrowRight, Bug, Zap, Loader2, X, Code2, Copy, FileText, Search, Eye 
} from 'lucide-react';

export default function Dashboard({ scanId, onNavigate }) {
    const [isLoading, setIsLoading] = useState(true);
    const [scanData, setScanData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);

    // 🔥 1. FETCH DATA (Auto Logic)
    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let targetId = scanId;
                const token = sessionStorage.getItem('auth_token');

                if (!token) {
                    setError("Unauthorized. Please Login.");
                    setIsLoading(false);
                    return;
                }

                // Agar ID nahi mili to Latest Scan dhoondo
                if (!targetId) {
                    const historyRes = await axios.get('http://127.0.0.1:8000/api/scans', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (historyRes.data.data && historyRes.data.data.length > 0) {
                        targetId = historyRes.data.data[0].scan_reference;
                    } else {
                        setScanData(null); 
                        setIsLoading(false);
                        return;
                    }
                }

                // Scan Details Fetch karo
                const response = await axios.get(`http://127.0.0.1:8000/api/scan/${targetId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    setScanData(response.data.data);
                } else {
                    setError("Could not retrieve scan data.");
                }

            } catch (err) {
                console.error("Dashboard Error:", err);
                setError("Failed to load report.");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [scanId]);

    const handleDownload = () => {
        if (scanData?.scan_reference) {
            const token = sessionStorage.getItem('auth_token');
            window.open(`http://127.0.0.1:8000/api/scan/${scanData.scan_reference}/download?token=${token}`, '_blank');
        }
    };

    // --- RENDER STATES ---
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-skin text-black">
            <div className="text-center">
                <Loader2 size={48} className="animate-spin mx-auto mb-4 text-black/50" />
                <h2 className="font-heading text-2xl animate-pulse">Generating Report...</h2>
            </div>
        </div>
    );

    if (!scanData && !error) return (
        <div className="pt-40 pb-20 px-4 flex flex-col items-center justify-center min-h-screen bg-skin text-center">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-white/50 max-w-lg">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6"><Search size={32} /></div>
                <h2 className="font-heading text-4xl mb-4">No Scans Found</h2>
                <p className="text-black/60 mb-8">Upload a project to see the analysis here.</p>
                <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition">Start New Scan</button>
            </div>
        </div>
    );

    if (error) return (
        <div className="pt-40 text-center min-h-screen bg-skin text-red-600">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 underline text-black">Retry</button>
        </div>
    );

    // 🔥 DATA CALCULATIONS
    const issues = scanData.results || [];
    const highSev = issues.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
    const medSev = issues.filter(i => i.severity === 'Medium').length;
    const lowSev = issues.filter(i => i.severity === 'Low' || i.severity === 'Info').length;
    const score = scanData.score || 0;

    let grade = 'F', gradeColor = 'text-red-500';
    if (score >= 90) { grade = 'A+'; gradeColor = 'text-green-500'; }
    else if (score >= 80) { grade = 'A'; gradeColor = 'text-green-600'; }
    else if (score >= 70) { grade = 'B'; gradeColor = 'text-blue-500'; }
    else if (score >= 50) { grade = 'C'; gradeColor = 'text-orange-500'; }

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-body text-black relative">
            
            {/* 1. HEADER */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${score > 75 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                            {scanData.status === 'completed' ? 'Analysis Complete' : 'Processing'}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-black/5 text-black/50 px-3 py-1 rounded-full border border-black/5">
                            {new Date(scanData.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h2 className="font-heading text-4xl md:text-5xl">Dashboard</h2>
                    <p className="text-black/60 mt-2 font-mono text-sm break-all">
                        Ref: <span className="text-black font-bold">{scanData.scan_reference}</span>
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {onNavigate && (
                        <button onClick={() => onNavigate('CodePatchSandbox')} className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg">
                            <Zap size={18} className="text-yellow-400 fill-yellow-400" /> AI Patch Sandbox
                        </button>
                    )}
                    <button onClick={handleDownload} className="bg-white border border-black/10 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </motion.div>

            {/* 2. STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Score Card */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black text-white p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between h-64 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div><h3 className="text-white/60 font-bold uppercase tracking-widest text-xs">Safety Score</h3><div className={`text-8xl font-heading mt-2 leading-none ${gradeColor}`}>{score}</div></div>
                    <div className="flex justify-between items-end"><div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-bold">Grade: {grade}</div><span className="text-xs text-white/40">/ 100</span></div>
                </motion.div>

                {/* Risk Breakdown */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white border border-white/50 p-8 rounded-[2rem] shadow-lg flex flex-col justify-center gap-5">
                    <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600"><ShieldAlert size={16}/></div><span className="font-bold">Critical</span></div><span className="text-xl font-heading text-red-600">{highSev}</span></div>
                    <div className="w-full h-px bg-black/5"></div>
                    <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><AlertTriangle size={16}/></div><span className="font-bold">Warnings</span></div><span className="text-xl font-heading text-orange-600">{medSev}</span></div>
                    <div className="w-full h-px bg-black/5"></div>
                    <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Bug size={16}/></div><span className="font-bold">Info</span></div><span className="text-xl font-heading text-blue-600">{lowSev}</span></div>
                </motion.div>

                {/* Info Card */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-skin/20 border border-skin p-8 rounded-[2rem] shadow-inner flex flex-col justify-center">
                    <h3 className="font-heading text-2xl mb-4 text-black">Target Info</h3>
                    <p className="text-sm text-black/60 mb-2">Input: <br/><span className="text-black font-bold break-all line-clamp-2">{scanData.target_value}</span></p>
                    <p className="text-sm text-black/60">Total Issues: <span className="text-black font-bold">{issues.length}</span></p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold border border-black/5 shadow-sm uppercase">{scanData.target_type}</span>
                        <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold border border-black/5 shadow-sm text-green-600">Active</span>
                    </div>
                </motion.div>
            </div>

            {/* 🔥 DETAILED FINDINGS SECTION (NOW SHOWS SNIPPETS) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/50">
                <h3 className="font-heading text-2xl mb-6 flex items-center gap-3">
                    <FileText className="text-black/30"/> Detailed Findings <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-body align-middle">{issues.length}</span>
                </h3>
                
                {issues.length === 0 ? (
                    <div className="text-center py-16 bg-green-50/50 rounded-2xl border border-green-100">
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-heading text-green-800">Clean Codebase!</h4>
                        <p className="text-green-600 max-w-md mx-auto mt-2">No security vulnerabilities or critical bugs were found in this scan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {issues.map((bug, index) => (
                            <div key={index} className="group p-6 rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-lg transition-all bg-gray-50/30 hover:bg-white flex flex-col items-start gap-4">
                                
                                <div className="flex justify-between w-full">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><Bug size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-lg">{bug.name}</h4>
                                            <p className="text-sm text-black/50 font-mono mt-1">{bug.location} {bug.line ? `: Line ${bug.line}` : ''}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedIssue(bug)} className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:scale-105 transition flex items-center gap-2">
                                        AI Fix <Zap size={16} className="text-yellow-400"/>
                                    </button>
                                </div>

                                {/* 🔥 CODE SNIPPET PREVIEW (If available) */}
                                {bug.snippet && (
                                    <div className="w-full bg-[#1e1e1e] p-4 rounded-xl border border-black/10 overflow-x-auto shadow-inner">
                                        <code className="text-xs font-mono text-gray-300 block whitespace-pre-wrap">
                                            {/* Highlight line in red */}
                                            {bug.snippet.trim()}
                                        </code>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* AI Fix Modal (Same as before) */}
            <AnimatePresence>
                {selectedIssue && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setSelectedIssue(null)}>
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/20" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-black text-white p-8 flex justify-between items-start">
                                <div><span className="text-xs font-bold text-yellow-400 tracking-widest uppercase mb-2 flex items-center gap-2"><Zap size={14} fill="currentColor"/> AI Intelligence</span><h3 className="font-heading text-3xl">{selectedIssue.name}</h3><p className="text-white/60 text-sm mt-1 font-mono">{selectedIssue.location} : Line {selectedIssue.line}</p></div>
                                <button onClick={() => setSelectedIssue(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X size={20} /></button>
                            </div>
                            <div className="p-8 max-h-[65vh] overflow-y-auto">
                                <div className="mb-8"><h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-black"><ShieldAlert size={20} className="text-red-600"/> Risk Analysis</h4><p className="text-black/70 text-base leading-relaxed">{selectedIssue.description || "Potential security risk detected."}</p></div>
                                <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-black/10 shadow-inner">
                                    <div className="flex items-center justify-between px-5 py-3 bg-[#252526] border-b border-white/5"><span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Code2 size={14}/> Suggested Patch</span><button className="text-gray-400 hover:text-white transition flex items-center gap-1 text-xs font-bold" onClick={() => navigator.clipboard.writeText(selectedIssue.fix_suggestion)}><Copy size={12} /> Copy</button></div>
                                    <div className="p-5 overflow-x-auto custom-scrollbar"><pre className="font-mono text-sm text-green-400 leading-relaxed whitespace-pre-wrap">{selectedIssue.fix_suggestion || "// No automated fix available."}</pre></div>
                                </div>
                                <button onClick={() => setSelectedIssue(null)} className="w-full mt-8 bg-gray-100 text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition text-lg">Close & Apply Fix</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}