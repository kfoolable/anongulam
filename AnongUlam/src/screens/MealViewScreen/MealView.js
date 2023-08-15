import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image} from 'react-native';

const MealView = ({route}) => {
  const [meal, setMeal] = useState(null);

  // Get the meal_id parameter from the navigation route
  const {meal_id, user_id} = route.params;

  useEffect(() => {
    fetch(`http://10.0.2.2:3000/meals/${meal_id}`)
      .then(response => response.json())
      .then(data => {
        setMeal(data.meal);
      })
      .catch(error => console.error('Error fetching meal:', error));
  }, [meal_id]);

  const handleAddToGroceryList = () => {
    // Log the ingredient_ids to check if they are being passed properly
    /*console.log(
    'ingredient_ids:',
    meal?.ingredients.map(ingredient => ingredient.ingredient_id),
  );*/

    // Get the ingredient_ids, quantities, and units_of_measurement
    const ingredientIds = meal?.ingredients.map(
      ingredient => ingredient.ingredient_id,
    );
    const quantities = meal?.ingredients.map(ingredient => ingredient.quantity);
    const unitsOfMeasurement = meal?.ingredients.map(
      ingredient => ingredient.unit_of_measurement,
    );

    // Make a POST request to the endpoint to add the ingredients to the grocery list
    fetch('http://10.0.2.2:3000/add-to-grocery-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        meal_id: meal?.meal_id,
        ingredient_ids: ingredientIds,
        quantities: quantities, // Pass the quantities to the backend
        units_of_measurement: unitsOfMeasurement, // Pass the units_of_measurement to the backend
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ingredients already in Grocery List');
        }
        return response.json();
      })
      .then(data => {
        //Log to check if ingredients are inserted successfully
        //console.log('Ingredients added to grocery list:', data.groceryItems);
        // Optionally, you can add a notification or alert to inform the user that the ingredients have been added to the grocery list

        Alert.alert(
          'Ingredients added successfully to your grocery list',
          'The ingredients for this meal have been added to your grocery list.',
        );
      })
      .catch(error => {
        if (error.message === 'Ingredients already in Grocery List') {
          Alert.alert(
            'Ingredients already in Grocery List',
            'The ingredients for this meal are already in your grocery list.',
          );
        } else {
          console.error('Error adding ingredients to grocery list:', error);
        }
      });
  };

  // Sort the recipe_steps based on the step_order before rendering
  const sortedRecipeSteps = meal?.recipe_steps.sort(
    (a, b) => a.step_order - b.step_order,
  );

  return (
    <View style={styles.root}>
      <ScrollView>
        {/* Render the meal photo */}
        {meal?.photo_filepath && (
          <Image
            source={{
              uri: `http://10.0.2.2:3000${meal.photo_filepath}`,
            }}
            style={styles.mealImg}
            resizeMode="cover"
          />
        )}
        <View style={styles.mealInfo}>
          <Text style={styles.title}>{meal?.meal_name}</Text>
          <Text style={styles.calStyle}>{`${meal?.calories} Calories`}</Text>

          {/* Display other meal information here */}
          <View style={styles.mealContainer}>
            <View>
              <Text style={styles.bitTitle}>Ingredients</Text>
              {meal?.ingredients.map(ingredient => (
                <Text key={ingredient.ingredient_id}>
                  {`${ingredient.quantity} ${ingredient.unit_of_measurement} of ${ingredient.ingredient_name}`}
                </Text>
              ))}
            </View>
            <View>
              <Text style={styles.bitTitle}>Instructions</Text>
              {sortedRecipeSteps?.map(step => (
                <Text
                  key={
                    step.step_id
                  }>{`Step ${step.step_order}: ${step.step_description}`}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Conditionally render the "Add Ingredients to Grocery List" button */}
      {meal && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToGroceryList}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
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
