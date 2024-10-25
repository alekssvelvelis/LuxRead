import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useThemeContext } from '@/contexts/ThemeContext';
import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import { getSources } from '@/database/ExpoDB';
interface SourceData {
    id: number,
    sourceName: string,
    baseImage: string,
}
export default function Sources() {
    const { appliedTheme } = useThemeContext();
    const router = useRouter();
    const [sources, setSources] = useState<SourceData[]>([]);
    useEffect(() => {
        const fetchSources = async () => {
            try {
              const databaseSources = await getSources();
              // console.log(JSON.stringify(data, null,2), ' inside of library.tsx');
              setSources(databaseSources);
            } catch (error) {
              console.error("Failed to fetch novels:", error);
            }
          };
          fetchSources();
      }, []);
    //   console.log(JSON.stringify(sources, null, 2));

    const [query, setQuery] = useState("");
    const [filteredSources, setFilteredSources] = useState(sources);
    const handleSearchQuery = (query: string) => {
        setQuery(query);
    }
    useEffect(() => {
        const filteredSources = sources.filter(sources =>
            sources.sourceName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredSources(filteredSources);
      }, [query, sources]);

    const handleSourcePress = (sourceName: string) => {
        // @ts-ignore since pathname only works this way. Can remove and try to fix error.
        router.navigate({ pathname: `source/[id]`, params: { sourceName } });
    };

    return (
        <View style={[styles.container, {backgroundColor: appliedTheme.colors.elevation.level2}]}>
            <View style={styles.header}><SearchBar onSearchChange={handleSearchQuery}/></View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
                {filteredSources.length === 0 ? (
                    <View style={{ position: 'relative',  justifyContent: 'center',  alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40, marginTop: '50%'}}>
                        <Text style={{ color: appliedTheme.colors.text, fontSize: 24, textAlign: 'center'}}>
                            {query ? 'No sources found with this search query' : 'Sources currently empty - check internet connection'}
                        </Text>
                    </View>
                ) : (
                    filteredSources.map((filteredSource, index) => { 
                    return(
                        <TouchableOpacity key={index} onPress={() => handleSourcePress(filteredSource.sourceName)} style={[styles.sourceContainer, {backgroundColor: appliedTheme.colors.elevation.level3}]}>
                            <Image style={styles.sourceImage} source={{uri : filteredSource.baseImage}}></Image>
                            <Text style={[styles.sourceText, {color: appliedTheme.colors.text}]}>{filteredSource.sourceName}</Text>
                            <Entypo style={[styles.bookmark, {}]} size={40} name="bookmarks" color={appliedTheme.colors.onSurfaceVariant}/>
                        </TouchableOpacity>
                    );
                })
            )}
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
    sourceText: {
        fontSize: 24,
        paddingHorizontal: 12,
    },
    bookmark: {
        position: 'absolute',
        right: 8,
    },
  });