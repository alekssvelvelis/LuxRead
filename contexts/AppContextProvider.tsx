import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import { NetworkProvider } from '@/contexts/NetworkContext';

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <NovelRowsProvider>
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </NovelRowsProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
