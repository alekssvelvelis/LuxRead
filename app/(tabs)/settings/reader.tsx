import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ReaderSetting from '@/components/settings/ReaderSetting';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getReaderOptions } from '@/utils/asyncStorage';

interface ReaderOptions {
  fontSize: number;
  lineHeight: number;
  textAlign: string;
  fontFamily: string;
}

const Reader = () => {
  const { appliedTheme } = useThemeContext();

  const [readerOptions, setReaderOptions] = useState<ReaderOptions>({
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'left',
    fontFamily: 'Roboto',
  });

  useEffect(() => {
    const loadReaderOptions = async () => {
      try {
        const options = await getReaderOptions();
        if (options) {
          const parsed = JSON.parse(options);
          setReaderOptions({
            fontSize: parsed.fontSize || 16,
            lineHeight: parsed.lineHeight || 25,
            textAlign: parsed.textAlign || 'left',
            fontFamily: parsed.fontFamily || 'Roboto',
          });
        }
      } catch (error) {
        console.error('Error loading reader options', error);
      }
    };

    loadReaderOptions();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
      {/* Pass setReaderOptions directly */}
      <ReaderSetting onOptionsChange={setReaderOptions} />

      <ScrollView
        style={{
          width: '95%',
          padding: 8,
          backgroundColor: appliedTheme.colors.surfaceVariant,
          maxHeight: 200,
        }}
      >
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              color: appliedTheme.colors.text,
              fontSize: readerOptions.fontSize,
              lineHeight: readerOptions.lineHeight,
              textAlign: readerOptions.textAlign as any,
              fontFamily: readerOptions.fontFamily,
            }}
          >
            A frail-looking young man with pale skin and dark circles under his eyes was sitting on a rusty bench across from the police station. He was cradling a cup of coffee in his hands — not the cheap synthetic type slum rats like him had access to, but the real deal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Reader;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  infoContainer: {
    width: '95%',
  },
  pressable: {
    alignItems: 'flex-start',
    padding: 10,
    width: '100%',
  },
  currentValue: {
    fontSize: 14,
  },
  label: {
    fontSize: 24,
    marginLeft: 14,
  },
  header: {
    fontSize: 32,
    marginBottom: 48,
  },
});
