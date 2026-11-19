export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from './logout-button';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Always scope this query to the authenticated user; do not expose other users' scans.
  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, scanReference: true, target: true, scanType: true, status: true, createdAt: true },
  });

  return <main className="shell">
    <header className="top">
      <a className="brand" href="/">⬡ <span>Merlin Debugger</span></a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="badge">{user.name}</span>
        <LogoutButton />
      </div>
    </header>
    <section className="hero">
      <p className="eyebrow">Member dashboard</p>
      <h1>Welcome, {user.name}</h1>
      <p className="sub">Plan: {user.plan}. Your recent scans are listed below.</p>
    </section>
    <section aria-labelledby="recent-scans-heading" style={{ marginTop: 32 }}>
      <h2 id="recent-scans-heading">Recent scans</h2>
      {scans.length === 0 ? <p className="sub">No scans yet.</p> : <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {scans.map((scan) => <li key={scan.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16, background: 'var(--panel)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <strong>{scan.target}</strong>
            <span className="badge">{scan.status}</span>
          </div>
          <p className="sub" style={{ marginBottom: 0 }}>{scan.scanType} · {scan.scanReference} · {scan.createdAt.toLocaleString()}</p>
        </li>)}
      </ul>}
    </section>
  </main>;
}
