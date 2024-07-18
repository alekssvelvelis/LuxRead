import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useThemeContext } from '@/contexts/ThemeContext';
import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/SearchBar';
export default function Sources() {
    const { appliedTheme } = useThemeContext();
    const router = useRouter();
    const sources = [
        {
            id: 1,
            sourceName: 'AllNovelFull',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyjJn_YwCifVmvArmnCMIVroxl61obyCE5WQ&s',
        },
        {
            id: 2,
            sourceName: 'LightNovelPub',
            imageUrl: 'https://i.redd.it/ui97q7ehwqsa1.jpg',
        }
    ];

    const handleSourcePress = (sourceId: any) => {
        router.navigate({ pathname: `source/[id]`, params: sourceId });
      };
    return (
        <View style={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
            <View style={styles.header}><SearchBar/></View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
                {sources.map((source, index) => { 
                    return(
                        <TouchableOpacity key={index} onPress={() => handleSourcePress(source)} style={[styles.sourceContainer, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
                            <Image style={styles.sourceImage} source={{uri : source.imageUrl}}></Image>
                            <Text style={{color: appliedTheme.colors.text, fontSize: 24, paddingHorizontal: 12}}>{source.sourceName}</Text>
                            <Entypo style={[styles.bookmark, {}]} size={40} name="bookmarks" color={appliedTheme.colors.onSurfaceVariant}/>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
        height: 80,
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 12,
        paddingTop: 20,
    },
    sourceContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        position: 'relative',
        marginVertical: 4,
        borderRadius: 8
    },
    sourceImage: {
        width: 55,
        height: 60,
        objectFit: 'cover',
        borderRadius: 8,
    },
    bookmark: {
        position: 'absolute',
        right: 8,
    }
  });