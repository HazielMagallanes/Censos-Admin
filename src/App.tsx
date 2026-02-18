import React from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import Routes from '@/components/routing/Routes';

const App: React.FC = () => {
  return (
    <AppProviders>
      <Routes />
    </AppProviders>
  )
}

export default App;