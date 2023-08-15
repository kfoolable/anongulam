import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import TopBar from '../../components/TopBar';
import {useRoute} from '@react-navigation/native';

const WeeklyMeal = ({navigation}) => {
  const route = useRoute();
  const {email, password, user_id} = route.params;
  const [meals, setMeals] = useState([]); // Initialize as an empty array
  const [weeklyMeals, setWeeklyMeals] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [nextDays, setNextDays] = useState([]);

  const [loading, setLoading] = useState(true);

  // Function to get meals for a specific day
  const getMealsForDay = mealsArray => {
    const mealsForDay = [];
    const availableMeals = mealsArray.length > 0 ? [...mealsArray] : [];

    for (let i = 0; i < 7; i++) {
      // Get three random meals for each day
      const mealsForCurrentDay = [];
      for (let j = 0; j < 3; j++) {
        if (availableMeals.length > 0) {
          // Get a random index within the available meals array
          const randomIndex = Math.floor(Math.random() * availableMeals.length);
          mealsForCurrentDay.push(availableMeals[randomIndex]);
        } else {
          // If there are no available meals, repeat the last meal in the array
          if (mealsForCurrentDay.length > 0) {
            mealsForCurrentDay.push(
              mealsForCurrentDay[mealsForCurrentDay.length - 1],
            );
          } else {
            // If there are no meals for this day at all, push an empty object
            mealsForCurrentDay.push({});
          }
        }
      }
      mealsForDay.push(mealsForCurrentDay);
    }
    return mealsForDay;
  };

  useEffect(() => {
    // Fetch weekly meals data from the backend using the user's email and password
    const fetchWeeklyMeals = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/weekly-meals/${email}/${password}`,
        );

        if (!response.ok) {
          throw new Error('Error fetching weekly meals');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setWeeklyMeals(data);
          setLoading(false);
        } else {
          // Handle the case when no weekly meals are available
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching weekly meals:', error);
        setLoading(false);
      }
    };

    fetchWeeklyMeals();
  }, []);

  useEffect(() => {
    // Get the current date and format it as 'Monday'
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      month: 'numeric',
      day: 'numeric',
    });
    setCurrentDate(currentDate);

    // Get the next day and format it as 'Tuesday'
    const weekDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const today = new Date();
    const nextDays = weekDays.map((day, index) => {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + index + 1);
      return nextDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
      });
    });
    setNextDays(nextDays);
  }, []);

  // Array of meal types corresponding to the first three meals
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  useEffect(() => {
    // Check if the weeklyMeals data is available and not empty
    if (Array.isArray(weeklyMeals) && weeklyMeals.length > 0) {
      // Get all meals organized by day (breakfast, lunch, dinner) for the entire week
      const mealsByDay = getMealsForDay(weeklyMeals);

      // Update the 'meals' state with all 21 meals for the entire week
      setMeals(mealsByDay);
    }
  }, [weeklyMeals]);

  // Function to navigate to MealView screen
  const handleToMealView = (meal_id, user_id) => {
    navigation.navigate('MealView', {
      meal_id: meal_id,
      user_id: user_id,
    });
  };

  return (
    <View style={styles.root}>
      <TopBar email={email} password={password} user_id={user_id} />
      <ScrollView style={styles.weeklyContainer}>
        <Text style={styles.dateIndicator}>Today is {currentDate}</Text>
        <View style={styles.container}>
          {/* Display loading indicator or Today's Meals */}
          {loading ? (
            <Text style={styles.noMealsText}>Loading...</Text>
          ) : (
            <>
              <Text style={styles.title}>Today's Meals</Text>
              <ScrollView horizontal={true}>
                <View style={styles.mealsCont}>
                  {/* Check if meals is an array before using map */}
                  {Array.isArray(meals) &&
                    meals[0].map((meal, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.mealWrapper}
                        onPress={() => handleToMealView(meal.meal_id, user_id)}>
                        <View style={styles.mealCont}>
                          <Image
                            source={{
                              uri: `http://10.0.2.2:3000${meal.photo_filepath}`,
                            }}
                            style={styles.mealImg}
                            resizeMode="cover"
                          />
                          <Text style={styles.mealText}>
                            {mealTypes[index]}
                          </Text>
                        </View>
                        <Text style={styles.mealName}>{meal.meal_name}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>
        {/* Display meals for the next six days */}
        {nextDays.slice(0, 6).map((nextDay, dayIndex) => (
          <View key={dayIndex} style={styles.container}>
            <Text style={styles.title}>{nextDay}</Text>
            <ScrollView horizontal={true}>
              <View style={styles.mealsCont}>
                {/* Check if meals is an array before using map */}
                {Array.isArray(meals[dayIndex + 1]) &&
                  meals[dayIndex + 1].map((meal, mealIndex) => (
                    <TouchableOpacity
                      key={mealIndex}
                      style={styles.mealWrapper}
                      onPress={() => handleToMealView(meal.meal_id, user_id)}>
                      <View style={styles.mealCont}>
                        <Image
                          source={{
                            uri: `http://10.0.2.2:3000${meal.photo_filepath}`,
                          }}
                          style={styles.mealImg}
                          resizeMode="cover"
                        />
                        <Text style={styles.mealText}>
                          {mealTypes[mealIndex]}
                        </Text>
                      </View>
                      <Text style={styles.mealName}>{meal.meal_name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          </View>
        ))}
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
  },
  mealWrapper: {
    justifyContent: 'flex-start',
  },
  mealName: {
    flexWrap: 'wrap',
    marginLeft: 10,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
    maxWidth: 140,
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

export default WeeklyMeal;
