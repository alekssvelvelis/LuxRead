import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Dimensions } from 'react-native';
import SearchBar from '@/components/SearchBar';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';

const novels = [
  {
    title: 'Lord of the Mysteries',
    chapters: 1451,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPI9FaQTXTWjl3k_PCKvDr5-E2hGyvuYjAmg&s'
  },
  {
    title: 'Shadow Slave',
    chapters: 456,
    imageUrl: 'https://m.media-amazon.com/images/I/41ZnppX1ytL.jpg'
  },
  {
    title: 'Beginning After the End',
    chapters: 456,
    imageUrl: 'https://preview.redd.it/mark-my-words-tbate-anime-is-in-production-and-it-will-be-v0-wit4340w4f1b1.jpg?auto=webp&s=8d8d6f25a8f88adf255cf336c2d0678cdac027ca'
  },
  {
    title: 'The Second Coming of Gluttony',
    chapters: 551,
    imageUrl: 'https://static.wikia.nocookie.net/the-second-coming-of-avarice/images/2/2e/Seol_Jihu.jpg/revision/latest/scale-to-width-down/1200?cb=20191018051451'
  },
  {
    title: 'Omniscient Readers Viewpoint',
    chapters: 554,
    imageUrl: 'https://preview.redd.it/ive-to-say-orv-is-really-boring-and-gets-dragged-out-sm-its-v0-8kv0xkz6bi6a1.jpg?auto=webp&s=d34afbb151bc7259eebed00c4307c7e6c1ecb848'
  }
];

export default function Library() {
  const { appliedTheme } = useThemeContext();
  const { value: novelRows } = useNovelRowsContext();

  const getNovelContainerStyle = () => {
    const novelsInSingleRow = parseInt(novelRows, 10);
    const screenWidth = Dimensions.get('window').width;
    const novelWidth = screenWidth / novelsInSingleRow - 24; // Subtracting gap to account for spacing
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

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.background }]}>
      <View style={styles.header}>
        <SearchBar />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        <View style={styles.novelScrollView}>
          {novels.map((novel, index) => {
            const novelStyle = getNovelContainerStyle();
            return (
              <View key={index} style={[styles.novelContainer, { width: novelStyle.width }]}>
                <Image
                  style={[styles.novelLogo, { height: novelStyle.height }]}
                  source={{
                    uri: novel.imageUrl,
                  }}
                />
                <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12 }}>
                  {novel.title}
                </Text>
                <View style={[styles.chaptersRemain, { backgroundColor: appliedTheme.colors.primary }]}>
                  <Text style={{ color: appliedTheme.colors.text }}>{novel.chapters}</Text>
                </View>
              </View>
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
