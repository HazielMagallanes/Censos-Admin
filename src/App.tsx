import React from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import { SidebarInset } from '@/components/ui/shadcn/sidebar';
import { AppSidebar } from '@/components/ui/own/AppSidebar';
import Routes from '@/components/routing/Routes';

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppSidebar />
      <SidebarInset>
        <Routes />
      </SidebarInset>
    </AppProviders>
  )
}

export default App;