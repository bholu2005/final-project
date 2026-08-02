import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie, X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent_status');
        if (!consent) {
            // Show banner after 1.5 seconds delay for natural premium feel
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent_status', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookie_consent_status', 'rejected');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[200] font-body"
                >
                    <div className="bg-black/95 text-white backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col gap-4 relative overflow-hidden">

                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-skin rounded-2xl flex items-center justify-center shrink-0 text-black shadow-lg">
                                <Cookie size={24} className="animate-spin-slow" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-heading text-lg text-skin">Cookie Consent</h4>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="text-white/40 hover:text-white transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <p className="text-white/75 text-xs leading-relaxed">
                                    We use essential cookies and telemetry systems to ensure safe isolated code execution, secure session validation, and premium AI engine response delivery.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1 justify-end">
                            <button
                                onClick={handleReject}
                                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition text-white"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 rounded-full text-xs font-bold bg-skin hover:scale-105 transition text-black shadow-lg"
                            >
                                Accept All
                            </button>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
