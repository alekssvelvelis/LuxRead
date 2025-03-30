import React from 'react';
import { View, StyleSheet, Text, Dimensions, Linking, Pressable } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
const AboutSection = () => {
    const screenWidth = Dimensions.get('screen').width;
    const { appliedTheme } = useThemeContext();
    const openURL = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('An error occurred', err));
      }
    
    return (
        <View style={[styles.container, { width: screenWidth - 20 }]}>
            <View style={{padding: 16}}>
                <Text style={{color: appliedTheme.colors.text}}>Current build</Text>
                <Text style={{color: appliedTheme.colors.secondary}}>Version 1.0 Alpha</Text>
            </View>
            <Pressable style={{padding: 16}} 
            onPress={()=>{openURL('https://github.com/alekssvelvelis/LuxRead')}}>
                <Text style={{color: appliedTheme.colors.text}}>GitHub repository</Text>
                <Text style={{color: appliedTheme.colors.secondary}}>https://github.com/alekssvelvelis/LuxRead</Text>
            </Pressable>
            <View style={{padding: 16}}>
                <Text style={{color: appliedTheme.colors.text}}>Contacts</Text>
                <View style={{flexDirection: 'row'}}>
                    <MaterialIcons name="discord" size={20} color={appliedTheme.colors.secondary}/>
                    <Text style={{color: appliedTheme.colors.secondary, marginLeft: 8,}}>aksels</Text>
                </View>
            </View>
        </View>
    );
};

export default AboutSection;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 18,
        paddingLeft: 8,
        marginBottom: 10,
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        position: 'absolute',
        top: '80%',
        left: '2.5%',
        width: '95%',
        transform: [{ translateY: -Dimensions.get('screen').height / 2 }],
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
    },
    radioButtonText: {
        marginLeft: 8,
    },
    pressable: {
        alignItems: 'flex-start',
        padding: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    currentValue: {
        fontSize: 14,
    },
});
