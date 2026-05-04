import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MinoLingo ML — Dropout & Course Recommendation',
  description: 'Live RF vs XGBoost comparison for the MinoLingo e-learning platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
