import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Merlin Debugger',
  description: 'Evidence-first AI-assisted software debugging.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
