import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { saveReaderOptions, getReaderOptions } from '@/utils/asyncStorage';
const ReaderOptions = () => {
    const { appliedTheme } = useThemeContext();

    const loadReaderOptions = async () => {
        try {
          const options = await getReaderOptions('readerOptions');
          if (options) {
            const { fontSize, lineHeight, textAlign, fontFamily } = JSON.parse(options);
            setFontSize(fontSize || 16);
            setLineHeight(lineHeight || 25);
            setTextAlign(textAlign || 'left');
            setFontFamily(fontFamily || 'Roboto');
          }
        } catch (error) {
          console.error('Error loading reader options', error);
        }
    };

    useEffect(() => {
        loadReaderOptions();
    }, []);

    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(25);
    const [textAlign, setTextAlign] = useState('left');
    const [fontFamily, setFontFamily] = useState('Roboto');

    const handleFontSizeChange = (value: number) => {
        setFontSize(value);
        saveReaderOptions({ fontSize: value, lineHeight, textAlign, fontFamily });
      };
      
      const handleLineHeightChange = (value: number) => {
        setLineHeight(value);
        saveReaderOptions({ fontSize, lineHeight: value, textAlign, fontFamily });
      };
      
      const handleTextAlignChange = (alignment: string) => {
        setTextAlign(alignment);
        saveReaderOptions({ fontSize, lineHeight, textAlign: alignment, fontFamily });
      };
      
      const handleFontFamilyChange = (font: string) => {
        setFontFamily(font);
        saveReaderOptions({ fontSize, lineHeight, textAlign, fontFamily: font });
      };

    return(
        <View>
            <View style={styles.pullupModalItemContainer}>
                <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text size</Text>
                <View style={styles.pullupModalItemContainerInner}>
                <Slider
                    style={{ width: 200, height: 40 }}
                    minimumValue={12}
                    maximumValue={20}
                    step={1}
                    value={fontSize}
                    onValueChange={value => handleFontSizeChange(value)}
                    minimumTrackTintColor={appliedTheme.colors.primary}
                    maximumTrackTintColor={appliedTheme.colors.text}
                    thumbTintColor={appliedTheme.colors.primary} 
                />
                <Text style={{color: appliedTheme.colors.text}}>{fontSize}</Text>
                </View>
            </View>
            <View style={styles.pullupModalItemContainer}>
                <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Line height</Text>
                <View style={styles.pullupModalItemContainerInner}>
                <Slider
                    style={{ width: 200, height: 40 }}
                    minimumValue={18}
                    maximumValue={32}
                    step={1}
                    value={lineHeight}
                    onValueChange={value => handleLineHeightChange(value)}
                    minimumTrackTintColor={appliedTheme.colors.primary}
                    maximumTrackTintColor={appliedTheme.colors.text}
                    thumbTintColor={appliedTheme.colors.primary} 
                />
                <Text style={{color: appliedTheme.colors.text}}>{lineHeight}</Text>
                </View>
            </View>

            <View style={styles.pullupModalItemContainer}>
                <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Text align</Text>
                <View style={styles.pullupModalItemContainerInner}>
                {['left', 'center', 'right', 'justify'].map((alignment) => (
                    <TouchableOpacity key={alignment} onPress={() => handleTextAlignChange(alignment)}>
                    <MaterialIcons
                        size={28}
                        name={`format-align-${alignment}`}
                        color={appliedTheme.colors.text}
                        style={{
                        marginHorizontal: 12,
                        backgroundColor: textAlign === alignment ? appliedTheme.colors.primary : 'transparent',
                        borderRadius: 4,
                        }}
                    />
                    </TouchableOpacity>
                ))}
                </View>
            </View>
            <View style={styles.pullupModalItemContainer}>
                <Text style={[styles.pullupModalSettingTitle, { color: appliedTheme.colors.text }]}>Font preset</Text>
                <View style={styles.pullupModalItemContainerInner}>
                <FlatList
                    data={['serif', 'Roboto', 'monospace']}
                    horizontal
                    style={{marginLeft: 8}}
                    keyExtractor={(item) => item}
                    renderItem={({ item: font }) => (
                    <TouchableOpacity onPress={() => handleFontFamilyChange(font)}>
                        <View style={[styles.fontPill, { backgroundColor: fontFamily === font ? appliedTheme.colors.primary : appliedTheme.colors.elevation.level3 }]}>
                        <Text style={{ color: appliedTheme.colors.text }}>{font}</Text>
                        </View>
                    </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false} // Hides the horizontal scroll bar
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }} // Align items
                />
                </View>
            </View>
        </View>
    );
}

export default ReaderOptions;

const styles = StyleSheet.create({
    pullupModalItemContainer: {
        width: '100%',
        flexDirection: 'row',
        padding: 8,
      },
      pullupModalItemContainerInner: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
      },
      pullupModalSettingTitle: {
        fontSize: 18,
      },
      fontPill: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        height: 32,
      },
});