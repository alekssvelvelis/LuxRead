import * as React from 'react';
import { View } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface SearchBarProps {
  theme: {
    colors: {
      text: string;
    };
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ theme }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={{flex: 1, display: 'flex', alignItems: 'center', marginTop: 28}}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        mode='bar'
        traileringIcon='triangle-outline'
        style={{width: '90%'}}
      />
    </View>
  );
};

export default SearchBar;

