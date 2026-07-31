import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode, CheckCircle2, AlertTriangle, Terminal, Code2, ShieldCheck, Database, Crown, Search, Loader2 } from 'lucide-react';

// --- LEFT: TREE NODE COMPONENT ---
const FileNode = ({ node, activeFile }) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!node) return null;
    const isActive = activeFile === node.path;

    if (node.type === 'folder') {
        return (
            <div className="pl-4 border-l border-white/10">
                <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 py-1 cursor-pointer hover:text-white text-white/60 select-none">
                    <Folder size={14} className="text-yellow-500 shrink-0" />
                    <span className="text-xs font-mono truncate">{node.name}</span>
                </div>
                {isOpen && node.children && node.children.map((child, i) => <FileNode key={i} node={child} activeFile={activeFile} />)}
            </div>
        );
    }
    return (
        <div className={`pl-4 flex items-center gap-2 py-1 transition-all duration-300 ${isActive ? 'bg-skin/20 text-skin font-bold border-l-2 border-skin' : 'text-white/40'}`}>
            <FileCode size={14} className="shrink-0" />
            <span className="text-xs font-mono truncate">{node.name}</span>
            {isActive && <div className="w-1.5 h-1.5 bg-skin rounded-full ml-auto animate-pulse" />}
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function ScanningProcess({ onComplete, onOpenPricing, scanId, fileTree = [], flatList = [], tables = [] }) {
    // UI States
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    
    // Animation Logic States
    const [fileIndex, setFileIndex] = useState(0);
    const [currentLine, setCurrentLine] = useState(0); // Kaunsi line print ho rahi hai
    const [isPaused, setIsPaused] = useState(false);   // Error aane par rukna
    
    // Refs
    const logsEndRef = useRef(null);
    const codeContainerRef = useRef(null);

    // 🔥 PREPARE DATA (Simulation Fallback if empty)
    const safeFlatList = (Array.isArray(flatList) && flatList.length > 0) 
        ? flatList 
        : [{ path: 'System', content: '// Connecting to Analysis Engine...\n// Loading Modules...\n// Verifying Files...' }];

    // Current Active Data
    const activeFile = safeFlatList[fileIndex] || safeFlatList[0];
    const codeContent = typeof activeFile.content === 'string' ? activeFile.content : "// Scanning binary content...";
    const codeLines = codeContent.split('\n');
    const activeIssues = Array.isArray(activeFile.issues) ? activeFile.issues : [];

    // 🚀 MAIN LOOP: TYPEWRITER EFFECT
    useEffect(() => {
        // Agar list khali hai to 4 sec baad khatam karo
        if (!flatList || flatList.length === 0) {
            const t = setTimeout(onComplete, 4000);
            return () => clearTimeout(t);
        }

        if (isPaused) return;

        // Speed calculation: Badi file to tez, choti to slow
        const speed = codeLines.length > 300 ? 5 : 30;

        const scanInterval = setInterval(() => {
            
            // 1. Bug Detection (Current Line + 1)
            const issueOnLine = activeIssues.find(i => i.line === currentLine + 1);

            if (issueOnLine) {
                // 🛑 FOUND BUG: Pause & Log
                setIsPaused(true);
                setLogs(prev => [...prev, { type: 'error', text: `CRITICAL: ${issueOnLine.name} in ${activeFile.path}`, time: new Date().toLocaleTimeString() }]);
                
                // 2.5 seconds pause for effect
                setTimeout(() => { 
                    setIsPaused(false); 
                    setCurrentLine(prev => prev + 1); 
                }, 2500);
                return;
            }

            // 2. Move Laser Line Down (Printing Effect)
            if (currentLine < codeLines.length - 1) {
                setCurrentLine(prev => prev + 1);
                
                // Auto Scroll
                if (codeContainerRef.current) {
                    codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
                }
            } 
            // 3. End of File -> Next File
            else {
                if (fileIndex < safeFlatList.length - 1) {
                    // Log Success
                    setLogs(prev => [...prev, { type: 'success', text: `Verified: ${activeFile.path}`, time: new Date().toLocaleTimeString() }]);
                    
                    setFileIndex(prev => prev + 1);
                    setCurrentLine(0);
                    
                    // Update Progress
                    setProgress(Math.round(((fileIndex + 1) / safeFlatList.length) * 100));
                } else {
                    // 4. All Files Done -> Finish
                    clearInterval(scanInterval);
                    setLogs(prev => [...prev, { type: 'info', text: `Analysis Complete. Generating Report...`, time: new Date().toLocaleTimeString() }]);
                    setProgress(100);
                    setTimeout(onComplete, 1500);
                }
            }
        }, speed); 

        return () => clearInterval(scanInterval);
    }, [currentLine, fileIndex, isPaused, flatList]); // Dependencies

    // Auto Scroll Logs
    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

    return (
        <div className="h-screen bg-black text-white font-mono flex flex-col p-4 overflow-hidden relative">
            
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-skin/20 blur-lg rounded-full animate-pulse"></div>
                        <ShieldCheck size={32} className="text-skin relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-[0.2em] text-white">SYSTEM SCAN</h2>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">ID: <span className="text-skin">{scanId}</span></p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={onOpenPricing} className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-yellow-600/30 transition animate-pulse">
                        <Crown size={14} /> BOOST SPEED
                    </button>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-skin">{progress}%</div>
                        <div className="text-[10px] text-white/30 tracking-widest">COMPLETED</div>
                    </div>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden z-10 pb-4">
                
                {/* 1. LEFT: TREE */}
                <div className="w-full lg:w-1/4 bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-lg">
                    <div className="p-3 border-b border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-wider bg-[#111] flex items-center gap-2">
                        <Search size={12} /> Explorer
                    </div>
                    <div className="p-3 overflow-y-auto custom-scrollbar flex-grow">
                        {Array.isArray(fileTree) && fileTree.length > 0 ? (
                            fileTree.map((node, i) => <FileNode key={i} node={node} activeFile={activeFile.path} />)
                        ) : (
                            <div className="text-white/20 text-xs italic p-4 text-center">Loading tree...</div>
                        )}
                    </div>
                </div>

                {/* 2. CENTER: CODE VIEWER (Typing Effect) */}
                <div className="w-full lg:w-2/4 bg-[#080808] border border-white/10 rounded-xl flex flex-col relative overflow-hidden shadow-2xl">
                    
                    {/* Top Bar */}
                    <div className="bg-[#151515] px-4 py-2 text-xs text-white/50 flex justify-between border-b border-white/5 shrink-0 font-mono">
                        <span className="flex items-center gap-2 truncate max-w-[300px]">
                            <FileCode size={14}/> {activeFile.path}
                        </span>
                        <span className={`font-bold flex items-center gap-2 ${isPaused ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {isPaused ? <><AlertTriangle size={12}/> THREAT DETECTED</> : '● SCANNING'}
                        </span>
                    </div>

                    {/* 🔥 Code Rendering Area */}
                    <div ref={codeContainerRef} className="p-4 overflow-y-auto flex-grow font-mono text-xs md:text-sm leading-7 relative custom-scrollbar bg-opacity-50">
                        {/* 
                            LOGIC: Slice use karke sirf wahi lines dikha rahe hain jo scan ho chuki hain.
                            Isse wo "Type" hota hua dikhta hai.
                        */}
                        {codeLines.slice(0, currentLine + 1).map((line, idx) => {
                            const isErrorLine = activeIssues.find(i => i.line === idx + 1);
                            
                            return (
                                <div key={idx} className={`relative pl-8 pr-2 flex transition-colors duration-100 ${isErrorLine ? 'bg-red-900/20' : ''}`}>
                                    {/* Line Number */}
                                    <span className="absolute left-0 text-white/20 select-none w-6 text-right text-[10px] pt-1">{idx + 1}</span>
                                    
                                    {/* Code Content */}
                                    <span className={`${isErrorLine ? 'text-red-400 font-bold' : 'text-gray-500'} whitespace-pre-wrap break-all`}>
                                        {line}
                                    </span>

                                    {/* 🔥 Error Popup Inline */}
                                    {isErrorLine && (
                                        <div className="ml-auto shrink-0 flex items-center gap-1 text-[10px] text-red-500 font-bold bg-black/50 px-2 rounded border border-red-500/30">
                                            <AlertTriangle size={10} /> {isErrorLine.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* Cursor Blinker */}
                        <div className="h-4 w-2 bg-skin animate-blink ml-8 mt-1"></div>
                    </div>
                </div>

                {/* 3. RIGHT: DB & LOGS */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-hidden h-full">
                    <div className="h-1/3 bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-white/5 text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 bg-[#111]">
                            <Database size={12}/> DB Schema
                        </div>
                        <div className="p-3 overflow-y-auto custom-scrollbar flex-grow space-y-2">
                            {Array.isArray(tables) && tables.length > 0 ? tables.map((t, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white/60 font-mono">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> {t}
                                </div>
                            )) : <div className="text-white/20 text-xs italic p-2">No tables found.</div>}
                        </div>
                    </div>
                    <div className="h-2/3 bg-black border border-white/10 rounded-xl flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-white/5 text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-2 bg-[#111]">
                            <Terminal size={12}/> Engine Logs
                        </div>
                        <div className="p-3 overflow-y-auto custom-scrollbar flex-grow space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className="text-[10px] font-mono break-all border-l-2 pl-2 border-white/5 opacity-80">
                                    <span className="text-white/30 block mb-0.5 text-[9px]">{log.time}</span>
                                    <span className={log.type === 'error' ? 'text-red-400' : 'text-white/70'}>{log.text}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}