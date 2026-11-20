'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Job = { id: string; status: string; result?: string | null; errorCode?: string | null };
type PendingJob = { id: string; token: string };
const storageKey = 'merlin.pending-job';

export default function Home() {
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [language, setLanguage] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const pending = JSON.parse(saved) as PendingJob;
      if (pending.id && pending.token) {
        setBusy(true);
        void poll(pending);
      }
    } catch { sessionStorage.removeItem(storageKey); }
    return () => { if (timer.current) clearTimeout(timer.current); };
  // poll is deliberately stable for the component lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function poll(pending: PendingJob) {
    try {
      const response = await fetch(`/api/debug/${pending.id}`, { cache: 'no-store', headers: { 'x-job-token': pending.token } });
      if (!response.ok) throw new Error('Status unavailable');
      const current = await response.json() as Job;
      setJob(current);
      if (['queued', 'processing', 'retrying'].includes(current.status)) {
        timer.current = setTimeout(() => void poll(pending), 1800);
      } else {
        sessionStorage.removeItem(storageKey);
        setBusy(false);
      }
    } catch {
      setNotice('Could not refresh job status. Your request is saved; retry shortly.');
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setJob(null);
    setBusy(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, code: code || undefined, error: errorText || undefined, language: language || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start debugging job.');
      const pending = { id: data.jobId as string, token: data.pollToken as string };
      sessionStorage.setItem(storageKey, JSON.stringify(pending));
      setJob({ id: pending.id, status: data.status });
      void poll(pending);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Service unavailable.');
      setBusy(false);
    }
  }

  return <main className="shell">
    <header className="top"><a className="brand" href="#">⬡ <span>Merlin Debugger</span></a><span className="badge">AI · evidence first</span></header>
    <section className="hero"><p className="eyebrow">Software debugging workspace</p><h1>Find the cause.<br/><em>Fix with confidence.</em></h1><p className="sub">Share a bug report, error, or code snippet. Merlin returns an evidence-based diagnosis and suggested verification steps.</p></section>
    <section className="panel">
      <form onSubmit={submit}>
        <label htmlFor="message">What is going wrong?</label>
        <textarea id="message" required minLength={3} maxLength={4000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the issue and the steps that reproduce it…" />
        <div className="grid">
          <div><label htmlFor="language">Language / framework</label><input id="language" maxLength={80} value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="e.g. Next.js, PHP, Python" /></div>
          <div><label htmlFor="error">Error / console output</label><textarea id="error" maxLength={6000} rows={4} value={errorText} onChange={(event) => setErrorText(event.target.value)} placeholder="Paste the relevant error or stack trace" /></div>
        </div>
        <label htmlFor="code">Relevant code (optional)</label>
        <textarea id="code" className="code" maxLength={12000} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Paste only the relevant code; remove passwords, keys, and personal data." />
        <div className="actions"><p>AI suggestions can be wrong. Review them and run tests before deploying.</p><button disabled={busy || message.trim().length < 3}>{busy ? 'Analyzing…' : 'Analyze issue →'}</button></div>
      </form>
      {notice && <p className="notice" role="alert">{notice}</p>}
      {job && <section className="result" aria-live="polite"><div className="result-head"><h2>Analysis</h2><span className="status">{job.status}</span></div>{job.result ? <pre>{job.result}</pre> : job.status === 'failed' ? <p>The job failed after retries. Check worker/provider configuration and try again.</p> : <p>Your request is saved. The worker is processing it; this page will update automatically.</p>}</section>}
    </section>
    <footer>Source snippets are not executed. Do not submit secrets. This starter is not yet a production multi-user deployment.</footer>
  </main>;
}
