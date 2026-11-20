'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function logout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        setError('Could not sign out. Please try again.');
        return;
      }
      router.replace('/login');
      router.refresh();
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <button type="button" onClick={logout} disabled={busy} aria-label="Sign out">
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
    {error && <span role="alert" style={{ marginLeft: 12 }}>{error}</span>}
  </div>;
}
