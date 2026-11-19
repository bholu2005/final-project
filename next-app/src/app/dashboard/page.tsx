export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <main className="shell">
    <header className="top"><a className="brand" href="/">⬡ <span>Merlin Debugger</span></a><span className="badge">{user.name}</span></header>
    <section className="hero"><p className="eyebrow">Member dashboard</p><h1>Welcome, {user.name}</h1><p className="sub">Plan: {user.plan}. Open the debugger or manage your account.</p></section>
  </main>;
}
