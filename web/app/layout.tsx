import './globals.css';

export const metadata = {
  title: 'CV & Email MCP Server Playground',
  description: 'A Next.js playground for testing the CV & Email MCP Server',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
