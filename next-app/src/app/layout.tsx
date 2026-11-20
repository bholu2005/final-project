import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merlin Debugger',
  description: 'Evidence-first software debugging workspace',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
