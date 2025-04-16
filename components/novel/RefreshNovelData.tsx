import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Text, } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
export default function RefreshNovelData() {
  const [refreshing, setRefreshing] = useState(false);
  const { appliedTheme } = useThemeContext();
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ minWidth: '100%', minHeight: '100%', justifyContent: 'center', alignItems: 'center', }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          // Android specific props:
          colors={[appliedTheme.colors.primary]} // Spinner stroke colors
          progressBackgroundColor={appliedTheme.colors.surfaceVariant}
          progressViewOffset={50} // Push the spinner down a bit
          enabled={true}
        />
      }
    >
      <Text style={{color: appliedTheme.colors.text}}>Pull down to refresh</Text>
    </ScrollView>
  );
}