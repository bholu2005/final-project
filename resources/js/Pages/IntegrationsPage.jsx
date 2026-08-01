import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Check, Sparkles, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function IntegrationsPage({ onBack }) {
    const [slackUrl, setSlackUrl] = useState('');
    const [discordUrl, setDiscordUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const response = await axios.get('http://127.0.0.1:8000/api/integrations', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    const data = response.data.data || [];
                    const slack = data.find(i => i.service_name === 'slack');
                    const discord = data.find(i => i.service_name === 'discord');
                    if (slack) setSlackUrl(slack.webhook_url);
                    if (discord) setDiscordUrl(discord.webhook_url);
                }
            } catch (err) {
                console.error("Fetch integrations failed:", err);
            }
        };
        fetchIntegrations();
    }, []);

    const handleSave = async (service, url) => {
        setSaving(true);
        setMessage('');
        try {
            const token = sessionStorage.getItem('auth_token');
            const response = await axios.post('http://127.0.0.1:8000/api/integrations', {
                service_name: service,
                webhook_url: url
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessage(`${service.toUpperCase()} integration updated successfully!`);
            }
        } catch (err) {
            console.error("Save integration failed:", err);
            setMessage("Failed to save integration. Ensure Webhook URL is valid.");
        } finally {
            setSaving(false);
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
                    <MessageSquare size={12} className="text-yellow-400" /> Notifications & Webhooks
                </div>
            </div>

            {/* Content Dashboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-[#FDFBF7] rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-white/50 space-y-8">
                <div>
                    <h3 className="font-heading text-4xl mb-2">Webhooks Integrations</h3>
                    <p className="text-black/50 text-sm">Push real-time security alerts directly to your team communication channels.</p>
                </div>

                {message && (
                    <div className="p-3 bg-green-100 text-green-800 border border-green-200 text-xs font-bold rounded-xl flex items-center gap-2">
                        <Check size={16}/> {message}
                    </div>
                )}

                {/* SLACK PANEL */}
                <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold text-sm">S</div>
                        <div>
                            <h4 className="font-bold text-lg">Slack Channel Alerts</h4>
                            <p className="text-xs text-black/40">Connect automated notifications for team channels.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="https://hooks.slack.com/services/..."
                            value={slackUrl}
                            onChange={(e) => setSlackUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black font-mono text-xs shadow-inner"
                        />
                        <button
                            onClick={() => handleSave('slack', slackUrl)}
                            disabled={saving}
                            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-900 transition flex items-center gap-1 font-bold text-xs"
                        >
                            <Save size={14}/> Save
                        </button>
                    </div>
                </div>

                {/* DISCORD PANEL */}
                <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm">D</div>
                        <div>
                            <h4 className="font-bold text-lg">Discord Server Alerts</h4>
                            <p className="text-xs text-black/40">Receive instant push logs directly in Discord servers.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="https://discord.com/api/webhooks/..."
                            value={discordUrl}
                            onChange={(e) => setDiscordUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black font-mono text-xs shadow-inner"
                        />
                        <button
                            onClick={() => handleSave('discord', discordUrl)}
                            disabled={saving}
                            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-900 transition flex items-center gap-1 font-bold text-xs"
                        >
                            <Save size={14}/> Save
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-xs text-black/50">
                    <Sparkles size={14} className="text-yellow-500"/> Webhook payloads are pushed as secure JSON alerts whenever a scan finds critical ratings.
                </div>
            </motion.div>
        </div>
    );
}
