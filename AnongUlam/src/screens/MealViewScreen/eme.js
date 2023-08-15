import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const MealView = ({route}) => {
  const [meal, setMeal] = useState(null);

  // Get the meal_id parameter from the navigation route
  const {meal_id} = route.params;

  useEffect(() => {
    fetch(`http://10.0.2.2:3000/meals/${meal_id}`)
      .then(response => response.json())
      .then(data => {
        //console.log('Meal Data:', data.meal); // Access 'meal' from the response data
        setMeal(data.meal); // Set the meal state with 'meal' from the response data
      })
      .catch(error => console.error('Error fetching meal:', error));
  }, [meal_id]);

  // Check if the meal data is still loading
  if (!meal) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.root}>
      <ScrollView>
        <View style={styles.mealImg}></View>
        <View style={styles.mealInfo}>
          <Text style={styles.title}>{meal.meal_name}</Text>
          <Text style={styles.calStyle}>{`${meal.calories} Calories`}</Text>
          {/* Display other meal information here */}
          <View style={styles.mealContainer}>
            <View>
              <Text style={styles.bitTitle}>Ingredients</Text>
              {meal.ingredients.map(ingredient => (
                <Text key={ingredient.ingredient_id}>
                  {`${ingredient.quantity} ${ingredient.unit_of_measurement} of ${ingredient.ingredient_name}`}
                </Text>
              ))}
            </View>
            <View>
              <Text style={styles.bitTitle}>Instructions</Text>
              {meal.recipe_steps.map(step => (
                <Text
                  key={
                    step.step_id
                  }>{`Step ${step.step_order}: ${step.step_description}`}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add the button container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mealImg: {
    height: 250,
    backgroundColor: 'grey',
  },
  mealInfo: {
    margin: 20,
    flex: 1,
  },
  mealContainer: {
    marginTop: 20,
  },
  calStyle: {
    fontSize: 15,
    color: 'black',
    fontWeight: '400',
  },
  title: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  bitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  // Button container styles
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

export default MealView;
