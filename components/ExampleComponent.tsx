import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const ExampleComponent = () => {
  const [novels, setNovels] = useState([]);

  useEffect(() => {
    axios.get('https://luxread-puppeteer.vercel.app/api/scrape')
      .then(response => {
        setNovels(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.novelItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.link}>{item.link}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={novels}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  novelItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: 'blue',
  },
});

export default ExampleComponent;
