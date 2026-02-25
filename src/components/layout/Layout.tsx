import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
