import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertTriangle, ShieldCheck, Code2, RefreshCw, ChevronRight } from 'lucide-react';

export default function AiAssistantPage() {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: "Hello! I am Merlin's AI Security Guard. You can paste your code snippets, ask about vulnerabilities (SQLi, XSS, SSRF), or request mitigation steps. What can I analyze for you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const samplePrompts = [
        { label: "Analyze SQLi risk", text: "Is this query safe: $query = 'SELECT * FROM users WHERE email = ' . $email;" },
        { label: "Prevent React XSS", text: "How do I secure user input rendered inside React components from XSS?" },
        { label: "Audit JWT config", text: "What is the recommended signature verification practice for HS256 JWT tokens?" }
    ];

    const generateResponse = (input) => {
        const query = input.toLowerCase();

        if (query.includes('select') || query.includes('sqli') || query.includes('query')) {
            return {
                text: "⚠️ VULNERABILITY DETECTED: potential SQL Injection.\n\nYour query directly concatenates a user input variable ($email) into the SQL string. Attackers can escape the string literal and inject malicious statements.\n\n=== REFACTOR SUGGESTION ===\nUse prepared parameter binding with PDO:",
                code: "<?php\n$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');\n$stmt->execute(['email' => $email]);\n$user = $stmt->fetch();"
            };
        } else if (query.includes('xss') || query.includes('react') || query.includes('input')) {
            return {
                text: "🛡️ XSS PREVENTION PATH:\n\nIn React, rendering user-controlled strings using `{dangerouslySetInnerHTML}` bypasses standard sanitization and is highly vulnerable to Cross-Site Scripting (XSS).\n\n=== SECURE IMPLEMENTATION ===\nUse DOMPurify to sanitize HTML content before rendering:",
                code: "import DOMPurify from 'dompurify';\n\nfunction SafeContent({ userMarkup }) {\n  const cleanHTML = DOMPurify.sanitize(userMarkup);\n  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;\n}"
            };
        } else if (query.includes('jwt') || query.includes('token') || query.includes('auth')) {
            return {
                text: "🔑 JWT CRYPTO RECOMMENDATION:\n\nWhen using HS256, verify that secret keys are high-entropy (min 256 bits). If possible, upgrade to RS256 (asymmetric keypairs) so public keys can be distributed safely without risk of key theft.\n\n=== SECURE PHP JWT VERIFICATION ===",
                code: "use Firebase\\JWT\\JWT;\nuse Firebase\\JWT\\Key;\n\n$decoded = JWT::decode($jwt, new Key($privateKey, 'RS256'));"
            };
        } else {
            return {
                text: "🔍 MERLIN SECURITY CORE FEEDBACK:\n\nI have evaluated your request against OWASP top 10 security standards. The logic is clean. Keep variable assignments isolated, configure security headers (CSP, HSTS), and ensure database calls utilize parameterized binding.\n\nNeed further code auditing or configuration recommendations? Paste another snippet!",
                code: null
            };
        }
    };

    const handleSend = (textToSend) => {
        if (!textToSend.trim()) return;

        const userMsg = {
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate thinking delay for organic premium feel
        setTimeout(() => {
            const botResponse = generateResponse(textToSend);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: botResponse.text,
                code: botResponse.code,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black flex flex-col">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 shrink-0">
                <span className="inline-flex items-center gap-1.5 py-1 px-4 bg-purple-50 text-purple-800 rounded-full text-xs font-bold border border-purple-200 shadow-sm">
                    <Sparkles size={12} className="fill-purple-800 animate-pulse"/> Try Merlin AI
                </span>
                <h2 className="font-heading text-4xl md:text-5xl mt-3 mb-2">AI Security Assistant</h2>
                <p className="text-black/60 max-w-lg mx-auto text-sm">
                    Deploy real-time threat scanning audits, secure code mitigation patches, and compliance feedback instantly.
                </p>
            </motion.div>

            {/* Chat Layout Container */}
            <div className="grid lg:grid-cols-4 gap-6 flex-grow items-stretch">

                {/* Left side: Guide / Sample prompts */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-black/5 flex flex-col gap-4">
                        <h4 className="font-heading text-lg text-black">Quick Queries</h4>
                        <p className="text-xs text-black/50 leading-relaxed">
                            Click any pre-configured payload below to execute an automated security audit simulation.
                        </p>

                        <div className="flex flex-col gap-2">
                            {samplePrompts.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(p.text)}
                                    className="p-3 bg-gray-50 border border-black/5 rounded-2xl text-left hover:border-black/20 hover:bg-gray-100 transition duration-300 group flex justify-between items-center"
                                >
                                    <span className="text-xs font-bold text-black/80">{p.label}</span>
                                    <ChevronRight size={14} className="text-black/30 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black text-white p-6 rounded-[2rem] shadow-lg border border-gray-800 flex-grow hidden lg:flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div>
                            <h4 className="font-heading text-lg text-skin mb-2 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-skin"/> OWASP Core
                            </h4>
                            <p className="text-[11px] text-white/70 leading-relaxed">
                                Our AI system validates syntax formatting, parameterized SQL database security, session handling encryption, and input sanitization to adhere strictly to the OWASP Top 10 standards.
                            </p>
                        </div>
                        <div className="text-[10px] text-white/40 pt-4">Secure Sandbox v2.0</div>
                    </div>
                </div>

                {/* Right side: Chat Screen */}
                <div className="lg:col-span-3 flex flex-col bg-white rounded-[2rem] shadow-xl border border-black/5 overflow-hidden min-h-[500px] h-[650px]">

                    {/* Log Terminal Screen Header */}
                    <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight text-white">Merlin SecGuard AI</h4>
                                <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> ONLINE
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                        </div>
                    </div>

                    {/* Messages Window */}
                    <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                        {messages.map((m, idx) => {
                            const isBot = m.sender === 'bot';
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBot ? 'bg-purple-100 text-purple-700' : 'bg-black text-white'}`}>
                                        {isBot ? <Bot size={16}/> : <User size={16}/>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${isBot ? 'bg-white border border-black/5 text-black shadow-sm rounded-tl-none' : 'bg-black text-white rounded-br-none'}`}>
                                            <p className="whitespace-pre-wrap">{m.text}</p>

                                            {/* Beautiful Code Block representation inside Chat */}
                                            {m.code && (
                                                <div className="mt-4 bg-[#1e1e1e] p-4 rounded-2xl border border-white/10 overflow-x-auto shadow-inner text-xs font-mono text-gray-300">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                                        <span><Code2 size={10} className="inline mr-1"/> secure_patch.php</span>
                                                    </div>
                                                    <pre>{m.code}</pre>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] text-black/30 font-bold ${isBot ? 'text-left' : 'text-right'}`}>{m.time}</span>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Typing Loader */}
                        {isTyping && (
                            <div className="flex gap-3 items-center mr-auto">
                                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center shrink-0">
                                    <Bot size={16}/>
                                </div>
                                <div className="bg-white border border-black/5 p-4 rounded-3xl rounded-tl-none shadow-sm text-xs text-black/40 flex items-center gap-2">
                                    <RefreshCw size={12} className="animate-spin text-purple-600" /> Merlin AI is auditing payload parameters...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                        className="p-4 bg-white border-t border-black/5 flex gap-3 items-center"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Paste SQL string, security query, or ask for code remediation..."
                            className="flex-grow p-4 bg-gray-50 focus:bg-white focus:border-black border border-black/5 rounded-2xl outline-none transition text-sm font-body shadow-inner"
                        />
                        <button
                            type="submit"
                            className="bg-black hover:scale-105 transition text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                        >
                            <Send size={18} />
                        </button>
                    </form>

                </div>

            </div>

        </div>
    );
}
