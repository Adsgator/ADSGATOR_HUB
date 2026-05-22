import React from 'react';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen dark:bg-surface-bg bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-[3.5rem] min-h-screen">
        <div className="max-w-[90rem] mx-auto px-[2rem] py-[2rem]">
          {children}
        </div>
      </main>
    </div>
  );
}
