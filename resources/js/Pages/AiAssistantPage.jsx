import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertCircle, Check, ChevronRight, Code2, Copy, Hexagon, Moon,
    Send, ShieldCheck, Sun, Terminal, User, WandSparkles
} from 'lucide-react';
import axios from 'axios';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const starterMessage = {
    sender: 'bot',
    text: "Hi, I’m Merlin. Describe what is going wrong and I’ll help trace the likely cause. I can review code, errors, failing tests, security concerns, and UI issues such as buttons or forms that do not work. I’ll distinguish evidence from guesses and suggest ways to verify a fix.",
    time: now(),
};

function splitCodeBlock(reply) {
    const match = reply.match(/```([^\n`]*)\n([\s\S]*?)```/);
    if (!match) return { text: reply, code: null, language: '' };
    return {
        text: `${reply.slice(0, match.index)}${reply.slice(match.index + match[0].length)}`.trim(),
        code: match[2].trim(),
        language: match[1].trim(),
    };
}

export default function AiAssistantPage() {
    const [messages, setMessages] = useState([starterMessage]);
    const [inputValue, setInputValue] = useState('');
    const [code, setCode] = useState('');
    const [errorText, setErrorText] = useState('');
    const [expected, setExpected] = useState('');
    const [language, setLanguage] = useState('');
    const [showContext, setShowContext] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [requestError, setRequestError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const examples = [
        { label: 'Debug an error', text: 'Help me find the root cause of this error and suggest a minimal fix.' },
        { label: 'Broken UI button', text: 'This button does not work. Help me identify likely causes and how to verify the fix.' },
        { label: 'Review security', text: 'Review the supplied code for security risks and explain the evidence and safe fixes.' },
    ];

    const handleSend = async (text = inputValue) => {
        const message = text.trim();
        if (!message || isTyping) return;

        const userMessage = { sender: 'user', text: message, time: now() };
        const history = messages
            .filter((item) => item !== starterMessage)
            .slice(-10)
            .map(({ sender, text: historyText }) => ({ sender, text: historyText }));

        setMessages((current) => [...current, userMessage]);
        setInputValue('');
        setRequestError('');
        setIsTyping(true);

        try {
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.post('/api/ai/chat', {
                message,
                code: code.trim() || undefined,
                error: errorText.trim() || undefined,
                expected: expected.trim() || undefined,
                language: language.trim() || undefined,
                history,
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                timeout: 70000,
            });

            if (!response.data?.success || typeof response.data.reply !== 'string') {
                throw new Error(response.data?.message || 'The AI service returned an invalid response.');
            }

            const result = splitCodeBlock(response.data.reply);
            setMessages((current) => [...current, {
                sender: 'bot',
                ...result,
                provider: response.data.provider,
                model: response.data.model,
                time: now(),
            }]);
        } catch (error) {
            const messageText = error.response?.data?.message
                || (error.response?.status === 401
                    ? 'Please sign in again to use the debugging assistant.'
                    : 'Could not reach the AI debugging service. Check your connection and server configuration, then try again.');
            setRequestError(messageText);
        } finally {
            setIsTyping(false);
        }
    };

    const copyToClipboard = async (value, index) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedIndex(index);
            window.setTimeout(() => setCopiedIndex(null), 1800);
        } catch {
            setRequestError('Clipboard access is unavailable in this browser.');
        }
    };

    const surface = isDark ? 'bg-[#15171e] border-white/5 text-gray-200' : 'bg-white border-black/5 text-gray-900';

    return (
        <div className={`min-h-screen font-body transition-colors duration-300 flex flex-col items-center justify-start pt-24 pb-12 px-4 md:px-8 ${isDark ? 'bg-[#0b0c10] text-gray-200' : 'bg-[#FDFBF7] text-black'}`}>
            <div className="w-full max-w-6xl flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDark ? 'bg-white text-black border-white/10' : 'bg-black text-white border-black/10'}`}>
                        <Hexagon size={20} className="fill-current" />
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold tracking-wide">Merlin Debugger</h2>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">AI-assisted debugging · evidence first</p>
                    </div>
                </div>
                <button type="button" onClick={() => setIsDark((value) => !value)} className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                    {isDark ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-purple-600" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>

            <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-5 items-stretch flex-grow min-h-[680px] max-h-[82vh]">
                <aside className="lg:col-span-3 flex flex-col gap-4">
                    <section className={`p-5 rounded-3xl border shadow-lg ${surface}`}>
                        <h3 className="font-heading text-base font-bold mb-1">Start with a scenario</h3>
                        <p className="text-xs opacity-70 mb-4">Examples are prompts, not simulated results.</p>
                        <div className="flex flex-col gap-2">
                            {examples.map((example) => (
                                <button key={example.label} type="button" onClick={() => handleSend(example.text)} disabled={isTyping} className={`p-3 border rounded-2xl text-left flex justify-between items-center group disabled:opacity-50 ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/5' : 'bg-gray-50 border-black/5 hover:bg-gray-100'}`}>
                                    <span className="text-[11px] font-bold">{example.label}</span>
                                    <ChevronRight size={13} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </section>
                    <section className={`p-5 rounded-3xl border shadow-lg flex-grow ${isDark ? 'bg-gradient-to-br from-[#121216] to-[#1a1a24] border-white/5 text-white' : 'bg-black text-white border-black/5'}`}>
                        <h3 className="font-heading text-base text-purple-300 flex items-center gap-2 mb-2"><ShieldCheck size={17} /> How it works</h3>
                        <p className="text-xs leading-relaxed text-gray-300">The configured AI model analyzes the context you submit and returns a fresh response. It does not execute your code or inspect your live website. Share relevant files, browser console errors, steps to reproduce, and expected behavior for a more useful diagnosis.</p>
                        <p className="text-[10px] text-gray-400 mt-4">Review suggested changes and run your own tests before deploying.</p>
                    </section>
                </aside>

                <main className={`lg:col-span-9 flex flex-col rounded-[2rem] border shadow-2xl overflow-hidden min-h-0 ${isDark ? 'bg-[#121319] border-white/5' : 'bg-white border-black/5'}`}>
                    <div className={`flex-grow p-5 md:p-7 overflow-y-auto space-y-5 ${isDark ? 'bg-[#15161d]/50' : 'bg-gray-50/40'}`}>
                        {messages.map((item, index) => {
                            const isBot = item.sender === 'bot';
                            return (
                                <motion.div key={`${index}-${item.time}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 max-w-[94%] ${isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isBot ? (isDark ? 'bg-white text-black border-white/10' : 'bg-black text-white border-black/10') : 'bg-purple-600 text-white border-purple-500'}`}>
                                        {isBot ? <Hexagon size={16} className="fill-current" /> : <User size={16} />}
                                    </div>
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${isBot ? (isDark ? 'bg-[#1c1d26] text-gray-200 border border-white/5 rounded-tl-none' : 'bg-white text-black border border-black/5 rounded-tl-none') : 'bg-purple-600 text-white rounded-tr-none'}`}>
                                            {item.text && <p className="whitespace-pre-wrap text-xs sm:text-sm">{item.text}</p>}
                                            {item.code && <div className="mt-3 bg-[#1e1e24] p-4 rounded-2xl border border-white/10 overflow-x-auto text-xs font-mono text-gray-300">
                                                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3 text-[10px] text-white/50 uppercase tracking-wide">
                                                    <span><Terminal size={11} className="inline mr-1 text-purple-400" />{item.language || 'suggested fix'}</span>
                                                    <button type="button" onClick={() => copyToClipboard(item.code, index)} className="hover:text-white flex items-center gap-1">{copiedIndex === index ? <Check size={11} /> : <Copy size={11} />}{copiedIndex === index ? 'Copied' : 'Copy'}</button>
                                                </div>
                                                <pre className="whitespace-pre-wrap">{item.code}</pre>
                                            </div>}
                                            {isBot && item.provider && <p className="mt-3 text-[9px] opacity-40">Generated by {item.provider}{item.model ? ` · ${item.model}` : ''}</p>}
                                        </div>
                                        <span className={`text-[9px] text-gray-500 font-bold ${isBot ? 'text-left' : 'text-right'}`}>{item.time}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {isTyping && <div className="flex gap-3 items-center text-xs text-gray-400"><WandSparkles size={16} className="text-purple-400 animate-pulse" /> Merlin is analyzing the details…</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={`p-4 border-t shrink-0 ${isDark ? 'bg-[#15161d] border-white/5' : 'bg-white border-black/5'}`}>
                        {requestError && <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"><AlertCircle size={15} className="shrink-0" />{requestError}</div>}
                        <form onSubmit={(event) => { event.preventDefault(); handleSend(); }} className="space-y-3">
                            {showContext && <div className="grid md:grid-cols-2 gap-3">
                                <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Language / framework (e.g. React, PHP)" className={`rounded-xl border p-3 text-xs outline-none ${isDark ? 'bg-[#1c1d26] border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`} />
                                <input value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="What should happen?" className={`rounded-xl border p-3 text-xs outline-none ${isDark ? 'bg-[#1c1d26] border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`} />
                                <textarea value={errorText} onChange={(event) => setErrorText(event.target.value)} rows={3} placeholder="Error message, stack trace, or browser console output" className={`rounded-xl border p-3 text-xs outline-none md:col-span-2 ${isDark ? 'bg-[#1c1d26] border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`} />
                                <textarea value={code} onChange={(event) => setCode(event.target.value)} rows={5} placeholder="Relevant code (optional). Remove passwords, API keys, and personal data first." className={`rounded-xl border p-3 text-xs font-mono outline-none md:col-span-2 ${isDark ? 'bg-[#1c1d26] border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`} />
                            </div>}
                            <div className="flex gap-2 items-end">
                                <button type="button" onClick={() => setShowContext((value) => !value)} className={`shrink-0 p-3 rounded-xl border flex items-center gap-2 text-xs ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`} aria-expanded={showContext}>
                                    <Code2 size={15} />{showContext ? 'Hide details' : 'Add code / error'}
                                </button>
                                <textarea value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} rows={2} maxLength={6000} placeholder="Describe the bug, steps to reproduce, or ask a debugging question…" className={`flex-grow resize-y min-h-[48px] max-h-40 p-3 rounded-xl outline-none border text-xs sm:text-sm ${isDark ? 'bg-[#1c1d26] text-white border-white/10 focus:border-purple-500/60' : 'bg-gray-50 text-black border-black/10 focus:border-black'}`} />
                                <button type="submit" disabled={isTyping || !inputValue.trim()} aria-label="Send debugging request" className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"><Send size={16} /></button>
                            </div>
                            <p className="text-[10px] text-gray-500">Do not paste secrets. AI suggestions can be wrong; inspect changes and verify with tests.</p>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
