import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { NovelLayoutProvider } from './NovelLayoutContext';
import FirstLaunchSetup from '@/components/FirstTimeSetup';
import { PaperProvider } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <InnerProviders>{children}</InnerProviders>
    </ThemeProvider>
  );
};

function InnerProviders({ children }: { children: ReactNode }) {
  const { appliedTheme } = useThemeContext();
  return (
    <NovelRowsProvider>
      <NovelLayoutProvider>
        <NetworkProvider>
          <FirstLaunchSetup>
            <PaperProvider theme={appliedTheme}>
              <SafeAreaProvider>
                {children}
              </SafeAreaProvider>
            </PaperProvider>
          </FirstLaunchSetup>
        </NetworkProvider>
      </NovelLayoutProvider>
    </NovelRowsProvider>
  );
}

export default AppContextProvider;
