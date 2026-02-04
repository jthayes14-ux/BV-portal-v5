import './globals.css';

export const metadata = {
  title: 'BetterView - Window Cleaning',
  description: 'Professional window cleaning for Miami high-rises',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
