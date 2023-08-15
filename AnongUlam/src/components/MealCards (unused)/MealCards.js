import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

const MealCards = ({email, password, navigation}) => {
  const [weeklyMeals, setWeeklyMeals] = useState([]);

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      try {
        // Fetch weekly meals data from the backend using the user's email and password
        const response = await fetch(
          `http://10.0.2.2:3000/weekly-meals/${email}/${password}`,
        );

        if (!response.ok) {
          // Handle error responses here if needed
          console.error('Error fetching weekly meals:', response.statusText);
          return;
        }

        const data = await response.json();

        // Update the state with the fetched weekly meals data
        setWeeklyMeals(data);
      } catch (error) {
        console.error('Error fetching weekly meals:', error);
      }
    };

    fetchWeeklyMeals();
  }, [email, password]);

  // Array of meal types corresponding to the first three meals
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Meals</Text>
      <ScrollView horizontal={true}>
        <View style={styles.mealsCont}>
          {weeklyMeals.slice(0, 3).map((meal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.mealWrapper}
              onPress={() => {
                // Navigate to the MealView screen with the meal data
                navigation.navigate('MealView', {meal_id: meal.meal_id});
              }}>
              <View style={styles.mealCont}>
                <View style={styles.mealImg} />
                <Text style={styles.mealText}>{mealTypes[index]}</Text>
              </View>
              <Text style={styles.mealName}>{meal.meal_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  mealsCont: {
    flexDirection: 'row',
    //marginHorizontal: 10,
  },
  mealWrapper: {
    justifyContent: 'flex-start',
    //alignItems: 'center', // Center the content inside the wrapper
  },
  mealName: {
    flexWrap: 'wrap', // Allow text to wrap to the next line
    marginLeft: 10,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
    maxWidth: 140, // Limit the maximum width of the text
  },
  mealCont: {
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 5,
    height: 190,
    width: 160,
    overflow: 'hidden',
  },
  mealImg: {
    backgroundColor: 'grey',
    height: 145,
    width: 160,
  },
  mealText: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 10,
    fontWeight: '500',
  },
});


export default MealCards;
