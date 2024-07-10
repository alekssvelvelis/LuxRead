import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import SearchBar from '@/components/SearchBar';
import { useThemeContext } from '@/contexts/ThemeContext';
export default function Library() {
  const { theme, setTheme, appliedTheme } = useThemeContext();
    return(
        <View style={[styles.container, {backgroundColor: appliedTheme.colors.background}]}>
            <View style={styles.header}>
              <SearchBar />
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
              <Text style={{ color: appliedTheme.colors.primary }}>The primary text color is: {appliedTheme.colors.primary}</Text>
              <Text style={{ color: appliedTheme.colors.test }}>The primary background color is: {appliedTheme.colors.test}</Text>
              <View style={styles.novelScrollView}>
                <View style={styles.novelContainer}>
                  <Image
                    style={styles.novelLogo}
                    source={{
                      uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPI9FaQTXTWjl3k_PCKvDr5-E2hGyvuYjAmg&s',
                    }}
                  />
                  <Text numberOfLines={2} style={{color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12}}>Lord of the Mysteries</Text>
                  <View style={[styles.chaptersRemain, {backgroundColor: appliedTheme.colors.primary}]}>
                    <Text style={{color: appliedTheme.colors.text,}}>1451</Text>
                  </View>
                </View>
                <View style={styles.novelContainer}>
                  <Image
                    style={styles.novelLogo}
                    source={{
                      uri: 'https://m.media-amazon.com/images/I/41ZnppX1ytL.jpg',
                    }}
                  />
                  <Text numberOfLines={2} style={{color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12}}>Shadow Slave</Text>
                  <View style={[styles.chaptersRemain, {backgroundColor: appliedTheme.colors.primary}]}>
                    <Text style={{color: appliedTheme.colors.text,}}>456</Text>
                  </View>
                </View>
                <View style={styles.novelContainer}>
                  <Image
                    style={styles.novelLogo}
                    source={{
                      uri: 'https://preview.redd.it/mark-my-words-tbate-anime-is-in-production-and-it-will-be-v0-wit4340w4f1b1.jpg?auto=webp&s=8d8d6f25a8f88adf255cf336c2d0678cdac027ca',
                    }}
                  />
                  <Text numberOfLines={2} style={{color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12}}>Beginning After the End</Text>
                  <View style={[styles.chaptersRemain, {backgroundColor: appliedTheme.colors.primary}]}>
                    <Text style={{color: appliedTheme.colors.text,}}>456</Text>
                  </View>
                </View>
                <View style={styles.novelContainer}>
                  <Image
                    style={styles.novelLogo}
                    source={{
                      uri: 'https://static.wikia.nocookie.net/the-second-coming-of-avarice/images/2/2e/Seol_Jihu.jpg/revision/latest/scale-to-width-down/1200?cb=20191018051451',
                    }}
                  />
                  <Text numberOfLines={2} style={{color: appliedTheme.colors.text, fontFamily: 'Montserrat_400Regular', fontSize: 12}}>The Second Coming of Gluttony Slave</Text>
                  <View style={[styles.chaptersRemain, {backgroundColor: appliedTheme.colors.primary}]}>
                    <Text style={{color: appliedTheme.colors.text,}}>551</Text>
                  </View>
                </View>
              </View>
            </ScrollView></View>
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
    footer: {
      height: 70,
      justifyContent: 'center',
    },
    novelScrollView:{
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      gap: 24,
      flexWrap: 'wrap'
    },
    novelContainer: {
      minHeight: 150,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 100,
      overflow: 'scroll',
      position: 'relative',
      maxHeight: 200
    },
    novelLogo: {
      width: 100,
      height: 150,
      borderRadius: 4,
    },
    chaptersRemain:{
      position: 'absolute',
      top: 6,
      right: 6,
      borderRadius: 4,
      padding: 4,
    }
  });
  