import './globals.css';
import { Providers } from '../lib/providers';

export const metadata = {
  title: 'BetterView - Window Cleaning',
  description: 'Professional window cleaning for Miami high-rises',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
