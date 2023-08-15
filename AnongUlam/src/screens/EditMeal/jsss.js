import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';

const EditMeal = ({route, navigation}) => {
  const {meal_id, user_id} = route.params;
  const [meal, setMeal] = useState(null);
  const [mealName, setMealName] = useState('');
  const [dietPreference, setDietPreference] = useState('');
  const [foodRestrictions, setFoodRestrictions] = useState([]); // Initialize as an empty array
  const [calories, setCalories] = useState('');
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [ingredients, setIngredients] = useState([
    {ingredient_name: '', quantity: 0, unit: ''},
  ]);

  const [isUpdatingIndividualStep, setIsUpdatingIndividualStep] =
    useState(false);
  const [isUpdatingIndividualIngredient, setIsUpdatingIndividualIngredient] =
    useState(false);
  const [editedStepDescription, setEditedStepDescription] = useState('');

  const [editedIngredientName, setEditedIngredientName] = useState('');

  // Add a new state variable and its setter function
  const [stepIdToUpdate, setStepIdToUpdate] = useState(null);

  const [dietPreferenceModalVisible, setDietPreferenceModalVisible] =
    useState(false);
  const [foodRestrictionsModalVisible, setFoodRestrictionsModalVisible] =
    useState(false);

  const dietPreferenceOptions = [
    'Keto',
    'Halal',
    'Paleo',
    'Vegetarian',
    'Pescatarian',
    'None',
  ]; // Add more diet preference options as needed
  const foodRestrictionOptions = [
    'Sugary',
    'Fatty',
    'Wheat',
    'Soy',
    'Seafoods',
    'Peanuts',
    'None',
  ];

  const handleAddFoodRestriction = restriction => {
    setFoodRestrictions([...foodRestrictions, restriction]);
  };

  const handleRemoveFoodRestriction = restriction => {
    setFoodRestrictions(foodRestrictions.filter(item => item !== restriction));
  };

  useEffect(() => {
    // Fetch the meal details for the given meal_id when the component mounts
    fetch(`http://10.0.2.2:3000/meals/${meal_id}`)
      .then(response => response.json())
      .then(data => {
        setMeal(data.meal);
        setMealName(data.meal.meal_name);
        setDietPreference(data.meal.diet_preference);

        // Handle the case where food_restrictions is null or undefined
        // Initialize foodRestrictions as an empty array in this case
        setFoodRestrictions(data.meal.food_restrictions || []);
        setCalories(data.meal.calories.toString());

        // Inside the useEffect callback
        const orderedRecipeSteps = data.meal?.recipe_steps?.sort(
          (a, b) => a.step_order - b.step_order,
        );

        /*setRecipeSteps(
          orderedRecipeSteps?.map(step => step.step_description) || [],
        );*/
        setRecipeSteps(orderedRecipeSteps || []);
        /*setIngredients(
          data.meal?.ingredients?.map(
            ingredient => ingredient.ingredient_name,
          ) || [],
        );*/
        // Log the ingredients data
        //console.log('Ingredients data:', data.meal?.ingredients);
        setIngredients(data.meal?.ingredients || []);
      })
      .catch(error => console.error('Error fetching meal details:', error));
  }, [meal_id]);

  const handleEditStep = (index, stepId) => {
    // Set the state variables to indicate individual step update
    setIsUpdatingIndividualStep(true);
    setIsUpdatingIndividualIngredient(false);
    // Set the stepIdToUpdate to the step_id of the step being edited
    setStepIdToUpdate(stepId);
    // Set the editedStepDescription to the value of the step being edited
    setEditedStepDescription(recipeSteps[index].step_description);
  };

  const handleEditIngredient = index => {
    // Set the state variables to indicate individual ingredient update
    setIsUpdatingIndividualIngredient(true);
    setIsUpdatingIndividualStep(false);
    // Set the editedIngredientName to the value of the ingredient being edited
    setEditedIngredientName(ingredients[index]);
  };

  // Update the handleUpdateRecipeStep function to take the index as an argument
  const handleUpdateRecipeStep = (index, text) => {
    const newRecipeSteps = [...recipeSteps];
    newRecipeSteps[index].step_description = text;
    setRecipeSteps(newRecipeSteps);
  };

  const handleDeleteRecipeStep = (index, stepId) => {
    console.log('Recipe Steps:', recipeSteps);
    console.log('Step ID to be deleted:', stepId);
    // Call the backend API to delete the recipe step from the database
    fetch(`http://10.0.2.2:3000/meals/${meal_id}/recipe_steps/${stepId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Recipe step deleted successfully:', data);
        // If the recipe step is deleted successfully from the backend,
        // update the local state by removing the recipe step at the specified index
        const newRecipeSteps = [...recipeSteps];
        newRecipeSteps.splice(index, 1);
        setRecipeSteps(newRecipeSteps);
      })
      .catch(error => console.error('Error deleting recipe step:', error));
  };

  const handleAddRecipeStep = () => {
    setRecipeSteps([...recipeSteps, '']);
  };

  const handleUpdateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleDeleteIngredient = (index, ingredientId) => {
    //console.log('Ingredients data:', ingredients);
    //console.log('Index to be deleted:', index);
    //console.log('Ingredient ID to be deleted:', ingredientId);

    // Call the backend API to delete the ingredient from the database
    fetch(`http://10.0.2.2:3000/meals/${meal_id}/ingredients/${ingredientId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Ingredient deleted successfully:', data);
        // If the ingredient is deleted successfully from the backend,
        // update the local state by removing the ingredient at the specified index
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
      })
      .catch(error => console.error('Error deleting ingredient:', error));
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {ingredient_name: '', quantity: 0, unit: ''},
    ]);
  };

  /*const handleSaveChanges = () => {
    // Convert recipeSteps and ingredients to arrays of strings
    const formattedRecipeSteps = recipeSteps.map(step => ({
      step_description: step,
    }));
    const formattedIngredients = ingredients.map(ingredient => ({
      ingredient_name: ingredient,
    }));

    // Save the edited meal details in the backend
    fetch(`http://10.0.2.2:3000/meals/${meal_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_name: mealName,
        diet_preference: dietPreference,
        food_restrictions: foodRestrictions,
        calories: parseInt(calories),
      }),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the backend, e.g., show a success message
        console.log('Meal details updated successfully');

        // Now, call the two separate endpoints to update recipe_steps and ingredients
        fetch(`http://10.0.2.2:3000/meals/${meal_id}/recipe_steps`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_steps: formattedRecipeSteps,
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Recipe steps updated successfully');
          })
          .catch(error => console.error('Error updating recipe steps:', error));

        fetch(`http://10.0.2.2:3000/meals/${meal_id}/ingredients`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients: formattedIngredients,
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Ingredients updated successfully');
          })
          .catch(error => console.error('Error updating ingredients:', error));

        // After all updates are successful, navigate back to the YourMeals screen
        navigation.navigate('YourMeals', {user_id});
      })
      .catch(error => console.error('Error updating meal:', error));
  };*/

  const handleSaveChanges = () => {
    // Convert recipeSteps and ingredients to arrays of strings
    const formattedRecipeSteps = recipeSteps.map(step => ({
      step_id: step.step_id,
      step_description: step.step_description,
    }));
    const formattedIngredients = ingredients.map(ingredient => ({
      ingredient_id: ingredient.ingredient_id,
      ingredient_name: ingredient.ingredient_name,
    }));

    // Save the edited meal details in the backend
    fetch(`http://10.0.2.2:3000/meals/${meal_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_name: mealName,
        diet_preference: dietPreference,
        food_restrictions: foodRestrictions,
        calories: parseInt(calories),
        recipe_steps: formattedRecipeSteps, // Use the formatted array
        ingredients: formattedIngredients, // Use the formatted array
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Meal details updated successfully');
        // Check if the user wants to update an individual step
        if (isUpdatingIndividualStep && stepIdToUpdate !== null) {
          // Find the index of the recipe step being edited
          const index = recipeSteps.findIndex(
            step => step.step_id === stepIdToUpdate,
          );

          if (index !== -1) {
            // If the index is valid, update the individual recipe step
            fetch(
              `http://10.0.2.2:3000/meals/${meal_id}/recipe_steps/${stepIdToUpdate}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  step_description: editedStepDescription, // Use the individual step description
                }),
              },
            )
              .then(response => response.json())
              .then(data => {
                console.log('Recipe step updated successfully');
                // Update the local state with the edited recipe step description
                const newRecipeSteps = [...recipeSteps];
                newRecipeSteps[index].step_description = editedStepDescription;
                setRecipeSteps(newRecipeSteps);

                // After updating the individual step, reset the editing state
                setIsUpdatingIndividualStep(false);
                setStepIdToUpdate(null);
                setEditedStepDescription(''); // Reset the edited step description
              })
              .catch(error =>
                console.error('Error updating recipe step:', error),
              );
          }
        }

        // After all updates are successful, navigate back to the YourMeals screen
        navigation.navigate('YourMeals', {user_id});
      })
      .catch(error => console.error('Error updating meal:', error));
  };

  const handleDeleteMeal = () => {
    // Show a confirmation alert before deleting the meal
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this meal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Send a DELETE request to the endpoint to delete the meal
            fetch(`http://10.0.2.2:3000/meals/${meal_id}`, {
              method: 'DELETE',
            })
              .then(response => response.json())
              .then(data => {
                // Handle the response from the backend, e.g., show a success message
                // or navigate back to the YourMeal screen after successful deletion
                console.log('Meal deleted successfully:', data);
                navigation.navigate('YourMeals', {user_id});
              })
              .catch(error => console.error('Error deleting meal:', error));
          },
        },
      ],
      {cancelable: false},
    );
  };

  if (!meal) {
    // If meal is null, show nothing until the data is fetched
    return null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.mealImg}></View>
      <ScrollView>
        <View style={styles.mealInfo}>
          <Text style={styles.title}>Edit Meal</Text>
          <TextInput
            style={styles.input}
            placeholder="Meal Name"
            value={mealName}
            onChangeText={setMealName}
          />
          {/* Diet Preference */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setDietPreferenceModalVisible(true)}>
            <Text>{dietPreference}</Text>
          </TouchableOpacity>
          {/* Food Restrictions */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setFoodRestrictionsModalVisible(true)}>
            <Text>
              {foodRestrictions.length > 0
                ? foodRestrictions.join(', ')
                : 'No food restrictions'}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
          {/* Render recipe steps */}
          <Text style={styles.subtitle}>Recipe Steps:</Text>
          {recipeSteps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <TextInput
                style={styles.input}
                value={
                  isUpdatingIndividualStep && stepIdToUpdate === step.step_id
                    ? editedStepDescription
                    : step.step_description
                }
                onChangeText={text => setEditedStepDescription(text)}
                onFocus={() => {
                  setIsUpdatingIndividualStep(true);
                  setIsUpdatingIndividualIngredient(false);
                  setStepIdToUpdate(step.step_id);
                  setEditedStepDescription(step.step_description);
                }}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecipeStep(index, step.step_id)}>
                <Text style={styles.buttonText}>Delete Step</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add new recipe step */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddRecipeStep}>
            <Text style={styles.buttonText}>Add Recipe Step</Text>
          </TouchableOpacity>

          {/* Render ingredients */}
          <Text style={styles.subtitle}>Ingredients:</Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientContainer}>
              <TextInput
                style={styles.ingredientInput}
                placeholder="Ingredient Name"
                value={ingredient.ingredient_name}
                onChangeText={text =>
                  handleUpdateIngredient(index, 'ingredient_name', text)
                }
              />
              <TextInput
                style={styles.quantityInput}
                placeholder="Quantity"
                value={ingredient.quantity.toString()}
                onChangeText={text => {
                  const numericValue = parseFloat(text);
                  handleUpdateIngredient(
                    index,
                    'quantity',
                    isNaN(numericValue) ? 0 : numericValue,
                  );
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.unitDropdown}
                onPress={() => handleOpenUnitModal(index)}>
                <Text style={styles.ingredientDropdownText}>
                  {ingredient.unit || 'Unit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteIngredientButton}
                onPress={() => handleDeleteIngredient(index)}>
                <Text style={styles.buttonText}>Delete Ingredient</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addIngredientButton}
            onPress={handleAddIngredient}>
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteMeal}>
            <Text style={styles.buttonText}>Delete Meal</Text>
          </TouchableOpacity>

          {/* Diet Preference Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={dietPreferenceModalVisible}
            onRequestClose={() => setDietPreferenceModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {dietPreferenceOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      setDietPreference(option);
                      setDietPreferenceModalVisible(false);
                    }}>
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setDietPreferenceModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Food Restrictions Modal */}
          <Modal
            visible={foodRestrictionsModalVisible}
            animationType="slide"
            transparent={true}>
            <View style={styles.modalContainer}>
              <ScrollView style={styles.modalContent}>
                {foodRestrictionOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      if (foodRestrictions.includes(option)) {
                        handleRemoveFoodRestriction(option);
                      } else {
                        handleAddFoodRestriction(option);
                      }
                    }}>
                    <Text>{option}</Text>
                    {foodRestrictions.includes(option) && (
                      <Text style={styles.modalSelected}>(Selected)</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setFoodRestrictionsModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    margin: 20,
  },
  mealImg: {
    height: 250,
    backgroundColor: 'grey',
    marginBottom: 20,
  },
  mealInfo: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#CD6D15',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  stepContainer: {
    marginBottom: 10,
    //flexDirection: 'row',
    //alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  modalCloseButton: {
    backgroundColor: 'red',
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalSelected: {
    color: 'green',
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 3,
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityInput: {
    flex: 1,
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unitDropdown: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    marginLeft: 8,
  },
  ingredientDropdownText: {
    fontSize: 14,
  },
  deleteIngredientButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 8,
    marginLeft: 8,
  },
  addIngredientButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EditMeal;
