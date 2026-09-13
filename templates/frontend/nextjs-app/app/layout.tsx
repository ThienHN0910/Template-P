import React from 'react';

export const metadata = {
  title: 'Next.js Fullstack Starter',
  description: 'Scaffolded with create-p-stack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
