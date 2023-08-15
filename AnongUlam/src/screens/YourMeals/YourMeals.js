import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

const YourMeals = ({route, navigation}) => {
  const {user_id, email, password} = route.params;
  const [userMeals, setUserMeals] = useState([]);

  // Function to fetch user meals
  const fetchUserMeals = () => {
    fetch(`http://10.0.2.2:3000/your-meals?user_id=${user_id}`, {
      // ... (headers and other configurations if required)
    })
      .then(response => response.json())
      .then(data => {
        setUserMeals(data);
      })
      .catch(error => console.error('Error fetching user meals:', error));
  };

  useEffect(() => {
    // Fetch meals added by the logged-in user when the component mounts
    fetchUserMeals();
  }, [user_id]);

  // Use useFocusEffect to refetch user meals whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserMeals();
    }, []),
  );

  const handleEditMeal = meal_id => {
    // Navigate to the EditMeal screen with the selected meal_id as a parameter
    navigation.navigate('EditMeal', {meal_id, user_id, email, password});
  };

  return (
    <View style={styles.rootContainer}>
      <TopBar email={email} password={password} user_id={user_id} />
      <View style={styles.container}>
        <Text style={styles.title}>Your Meals</Text>
        <FlatList
          data={userMeals}
          keyExtractor={item => item.meal_id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => handleEditMeal(item.meal_id)}>
              <View style={styles.mealContainer}>
                <Text style={styles.mealName}>{item.meal_name}</Text>
                <Text style={styles.mealDetail}>
                  Diet Preference: {item.diet_preference}
                </Text>
                <Text style={styles.mealDetail}>
                  Food Restrictions: {item.food_restrictions.join(', ')}
                </Text>
                <Text style={styles.mealDetail}>Calories: {item.calories}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },
  mealContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealDetail: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default YourMeals;
