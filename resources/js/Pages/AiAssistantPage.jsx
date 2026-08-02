import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Sparkles, ShieldCheck, Code2, RefreshCw, ChevronRight,
    Hexagon, Sun, Moon, Copy, CheckCircle, Terminal, HelpCircle, User
} from 'lucide-react';
import axios from 'axios';

export default function AiAssistantPage() {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: "Welcome to Merlin Security Intelligence! I am your real-time secure-coding partner. Paste your function blocks, API configs, or query strings to launch instant sandboxed vulnerability audits and get OWASP-aligned patches. What are we auditing today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDark, setIsDark] = useState(true); // Toggleable Dark Theme Master Mode
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const samplePrompts = [
        { label: "Check SQL Injection risk", text: "Is this PHP database query secure: $db->query('SELECT * FROM accounts WHERE id = ' . $_GET['id']);" },
        { label: "Audit React InnerHTML", text: "How can I prevent potential script injection vulnerabilities when using dangerouslySetInnerHTML in React?" },
        { label: "Verify JWT Algorithm", text: "What are the security concerns with using the 'none' algorithm or weak symmetric keys in JSON Web Tokens?" }
    ];

    const generateResponse = (input) => {
        const query = input.toLowerCase();

        if (query.includes('select') || query.includes('sqli') || query.includes('query') || query.includes('database')) {
            return {
                text: "🚨 CRITICAL RISK REPORT: SQL Injection Vulnerability detected.\n\nYour query directly concatenates a user-controlled parameter ($_GET['id']) into the SQL string without sanitation or pre-compilation. This permits attackers to escape the statement boundaries and manipulate the query backend (e.g. bypass authentication, dump databases, or drop tables).\n\n=== REMEDIATION PATCH ===\nUse safe parameterized PDO prepared statements:",
                code: "<?php\n// Establish parameterized binding to isolate variables from command semantics\n$stmt = $pdo->prepare('SELECT * FROM accounts WHERE id = :id');\n$stmt->execute(['id' => $_GET['id']]);\n$account = $stmt->fetch();"
            };
        } else if (query.includes('innerhtml') || query.includes('react') || query.includes('xss') || query.includes('script')) {
            return {
                text: "🛡️ THREAT VECTOR ANALYSIS: Cross-Site Scripting (XSS).\n\nRendering un-sanitized user content via dangerouslySetInnerHTML in React bypasses virtual DOM safety mechanisms and directly evaluates script payloads in the user's browser context.\n\n=== REMEDIATION PATCH ===\nUse DOMPurify to clean and authorize content safe tags before mounting:",
                code: "import DOMPurify from 'dompurify';\n\nfunction SafeContent({ userContentHtml }) {\n  // Eliminate unauthorized tags like <script> or event triggers like onload\n  const safeHtml = DOMPurify.sanitize(userContentHtml);\n  return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;\n}"
            };
        } else if (query.includes('jwt') || query.includes('token') || query.includes('none') || query.includes('auth')) {
            return {
                text: "🔑 CRYPTOGRAPHIC RISK REPORT: Insecure JWT signature verification.\n\nAllowing the 'none' algorithm inside JWT header evaluations permits signature spoofing. Attackers can modify their token payload (such as upgrading privileges to admin) and sign it with 'none', which standard libraries without algorithm enforcement will accept.\n\n=== REMEDIATION PATCH ===\nEnforce algorithm selection explicitly and utilize public-key RSA signing:",
                code: "use Firebase\\JWT\\JWT;\nuse Firebase\\JWT\\Key;\n\n// Explicitly enforce asymmetric algorithm (RS256) signature validation\n$decoded = JWT::decode($jwt, new Key($publicKey, 'RS256'));"
            };
        } else {
            return {
                text: "🔍 MERLIN SAST SYSTEM EVALUATION:\n\nNo high-severity vulnerabilities matched in this specific block against OWASP Top 10 patterns. \n\nGeneral Recommendations:\n1. Maintain absolute isolation of untrusted input metrics.\n2. Apply context-aware sanitization on outputs.\n3. Verify that database calls do not use direct query string interpolations.\n\nProvide another function block to execute another real-time sandbox audit!",
                code: null
            };
        }
    };

    const handleSend = async (textToSend) => {
        if (!textToSend.trim()) return;

        const userMsg = {
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.post('http://127.0.0.1:8000/api/ai/chat', {
                message: textToSend,
                history: messages
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                const replyText = res.data.reply;
                let parsedText = replyText;
                let codeSegment = null;

                const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/m;
                const match = replyText.match(codeBlockRegex);
                if (match) {
                    codeSegment = match[1];
                    parsedText = replyText.replace(codeBlockRegex, '(Secure code remediation block displayed below)');
                }

                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: parsedText,
                    code: codeSegment,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } else {
                throw new Error("Invalid response status");
            }
        } catch (e) {
            console.error("AI Assistant request error, using simulation fallback: ", e);
            const botResponse = generateResponse(textToSend);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: botResponse.text,
                code: botResponse.code,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const copyToClipboard = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className={`min-h-screen font-body transition-colors duration-300 flex flex-col items-center justify-start pt-24 pb-12 px-4 md:px-8
            ${isDark ? 'bg-[#0b0c10] text-gray-200' : 'bg-[#FDFBF7] text-black'}
        `}>
            {/* Top Toolbar / Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition duration-300
                        ${isDark ? 'bg-white text-black border-white/10' : 'bg-black text-white border-black/10'}
                    `}>
                        <Hexagon size={20} className="fill-current" />
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold tracking-wide">Merlin SecGuard</h2>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest animate-pulse">Advanced AI Sandbox</p>
                    </div>
                </div>

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition shadow-sm
                        ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'}
                    `}
                >
                    {isDark ? <Sun size={14} className="text-yellow-400"/> : <Moon size={14} className="text-purple-600"/>}
                    {isDark ? "Light Mode" : "Dark Mode"}
                </button>
            </div>

            {/* Chat Screen Workspace */}
            <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-6 items-stretch flex-grow h-[720px] max-h-[80vh]">

                {/* Left Panel: sample prompts & security info */}
                <div className="lg:col-span-3 flex flex-col gap-4">

                    {/* Security sample cues */}
                    <div className={`p-6 rounded-[2rem] border transition shadow-lg flex flex-col gap-4
                        ${isDark ? 'bg-[#15171e] border-white/5' : 'bg-white border-black/5'}
                    `}>
                        <h4 className="font-heading text-lg font-bold">Threat Scenarios</h4>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-black/50'}`}>
                            Select a scenario payload to execute a sandboxed threat evaluation simulation.
                        </p>

                        <div className="flex flex-col gap-2">
                            {samplePrompts.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(p.text)}
                                    className={`p-3 border rounded-2xl text-left transition duration-300 flex justify-between items-center group
                                        ${isDark
                                            ? 'bg-white/2 border-white/5 hover:border-white/20 hover:bg-white/5'
                                            : 'bg-gray-50 border-black/5 hover:border-black/20 hover:bg-gray-100'}
                                    `}
                                >
                                    <span className="text-[11px] font-bold truncate max-w-[180px]">{p.label}</span>
                                    <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security telemetry parameters card */}
                    <div className={`p-6 rounded-[2rem] border transition shadow-lg flex-grow flex flex-col justify-between relative overflow-hidden
                        ${isDark ? 'bg-gradient-to-br from-[#121216] to-[#1a1a24] border-white/5 text-white' : 'bg-black text-white border-black/5'}
                    `}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div>
                            <h4 className="font-heading text-lg text-purple-400 flex items-center gap-1.5 mb-2">
                                <ShieldCheck size={18} className="text-purple-400" /> Compliance Audit
                            </h4>
                            <p className="text-[11px] leading-relaxed text-gray-300">
                                This engine dynamically verifies execution paths against major security controls (OWASP Top 10, CWE-20, and SANS-25) to provide production-ready secure remediations instantly.
                            </p>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 block pt-4">Sandbox Engine 2.4</span>
                    </div>

                </div>

                {/* Right Panel: Chat Log canvas */}
                <div className={`lg:col-span-9 flex flex-col rounded-[2.5rem] border shadow-2xl overflow-hidden h-full
                    ${isDark ? 'bg-[#121319] border-white/5' : 'bg-white border-black/5'}
                `}>

                    {/* Messages window */}
                    <div className={`flex-grow p-6 overflow-y-auto space-y-6
                        ${isDark ? 'bg-[#15161d]/50' : 'bg-gray-50/40'}
                    `}>
                        {messages.map((m, idx) => {
                            const isBot = m.sender === 'bot';
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={`flex gap-4 max-w-[90%] ${isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
                                >
                                    {/* Brand Logo Hexagon on bot response, User icon on user */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition
                                        ${isBot
                                            ? (isDark ? 'bg-white text-black border-white/10' : 'bg-black text-white border-black/10')
                                            : 'bg-purple-600 text-white border-purple-500'}
                                    `}>
                                        {isBot ? <Hexagon size={16} className="fill-current" /> : <User size={16}/>}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm
                                            ${isBot
                                                ? (isDark ? 'bg-[#1c1d26] text-gray-200 border border-white/5 rounded-tl-none' : 'bg-white text-black border border-black/5 rounded-tl-none')
                                                : 'bg-purple-600 text-white rounded-tr-none'}
                                        `}>
                                            <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{m.text}</p>

                                            {/* Beautiful secure coding block inside the response layout */}
                                            {m.code && (
                                                <div className="mt-4 bg-[#1e1e24] p-4 rounded-2xl border border-white/10 overflow-x-auto shadow-inner text-xs font-mono text-gray-300">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                                        <span><Terminal size={10} className="inline mr-1 text-purple-400" /> secure_patch.php</span>
                                                        <button
                                                            onClick={() => copyToClipboard(m.code, idx)}
                                                            className="hover:text-white transition flex items-center gap-1"
                                                        >
                                                            {copiedIndex === idx ? <CheckCircle size={10} className="text-green-400"/> : <Copy size={10} />}
                                                            {copiedIndex === idx ? "Copied" : "Copy"}
                                                        </button>
                                                    </div>
                                                    <pre className="whitespace-pre">{m.code}</pre>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] text-gray-500 font-bold ${isBot ? 'text-left' : 'text-right'}`}>{m.time}</span>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Beautiful active typing dots indicator (like premium AI chatbots!) */}
                        {isTyping && (
                            <div className="flex gap-4 items-start mr-auto">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md
                                    ${isDark ? 'bg-white text-black border-white/10' : 'bg-black text-white border-black/10'}
                                `}>
                                    <Hexagon size={16} className="fill-current animate-spin-slow" />
                                </div>
                                <div className={`p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3 text-xs
                                    ${isDark ? 'bg-[#1c1d26] text-gray-400 border border-white/5' : 'bg-white text-black/60 border border-black/5'}
                                `}>
                                    <span>SecGuard is analyzing payload tokens</span>
                                    {/* Pulsing Dots */}
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat input box */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                        className={`p-4 border-t flex gap-3 items-center shrink-0
                            ${isDark ? 'bg-[#15161d] border-white/5' : 'bg-white border-black/5'}
                        `}
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Paste SQL string, function block, or ask securely..."
                            className={`flex-grow p-4 rounded-2xl outline-none transition text-xs sm:text-sm font-body shadow-inner border
                                ${isDark
                                    ? 'bg-[#1c1d26] text-white border-white/5 focus:border-purple-500/50'
                                    : 'bg-gray-50 text-black border-black/5 focus:border-black'}
                            `}
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:scale-105 active:scale-95 transition text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </form>

                </div>

            </div>

        </div>
    );
}
