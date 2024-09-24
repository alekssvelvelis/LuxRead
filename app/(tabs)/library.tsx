import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import SearchBar from '@/components/SearchBar';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';

import  { fetchSingleNovel } from '@/sources/allnovelfull';

import { useRouter, useFocusEffect } from 'expo-router';
import { getAllLibraryNovels, deleteLibraryNovel, deleteNovelChapters, clearTable, dropTable, setupLibraryNovelsTable, getTableStructure, setupNovelChaptersTable} from '@/database/ExpoDB';

interface Data{
    id: string | number;
    title: string;
    author: string;
    chapterCount: number;
    imageURL: string;
    novelPageURL: string;
}

export default function Library() {

  useEffect(() =>{
    // clearTable('libraryNovels');
    // dropTable('novelChapters');
    // console.log(JSON.stringify(getTableStructure('novelChapters'), null, 2));
    // setupNovelChaptersTable();
  }, [])
  
  const { appliedTheme } = useThemeContext();
  const { value: novelRows } = useNovelRowsContext();
  const router = useRouter();

  const [novelsData, setNovelsData] = useState<Data[]>([]);
  
  useFocusEffect(
    useCallback(() => {
      const fetchNovels = async () => {
        try {
          const data = await getAllLibraryNovels('libraryNovels');
          console.log(JSON.stringify(data, null,2), ' inside of library.tsx');
          setNovelsData(data); // Update the state with the fetched data
        } catch (error) {
          console.error("Failed to fetch novels:", error);
        }
      };
      fetchNovels();
      console.log(JSON.stringify(novelsData, null, 2));
    }, [])
  );
  

  const [query, setQuery] = useState("");
  const [filteredNovels, setFilteredNovels] = useState(novelsData);
  const handleSearchQuery = (query: string) => {
    setQuery(query);
  }
  useEffect(() => {
    const filtered = novelsData.filter(novel =>
      novel.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNovels(filtered);
  }, [query, novelsData]);
  

  const handleDeleteNovel = async (novelId: number) => {
    try {
      await deleteLibraryNovel(novelId);
      await deleteNovelChapters(novelId);
      const updatedNovelsData = await getAllLibraryNovels('libraryNovels');
      setNovelsData(updatedNovelsData);
    } catch (error) {
      console.error("Error deleting novel:", error);
    }
  };
  
  const getNovelContainerStyle = () => {
    const novelsInSingleRow = parseInt(novelRows, 10);
    const screenWidth = Dimensions.get('window').width;
    const novelWidth = screenWidth / novelsInSingleRow - 24;
    let novelHeight;
    switch (novelsInSingleRow) {
      case 1:
        novelHeight = 550;
        break;
      case 2:
        novelHeight = 250;
        break;
      case 3:
      case 4:
        novelHeight = 150;
        break;
      default:
        novelHeight = 200;
        break;
    }
    return {
      width: novelWidth,
      height: novelHeight,
    };
  };

  const handleNavigateToNovel = async (novelPageURL: string, novelId: number) => {
    try {
      const novelData = await fetchSingleNovel(novelPageURL);
      // console.log(JSON.stringify(novelData, null, 2) + ' inside of [id].tsx/source');
      router.navigate({ 
        pathname: `novel/[id]`,
        params: {
          ...novelData,
          chapters: JSON.stringify(novelData.chapters),
          id: novelId,
        },
      }); 
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <View style={styles.header}>
        <SearchBar onSearchChange={handleSearchQuery}/>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        <View style={[styles.novelScrollView]}>
          {filteredNovels.length === 0 ? (
            <View style={{ position: 'relative',  justifyContent: 'center',  alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40, marginTop: '50%'}}>
              <Text style={{ color: appliedTheme.colors.text, fontSize: 24, textAlign: 'center'}}>
                {query ? 'No novels found by with this search query.' : 'You have no saved novels. Navigate to Sources and find what to read.'}
              </Text>
            </View>
          ) : (
            filteredNovels.map((novel, index) => {
              const novelStyle = getNovelContainerStyle();
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.novelContainer, { width: novelStyle.width }]}
                  onPress={() => handleNavigateToNovel(novel.novelPageURL, novel.id)}
                  onLongPress={() => handleDeleteNovel(novel.id)}
                >
                  <Image
                    style={[styles.novelLogo, { height: novelStyle.height }]}
                    source={{ uri: novel.imageURL }}
                  />
                  <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontSize: 12 }}>
                    {novel.title}
                  </Text>
                  <View style={[styles.chaptersRemain, { backgroundColor: appliedTheme.colors.primary }]}>
                    <Text style={{ color: appliedTheme.colors.text }}>{novel.chapterCount}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
  novelScrollView: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  novelContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'scroll',
    position: 'relative',
    maxHeight: 600,
  },
  novelLogo: {
    width: '100%',
    borderRadius: 4,
    objectFit: 'fill'
  },
  chaptersRemain: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 4,
    padding: 4,
  },
});
