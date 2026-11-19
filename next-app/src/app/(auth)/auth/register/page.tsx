'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.error || 'Unable to create account. Please try again.');
        return;
      }
      router.replace('/login');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <a className="brand" href="/">⬡ <span>Merlin Debugger</span></a>
      <h1>Create your account</h1>
      <p>Get started with Merlin Debugger.</p>
      <form onSubmit={submit}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" minLength={2} maxLength={255} required value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="password">Password (at least 12 characters)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="notice" role="alert">{error}</p>}
        <button disabled={busy} type="submit">{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="auth-link"><a href="/login">Already have an account? Sign in</a></p>
    </section>
  </main>;
}
