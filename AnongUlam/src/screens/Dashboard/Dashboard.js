import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import TopBar from '../../components/TopBar';
import {useNavigation} from '@react-navigation/native';

import Logo from '../../../assets/images/smallImg.png';

const Dashboard = ({route}) => {
  const navigation = useNavigation();
  const [meals, setMeals] = useState([]);
  const {user_id, email, password, diet_preference} = route.params;

  const [mealOfTheDay, setMealOfTheDay] = useState(null);

  const fetchMealsAndSetMealOfTheDay = useCallback(async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password, diet_preference}), // Include dietPreference in the request
      });

      if (!response.ok) {
        console.error('Error fetching meals:', response.statusText);
        return;
      }

      const data = await response.json();
      setMeals(data.meals);

      // Update meal of the day based on the fetched meals
      setRandomMealOfTheDay(data.meals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  }, [email, password, diet_preference]); // Include dietPreference in the dependency array

  const setRandomMealOfTheDay = useCallback(meals => {
    const randomIndex = Math.floor(Math.random() * meals.length);
    const mealOfTheDay = meals[randomIndex];
    setMealOfTheDay(mealOfTheDay);
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    fetchMealsAndSetMealOfTheDay();
  }, [isFocused, fetchMealsAndSetMealOfTheDay]);

  const handleMealClick = meal => {
    navigation.navigate('MealView', {meal_id: meal.meal_id, user_id});
  };

  const handleWeeklyMealsClick = () => {
    navigation.navigate('WeeklyMeal', {email, password, user_id});
  };

  const handleAddMeal = () => {
    navigation.navigate('AddMeals', {email, password, user_id});
  };

  return (
    <View style={styles.rootContainer}>
      <TopBar email={email} password={password} user_id={user_id} />
      <ScrollView style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.motd}
          onPress={() => handleMealClick(mealOfTheDay)}>
          <Text style={styles.titles}>Featured Meal</Text>
          {mealOfTheDay && mealOfTheDay.photo_filepath ? (
            <Image
              source={{
                uri: `http://10.0.2.2:3000${mealOfTheDay.photo_filepath}`,
              }}
              style={styles.motdimg}
            />
          ) : (
            <View style={styles.motdimgPlaceholder}></View>
          )}
          {mealOfTheDay && (
            <Text style={styles.titles}>{mealOfTheDay.meal_name}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWeeklyMealsClick}>
          <View style={styles.ywm}>
            <Text style={styles.titles}>Your Weekly Meals</Text>
            <View style={styles.ywmBtnContainer}>
              <View style={styles.ywmBtn}>
                <Image
                  source={Logo}
                  style={styles.ywmsmallImg}
                  resizeMode="contain"
                />
                <Text style={styles.destxt}>
                  For a diet to live your best and healthiest self.
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Meals You Might Like */}
        <View style={styles.myl}>
          <Text style={styles.titles}>Meals you might like</Text>
          <View style={styles.mylRow}>
            {/* Add a conditional rendering check for meals */}
            {meals &&
              meals.slice(0, 3).map(meal => (
                <TouchableOpacity
                  key={meal.meal_id}
                  style={styles.mylViewContainer}
                  onPress={() => handleMealClick(meal)}>
                  {meal.photo_filepath ? (
                    <Image
                      source={{
                        uri: `http://10.0.2.2:3000${meal.photo_filepath}`,
                      }}
                      style={styles.mylViewImage}
                    />
                  ) : (
                    <View style={styles.mylViewPlaceholder}></View>
                  )}
                  <View style={styles.mealNameContainer}>
                    <Text style={styles.mealName}>{meal.meal_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: TopBar.height, // Add paddingTop to make space for the fixed TopBar
  },
  motd: {
    margin: 10,
  },
  motdimg: {
    height: 400,
    width: '100%',
    borderRadius: 10,
  },
  motdimgPlaceholder: {
    height: 400,
    width: '100%',
    backgroundColor: 'grey',
    borderRadius: 10,
  },
  titles: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 5,
  },
  ywm: {
    marginHorizontal: 10,
  },
  ywmBtnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ywmBtn: {
    borderWidth: 1,
    height: 70,
    width: '98%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ywmsmallImg: {
    height: '80%',
    width: 70,
    borderRadius: 10,
  },
  destxt: {
    color: 'black',
    flex: 1,
    marginLeft: 10,
  },
  myl: {
    margin: 10,
  },
  mylRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  mylViewContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  mylViewImage: {
    height: 120,
    width: 120,
    borderRadius: 10,
  },
  mylViewPlaceholder: {
    height: 120,
    width: 120,
    backgroundColor: 'grey',
    borderRadius: 10,
  },
  mealNameContainer: {
    width: 120,
    alignItems: 'center',
  },
  mealName: {
    marginTop: 5,
    color: 'black',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#CD6D15',
    borderRadius: 30,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: '500',
  },
});

export default Dashboard;
