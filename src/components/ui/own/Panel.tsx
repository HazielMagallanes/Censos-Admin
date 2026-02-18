import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardHeader } from './DashboardHeader';
import { AppSidebar } from './AppSidebar';
import { SidebarInset } from '../shadcn/sidebar';

interface PanelProps {
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <div className="flex h-screen w-screen">{children}</div>;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40">
        <DashboardHeader />
      </div>
      <AppSidebar className="pt-16" />
      <SidebarInset className="pt-16 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </>
  );
};
