import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ココフォリア Log Analyzer [CoC]',
  description: 'ココフォリアのログを解析し、CCBなどで出した 1d100 の出目の頻度を可視化します。',
  authors: [{ name: '@log_analyzer_cf' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
