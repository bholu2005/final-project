'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventEvent();
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <a className="brand" href="/">⬡ <span>Merlin Debugger</span></a>
      <h1>Welcome back</h1>
      <p>Sign in to continue to Merlin.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="notice" role="alert">{error}</p>}
        <button disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="auth-link"><a href="/auth/register">Create account</a></p>
    </section>
  </main>;
}
