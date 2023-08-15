import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

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


import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React, {useState, useEffect} from 'react';
import TopBar from '../TopBar';
import MealCards from '.';
import {useRoute} from '@react-navigation/native'; // Import the useRoute hook

const WeeklyMeal = ({navigation}) => {
  const route = useRoute(); // Use the useRoute hook to get access to the route object
  const {email, password} = route.params;

  return (
    <View style={styles.root}>
      <TopBar email={email} password={password} />
      <ScrollView style={styles.weeklyContainer}>
        <Text style={styles.dateIndicator}>Today is Monday, 06/29</Text>
        <MealCards email={email} password={password} navigation={navigation} />
        <Text style={styles.upComing}>Upcoming Meals</Text>
        <MealCards email={email} password={password} navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  weeklyContainer: {
    margin: 5,
  },
  dateIndicator: {
    margin: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: '400',
  },
  noMealsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    margin: 20,
  },
  upComing: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    margin: 10,
  },
});

export default WeeklyMeal;
