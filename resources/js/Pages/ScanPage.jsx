import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
    Upload, Globe, Settings, Zap, ShieldCheck, Play, 
    FileCode, Database, Layers, Server, Layout, HardDrive, CheckCircle2, Loader2, X, Sparkles, AlertOctagon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanPage({ onRunScan }) {
    // UI States
    const [inputType, setInputType] = useState('zip');
    const [scanScope, setScanScope] = useState('fullstack');
    const [scanMode, setScanMode] = useState('auto');
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [enableAIFix, setEnableAIFix] = useState(false);

    // Refs
    const fileInputRef = useRef(null);
    const dbInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDB, setSelectedDB] = useState(null);
    const [urlInput, setUrlInput] = useState('');

    // Checkbox Data
    const [manualChecks, setManualChecks] = useState({
        sqlInjection: true, xssAttack: true, csrfProtection: true, authBypass: true,
        bufferOverflow: false, insecureStorage: true, hardcodedSecrets: true, ssrfCheck: false,
        unitTest: false, e2eTest: false, regressionTest: false,
        staticAnalysis: true, deadCodeDetection: false, memoryLeakCheck: false, logicErrorFinder: true,
        weakPasswords: true, brokenLinks: false, aiFixSuggestions: true
    });

    const toggleCheck = (key) => setManualChecks(prev => ({ ...prev, [key]: !prev[key] }));
    const handleFileChange = (e) => { if(e.target.files[0]) { setSelectedFile(e.target.files[0]); setErrorMessage(''); setStatus('idle'); } };
    const handleDBChange = (e) => { if(e.target.files[0]) setSelectedDB(e.target.files[0]); };
    const handleFileClick = () => fileInputRef.current.click();
    const removeFile = (e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; };

    // 🚀 MAIN FUNCTION
    const handleStartScan = async (e) => {
        if(e) e.preventDefault(); // Stop Reload
        setErrorMessage('');
        
        // 1. Check Auth
        const token = sessionStorage.getItem('auth_token');
        if (!token) { setErrorMessage("Session Expired. Please Login."); return; }

        // 2. Validate Inputs
        if (inputType === 'zip' && !selectedFile) { setErrorMessage('Please upload a ZIP file.'); return; }
        if (inputType === 'url' && !urlInput) { setErrorMessage('Please enter a valid URL.'); return; }

        setStatus('uploading');

        // 3. Prepare FormData
        const formData = new FormData();
        formData.append('inputType', inputType);
        formData.append('scanScope', scanScope);
        formData.append('scanMode', scanMode);
        formData.append('enableAIFix', enableAIFix ? '1' : '0');
        formData.append('manualChecks', JSON.stringify(manualChecks));

        if (inputType === 'zip') {
            formData.append('file', selectedFile);
            if(selectedDB) formData.append('dbFile', selectedDB);
        } else {
            formData.append('url', urlInput);
        }

        try {
            // 4. API Call
            const response = await axios.post('http://127.0.0.1:8000/api/scan/initiate', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data', 
                    'Accept': 'application/json' 
                }
            });

            console.log("Upload Success, Response:", response.data);
            setStatus('success');
            
            // 5. 🔥 PASS DATA TO HOME COMPONENT
            setTimeout(() => {
                if(onRunScan) {
                    onRunScan(
                        response.data.scan_id, 
                        response.data.results || [],    // Bugs List
                        response.data.flat_list || [], // 🔥 Code Content (Critical for Animation)
                        response.data.file_tree || [], // Folder Structure
                        response.data.tables || []     // DB Tables
                    );
                } else {
                    console.error("onRunScan prop is missing!");
                }
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            
            if (error.response?.status === 413) {
                setErrorMessage("File too large. Check PHP settings.");
            } else if (error.response?.status === 401) {
                setErrorMessage("Unauthenticated. Login required.");
            } else {
                const msg = error.response?.data?.message || error.message || "Upload Failed";
                setErrorMessage(msg);
            }
        }
    };

    // Components
    const ScopeCard = ({ id, label, icon: Icon, desc }) => (
        <div onClick={() => setScanScope(id)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 ${scanScope === id ? 'border-black bg-black text-white shadow-lg scale-105' : 'border-black/5 bg-white hover:border-black/20 text-black'}`}>
            <Icon size={24} className={scanScope === id ? 'text-skin' : 'text-black/60'} />
            <div><div className="font-bold text-sm">{label}</div><div className={`text-[10px] ${scanScope === id ? 'text-white/60' : 'text-black/40'}`}>{desc}</div></div>
        </div>
    );

    const CheckboxGroup = ({ title, icon: Icon, options }) => (
        <div className="mb-5 p-4 bg-gray-50/50 rounded-2xl border border-black/5">
            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/50 mb-3 flex items-center gap-2"><Icon size={14} className="text-black"/> {title}</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {options.map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 p-3 rounded-xl border border-white bg-white hover:border-black/10 hover:shadow-md cursor-pointer transition-all group min-h-[60px]">
                        <div onClick={() => toggleCheck(opt.key)} className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center transition-all border ${manualChecks[opt.key] ? 'bg-black border-black text-white' : 'border-black/20 group-hover:border-black/50'}`}>
                            {manualChecks[opt.key] && <CheckCircle2 size={14} />}
                        </div>
                        <span className="text-sm font-bold text-black/80 leading-tight">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-body">
            
            <form onSubmit={(e) => e.preventDefault()}>
                
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest uppercase bg-black/5 px-3 py-1 rounded-full border border-black/10">Configuration</span>
                    <h2 className="font-heading text-4xl md:text-5xl mt-3 mb-2">Target Configuration</h2>
                    <p className="text-black/50">Select target type, scope, and optional manual parameters.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT: INPUTS */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <ScopeCard id="frontend" label="Frontend" icon={Layout} desc="JS, CSS, HTML" />
                            <ScopeCard id="backend" label="Backend" icon={Server} desc="PHP, Node, SQL" />
                            <ScopeCard id="fullstack" label="Fullstack" icon={Layers} desc="Complete Analysis" />
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-black/15 text-center min-h-[350px] flex flex-col items-center justify-center shadow-lg hover:border-black/30 transition-all duration-300">
                            {inputType === 'zip' ? (
                                selectedFile ? (
                                    <div className="text-green-700 font-bold flex flex-col items-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                                            <CheckCircle2 size={32} className="text-green-600"/>
                                        </div>
                                        <span className="text-xl font-heading text-black">{selectedFile.name}</span>
                                        <div className="text-sm text-black/40 mt-1">{(selectedFile.size / (1024*1024)).toFixed(2)} MB</div>
                                        <button onClick={removeFile} className="text-xs text-red-500 mt-6 underline font-bold hover:text-red-600 transition">Remove File</button>
                                    </div>
                                ) : (
                                    <div onClick={handleFileClick} className="cursor-pointer group">
                                        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 group-hover:scale-110 transition duration-300">
                                            <Upload size={28} className="text-black/60 group-hover:text-black transition"/>
                                        </div>
                                        <h3 className="font-bold text-xl mb-1 text-black">Upload Project ZIP</h3>
                                        <p className="text-sm text-black/40">Drag and drop or browse files (Max 100MB)</p>
                                    </div>
                                )
                            ) : (
                                <div className="w-full max-w-lg">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                            <Globe size={28} className="text-blue-600 animate-pulse"/>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl mb-4 text-black">Enter Target URL</h3>
                                    <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com" className="w-full p-4 bg-gray-50 rounded-2xl text-center outline-none border border-black/5 focus:border-black focus:bg-white transition shadow-inner font-mono text-sm"/>
                                </div>
                            )}
                            <div className="mt-8 flex bg-gray-100 p-1.5 rounded-xl border border-black/5">
                                <button onClick={() => setInputType('zip')} className={`p-2 px-6 rounded-lg text-xs font-bold transition ${inputType === 'zip' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'}`}>ZIP Upload</button>
                                <button onClick={() => setInputType('url')} className={`p-2 px-6 rounded-lg text-xs font-bold transition ${inputType === 'url' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'}`}>Live URL</button>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".zip,.rar,.tar,.gz" />
                        </div>

                        {inputType === 'zip' && (
                            <div className="bg-white p-5 rounded-3xl border border-black/5 flex justify-between items-center shadow-md hover:shadow-lg transition">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100">
                                        <Database size={22}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-black">Database File (Optional)</p>
                                        <p className="text-xs text-black/40">{selectedDB ? selectedDB.name : 'Include .sql file for schema analysis'}</p>
                                    </div>
                                </div>
                                <button onClick={() => dbInputRef.current.click()} className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-xl hover:scale-105 transition shadow-sm">
                                    {selectedDB ? 'Change' : 'Upload SQL'}
                                </button>
                                <input type="file" ref={dbInputRef} onChange={handleDBChange} className="hidden" accept=".sql" />
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                                <AlertOctagon size={18}/> {errorMessage}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SETTINGS */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-black/5 min-h-[500px] h-auto flex flex-col lg:sticky lg:top-32">
                            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-3">
                                <h3 className="font-heading text-xl text-black">Scan Options</h3>
                                <Settings className="text-black/40" size={20}/>
                            </div>
                            
                            <div className="flex flex-col gap-2 mb-4 shrink-0">
                                <button type="button" onClick={() => setScanMode('auto')} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all text-left ${scanMode === 'auto' ? 'border-black bg-black text-white shadow-md' : 'border-black/5 hover:bg-gray-50'}`}>
                                    <Zap size={22} className={scanMode === 'auto' ? 'text-skin' : 'text-black'} />
                                    <div>
                                        <div className="font-bold text-sm">Auto Pilot (AI)</div>
                                        <div className={`text-[10px] ${scanMode === 'auto' ? 'text-white/60' : 'text-black/40'}`}>Full Automated Analysis</div>
                                    </div>
                                </button>
                                <button type="button" onClick={() => setScanMode('manual')} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all text-left ${scanMode === 'manual' ? 'border-black bg-black text-white shadow-md' : 'border-black/5 hover:bg-gray-50'}`}>
                                    <Settings size={22} className={scanMode === 'manual' ? 'text-skin' : 'text-black'} />
                                    <div>
                                        <div className="font-bold text-sm">Manual Mode</div>
                                        <div className={`text-[10px] ${scanMode === 'manual' ? 'text-white/60' : 'text-black/40'}`}>Customize Scanning Modules</div>
                                    </div>
                                </button>
                            </div>

                            <AnimatePresence>
                                {scanMode === 'manual' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent flex-grow max-h-[250px]">
                                        <CheckboxGroup title="Security" icon={ShieldCheck} options={[{key:'sqlInjection',label:'SQL Injection'}, {key:'xssAttack',label:'XSS Check'}, {key:'authBypass',label:'Auth Bypass'}]} />
                                        <CheckboxGroup title="Code Quality" icon={FileCode} options={[{key:'staticAnalysis',label:'Static Analysis'}, {key:'deadCodeDetection',label:'Dead Code'}, {key:'memoryLeakCheck',label:'Memory Leaks'}]} />
                                        <CheckboxGroup title="Database" icon={Database} options={[{key:'weakPasswords',label:'Weak Passwords'}, {key:'aiFixSuggestions',label:'AI Fixes'}]} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-4 mt-auto border-t border-black/5 space-y-4">
                                <div onClick={() => setEnableAIFix(!enableAIFix)} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${enableAIFix ? 'bg-skin/30 border-black' : 'bg-gray-50 border-transparent'}`}>
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className={enableAIFix ? 'text-yellow-600 fill-yellow-600' : 'text-black/50'}/>
                                        <span className="text-xs font-bold text-black">Auto-Fix with AI</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition ${enableAIFix ? 'bg-black' : 'bg-gray-300'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${enableAIFix ? 'translate-x-4' : ''}`}/>
                                    </div>
                                </div>
                                
                                <button 
                                    type="button" 
                                    onClick={handleStartScan} 
                                    disabled={status === 'uploading' || status === 'success'} 
                                    className={`w-full py-4 rounded-2xl font-bold flex justify-center gap-2 hover:scale-[1.01] transition shadow-md ${status === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-black text-white hover:bg-gray-900'} ${status === 'uploading' ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {status === 'uploading' && <Loader2 size={20} className="animate-spin" />}
                                    {status === 'success' && <CheckCircle2 size={20} />}
                                    {status === 'idle' || status === 'error' ? (
                                        <> <Play size={18} fill="currentColor" /> {scanMode === 'auto' ? 'Start AI Scan' : 'Run Custom Scan'} </>
                                    ) : status === 'uploading' ? 'Analyzing...' : 'Success!'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}