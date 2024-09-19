import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import SearchBar from '@/components/SearchBar';

import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';

import  { fetchSingleNovel } from '@/sources/allnovelfull';

import { useRouter } from 'expo-router';
import { getAllLibraryNovels, deleteLibraryNovel, } from '@/database/ExpoDB';

interface Data{
    id: string | number;
    title: string;
    author: string;
    chapterCount: number;
    imageURL: string;
    novelPageURL: string;
}

export default function Library() {
  const { appliedTheme } = useThemeContext();
  const { value: novelRows } = useNovelRowsContext();
  const router = useRouter();

  const [novelsData, setNovelsData] = useState([]);
  
  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const data = await getAllLibraryNovels('libraryNovels');
        setNovelsData(data); // Update the state with the fetched data
      } catch (error) {
        console.error("Failed to fetch novels:", error);
      }
    };
    fetchNovels();
  }, []);
  
  const handleDeleteNovel = async (novelId: number) => {
    try {
      await deleteLibraryNovel(novelId);
      // Fetch the updated list of novels
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

  const handleNavigateToNovel = async (novelPageURL) => {
    try {
      const novelData = await fetchSingleNovel(novelPageURL);
      // console.log(JSON.stringify(novelData, null, 2) + ' inside of [id].tsx/source');
      router.navigate({ 
        pathname: `novel/[id]`, 
        params: {
          ...novelData,
          chapters: JSON.stringify(novelData.chapters),
        },
      });
      // params: { title: novelData.title, description: novelData.description, author: novelData.author, genres: novelData.genres, imageURL: novelData.imageURL, url: novelData.url, chapters: novelData.chapters } 
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <View style={styles.header}>
        <SearchBar />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        <View style={styles.novelScrollView}>
          {novelsData.map((novel, index) => {
            const novelStyle = getNovelContainerStyle();
            return (
              <TouchableOpacity key={index} style={[styles.novelContainer, { width: novelStyle.width }]} onPress={() => handleNavigateToNovel(novel.novelPageURL)} onLongPress={() => handleDeleteNovel(novel.id)}>
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
          })}
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
