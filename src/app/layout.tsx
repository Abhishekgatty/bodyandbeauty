import React from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-secondary selection:text-white relative">
      {children}
    </div>
  );
}
