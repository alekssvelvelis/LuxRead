import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { NovelLayoutProvider } from './NovelLayoutContext';

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <NovelRowsProvider>
        <NovelLayoutProvider>
          <NetworkProvider>
            {children}
          </NetworkProvider>
        </NovelLayoutProvider>
      </NovelRowsProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
