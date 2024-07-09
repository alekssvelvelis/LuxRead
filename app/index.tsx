import React, { useEffect, useState } from 'react';
import { Text, ScrollView, useColorScheme, View, StyleSheet, Image } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ThemeSelector from '@/components/ThemeSelector';
import { lightTheme, darkTheme, subThemes } from '@/constants/themes';
import { getUserTheme } from '@/utils/asyncStorage';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useNavigation } from 'expo-router';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  Montserrat_100Thin_Italic,
  Montserrat_200ExtraLight_Italic,
  Montserrat_300Light_Italic,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium_Italic,
  Montserrat_600SemiBold_Italic,
  Montserrat_700Bold_Italic,
  Montserrat_800ExtraBold_Italic,
  Montserrat_900Black_Italic,
} from '@expo-google-fonts/montserrat';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const navigation = useNavigation();
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<string>(`${systemTheme}-default`);
  let [fontsLoaded] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_100Thin_Italic,
    Montserrat_200ExtraLight_Italic,
    Montserrat_300Light_Italic,
    Montserrat_400Regular_Italic,
    Montserrat_500Medium_Italic,
    Montserrat_600SemiBold_Italic,
    Montserrat_700Bold_Italic,
    Montserrat_800ExtraBold_Italic,
    Montserrat_900Black_Italic,
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getUserTheme();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const [primaryTheme, subThemeName] = theme.split('-') as ['light' | 'dark', | 'ruby' | 'aquamarine' | 'citrine'];
  const baseTheme = primaryTheme === 'light' ? lightTheme : darkTheme;

  const appliedTheme = {
    ...baseTheme,
    ...subThemes[subThemeName],
    colors: {
      ...baseTheme.colors,
      ...(subThemes[subThemeName]?.colors ?? {}),
    },
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <PaperProvider theme={appliedTheme}>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: appliedTheme.colors.background, }}>
          <View style={styles.container}>
            <View style={styles.header}>
              <SearchBar theme={appliedTheme} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
              <Text style={{ color: appliedTheme.colors.primary }}>The primary text color is: {appliedTheme.colors.primary}</Text>
              <Text style={{ color: appliedTheme.colors.accent }}>The primary background color is: {appliedTheme.colors.background}</Text>
              {/* <ThemeSelector onThemeChange={setTheme} /> */}
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
            </ScrollView>
            <View style={styles.footer}>
              <Footer />
            </View>
          </View>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
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
    top: 10,
    right: 5,
    borderRadius: 4,
    padding: 4,
  }
});
