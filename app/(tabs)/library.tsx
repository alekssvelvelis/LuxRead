import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import SearchBar from '@/components/SearchBar';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useNovelRowsContext } from '@/contexts/NovelRowsContext';
import { useRouter } from 'expo-router';

const novels = [
  {
    id: 1,
    title: 'Lord of the Mysteries',
    author: 'Cuttlefish That Loves Diving',
    chapters: 1451,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPI9FaQTXTWjl3k_PCKvDr5-E2hGyvuYjAmg&s',
    description: `In the waves of steam and machinery, who could achieve extraordinary? In the fogs of history and darkness, who was whispering? I woke up from the realm of mysteries and opened my eyes to the world. Firearms, cannons, battleships, airships, and difference machines. Potions, divination, curses, hanged-man, and sealed artifacts… The lights shone brightly, yet the secrets of the world were never far away. This was a legend of the “fool”.'`,
    genres: 'Fantasy, Action, Adventure, Mystery, Supernatural, Tragedy',
  },
  {
    id: 2,
    title: 'Shadow Slave',
    author: 'Guiltythree',
    chapters: 456,
    imageUrl: 'https://m.media-amazon.com/images/I/41ZnppX1ytL.jpg',
    description: `Growing up in poverty, Sunny never expected anything good from life. However, even he did not anticipate being chosen by the Nightmare Spell and becoming one of the Awakened - an elite group of people gifted with supernatural powers. Transported into a ruined magical world, he found himself facing against terrible monsters - and other Awakened - in a deadly battle of survival. What's worse, the shadow powers he received happened to possess a small, but potentially fatal side effect...`,
    genres: 'Fantasy, Action, Adventure, Mystery, Supernatural, Tragedy',
  },
  {
    id: 3,
    title: 'Beginning After the End',
    author: 'Turtleme93',
    chapters: 456,
    imageUrl: 'https://preview.redd.it/mark-my-words-tbate-anime-is-in-production-and-it-will-be-v0-wit4340w4f1b1.jpg?auto=webp&s=8d8d6f25a8f88adf255cf336c2d0678cdac027ca',
    description: `King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Beneath the glamorous exterior of a powerful king lurks the shell of man, devoid of purpose and will. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life. Correcting the mistakes of his past will not be his only challenge, however. Underneath the peace and prosperity of the new world is an undercurrent threatening to destroy everything he has worked for, questioning his role and reason for being born again.`,
    genres: 'Fantasy, Action, Adventure, Mystery, Supernatural, Tragedy',
  },
  {
    id: 4,
    title: 'The Second Coming of Gluttony',
    author: 'Ro Yu-jin',
    chapters: 551,
    imageUrl: 'https://static.wikia.nocookie.net/the-second-coming-of-avarice/images/2/2e/Seol_Jihu.jpg/revision/latest/scale-to-width-down/1200?cb=20191018051451',
    description: `He was an addict, a loser, a despicable human being. But, one fleeting dream that may not have been a dream at all reawakens his once-lost senses. Possessing a very unique ability, he would use that, and the dream, to forge his path in the world now known as the Lost Paradise. “The son of god Gula has returned.” I was lost in the world of gambling. I turned my back on my family and even betrayed my lover. I wasted every day of my life. It was a life of trash. The reality told me thus: That I would amount to nothing no matter what I did. In order to change my pathetic life, I chose fantasy, instead. Even then, it was the same story. I wondered if salvation would come at the end of the long road. But, I was forced to kneel down in defeat in front of a powerful entity. The tower I built up with my own hands crumbled into nothingness. Just for once, I dearly wished to know the truth about myself.  – Come closer, my child… I will not hold back this time.`,
    genres: 'Fantasy, Action, Adventure, Mystery, Supernatural, Tragedy',
  },
  {
    id: 5,
    title: 'Omniscient Readers Viewpoint',
    author: 'Sing-Shong',
    chapters: 554,
    imageUrl: 'https://preview.redd.it/ive-to-say-orv-is-really-boring-and-gets-dragged-out-sm-its-v0-8kv0xkz6bi6a1.jpg?auto=webp&s=d34afbb151bc7259eebed00c4307c7e6c1ecb848',
    description: `Only I know the end of this world. One day our MC finds himself stuck in the world of his favorite webnovel. What does he do to survive? It is a world struck by catastrophe and danger all around. His edge? He knows the plot of the story to end. Because he was the sole reader that stuck with it. Read his story to see how he survives!`,
    genres: 'Fantasy, Action, Adventure, Mystery, Supernatural, Tragedy',
  }
];

export default function Library() {
  const { appliedTheme } = useThemeContext();
  const { value: novelRows } = useNovelRowsContext();
  const router = useRouter();

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

  const handleNovelPress = (novel: any) => {
    router.navigate({ pathname: `novel/[id]`, params: novel });
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
              <TouchableOpacity key={index} onPress={() => handleNovelPress(novel)} style={[styles.novelContainer, { width: novelStyle.width }]}>
                <Image
                  style={[styles.novelLogo, { height: novelStyle.height }]}
                  source={{ uri: novel.imageUrl }}
                />
                <Text numberOfLines={2} style={{ color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12 }}>
                  {novel.title}
                </Text>
                <View style={[styles.chaptersRemain, { backgroundColor: appliedTheme.colors.primary }]}>
                  <Text style={{ color: appliedTheme.colors.text }}>{novel.chapters}</Text>
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
