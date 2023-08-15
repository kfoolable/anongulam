import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import TopBar from '../../components/TopBar';

const SearchScreen = ({route, navigation}) => {
  const {user_id, email, password} = route.params;
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // User's diet preference and food restrictions
  const [dietPreference, setDietPreference] = useState('None');
  const [foodRestrictions, setFoodRestrictions] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      // Add console logs here to check the values
      //console.log('Diet Preference:', dietPreference);
      //console.log('Food Restrictions:', foodRestrictions);
      try {
        const url = `http://10.0.2.2:3000/search?q=${searchText}&diet_preference=${dietPreference}&food_restrictions=${foodRestrictions.join(
          ',',
        )}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Error fetching search results');
        }

        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      }
    };

    if (searchText !== '') {
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchText, dietPreference, foodRestrictions]);

  const handleMealClick = meal => {
    navigation.navigate('MealView', {meal_id: meal.meal_id, user_id});
  };

  return (
    <View style={styles.rootContainer}>
      <TopBar email={email} password={password} user_id={user_id} />
      <ScrollView style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for meals or ingredients..."
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />

        <View style={styles.myRow}>
          {/* Render meal items */}
          {searchResults.map((meal, index) => (
            <TouchableOpacity
              key={`${meal.meal_id}-${index}`}
              style={styles.myViewContainer}
              onPress={() => handleMealClick(meal)}>
              {meal.photo_filepath ? (
                <Image
                  source={{uri: `http://10.0.2.2:3000${meal.photo_filepath}`}}
                  style={styles.myViewImage}
                />
              ) : (
                <View style={styles.myViewPlaceholder}></View>
              )}
              <View style={styles.mealNameContainer}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.myViewContainer}></View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  myRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  myViewContainer: {
    width: '32%',
    marginBottom: 10,
  },
  myViewImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
    backgroundColor: 'grey',
  },
  myViewPlaceholder: {
    width: '100%',
    height: 130,
    backgroundColor: '#eee',
  },
  mealNameContainer: {
    padding: 5,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
