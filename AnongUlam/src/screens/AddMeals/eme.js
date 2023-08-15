import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {Alert} from 'react-native';

const AddMeals = ({route, navigation}) => {
  const {user_id, email, password} = route.params;
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [dietPreference, setDietPreference] = useState('');
  const [foodRestrictions, setFoodRestrictions] = useState([]);
  const [isDietModalVisible, setDietModalVisible] = useState(false);
  const [isFoodRestrictionModalVisible, setFoodRestrictionModalVisible] =
    useState(false);
  const [recipeSteps, setRecipeSteps] = useState(['']);

  const [ingredientsData, setIngredientsData] = useState([
    {name: '', quantity: '', unit: ''},
  ]); // Array to store ingredient data

  // State for managing the unit of measurement modal
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(-1);

  const [isUnitModalVisible, setUnitModalVisible] = useState(false);

  // Define the options for the dropdown menu
  const dietOptions = [
    'Keto',
    'Paleo',
    'Halal',
    'Vegetarian',
    'Pescatarian',
    'None',
  ];
  const foodRestrictionOptions = [
    'Sugary',
    'Fatty',
    'Wheat',
    'Soy',
    'Seafoods',
    'Peanuts',
    'None',
  ];

  const unitOptions = [
    'grams',
    'teaspoon',
    'tablespoon',
    'handful',
    'piece',
    'slice',
    'ml',
    'cup',
    'pinch',
  ];

  // Function to handle selecting a diet preference from the dropdown menu
  const handleSelectDietPreference = selectedOption => {
    setDietPreference(selectedOption);
    setDietModalVisible(false); // Close the diet preference modal after selection
  };

  // Function to handle selecting multiple food restrictions from the dropdown menu
  const handleSelectFoodRestrictions = selectedOptions => {
    if (selectedOptions.includes('None')) {
      setFoodRestrictions(['None']);
    } else {
      setFoodRestrictions(selectedOptions);
    }
    setFoodRestrictionModalVisible(false);
  };

  // Function to handle adding a new recipe step
  const handleAddStep = () => {
    setRecipeSteps([...recipeSteps, '']); // Add an empty step to the array
  };

  // Function to update the recipe step at a specific index
  const handleUpdateStep = (index, text) => {
    const newRecipeSteps = [...recipeSteps];
    newRecipeSteps[index] = text;
    setRecipeSteps(newRecipeSteps);
  };

  // Function to handle removing a recipe step at a specific index
  const handleRemoveStep = index => {
    const newRecipeSteps = [...recipeSteps];
    newRecipeSteps.splice(index, 1); // Remove the step at the specified index
    setRecipeSteps(newRecipeSteps);
  };

  // Function to handle adding a new ingredient data
  const handleAddIngredientData = () => {
    setIngredientsData([
      ...ingredientsData,
      {name: '', quantity: '', unit: ''},
    ]);
  };

  // Function to update the ingredient data at a specific index and key
  const handleUpdateIngredient = (index, key, value) => {
    const newIngredientsData = [...ingredientsData];
    newIngredientsData[index][key] = value;
    setIngredientsData(newIngredientsData);
  };

  // Function to handle removing an ingredient data at a specific index
  const handleRemoveIngredient = index => {
    if (ingredientsData.length === 1) {
      // Prevent removing the last ingredient data
      return;
    }
    const newIngredientsData = [...ingredientsData];
    newIngredientsData.splice(index, 1); // Remove the ingredient at the specified index
    setIngredientsData(newIngredientsData);
  };

  // Function to open the unit of measurement modal for a specific ingredient
  const handleOpenUnitModal = index => {
    setSelectedIngredientIndex(index);
    setUnitModalVisible(true);
  };

  // Function to handle selecting a unit of measurement from the modal
  // TODO: Implement code to handle the unit selection and update the state accordingly
  const handleSelectUnit = unit => {
    // Update the selected unit for the ingredient at the selectedIngredientIndex
    const newIngredientsData = [...ingredientsData];
    newIngredientsData[selectedIngredientIndex].unit = unit;
    setIngredientsData(newIngredientsData);

    // Close the unit of measurement modal
    setUnitModalVisible(false);
  };

  const handleUploadImage = () => {
    // Implement your image upload logic here
    // For now, we can simply display an alert to indicate that the image upload function is called.
    alert('Image Upload Function Called');
  };

  //Saves meal infomation to database
  const handleSaveMeal = async () => {
    try {
      // Step 1: Send meal details to create a new meal
      const mealResponse = await fetch('http://10.0.2.2:3000/add-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id, // Pass the user_id obtained from the route.params
          mealName,
          calories,
          dietPreference,
          foodRestrictions,
        }),
      });

      if (mealResponse.status === 409) {
        // Meal with the same name already exists, show an alert to the user
        Alert.alert('Meal Exists', 'A meal with the same name already exists.');
        return;
      }

      if (!mealResponse.ok) {
        throw new Error('Failed to create a new meal.');
      }

      // Step 2: Get the generated meal_id from the response
      const mealData = await mealResponse.json();
      const mealId = mealData.meal_id;

      // Step 3: Send ingredients data to add ingredients to the meal
      await Promise.all(
        ingredientsData.map(async ingredient => {
          const ingredientResponse = await fetch(
            'http://10.0.2.2:3000/add-ingredient',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mealId: mealId,
                ingredientName: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              }),
            },
          );

          if (!ingredientResponse.ok) {
            throw new Error('Failed to add an ingredient to the meal.');
          }
        }),
      );

      // Step 4: Send recipe steps data to add recipe steps to the meal
      await Promise.all(
        recipeSteps.map(async (step, index) => {
          const stepResponse = await fetch(
            'http://10.0.2.2:3000/add-recipe-step',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mealId,
                stepOrder: index + 1,
                description: step,
              }),
            },
          );

          if (!stepResponse.ok) {
            throw new Error('Failed to add a recipe step to the meal.');
          }
        }),
      );

      // Step 5: Handling success
      alert('Meal saved successfully!');
      // Reset form fields or navigate to another screen

      // Navigate to the Dashboard screen after saving the meal
      navigation.navigate('Dashboard', {user_id: user_id, email, password});
    } catch (error) {
      // Step 6: Error handling
      console.error('Error:', error.message);
      // Display an error message to the user
      alert('Error occurred while saving the meal.');
    }
  };

  return (
    <ScrollView style={styles.rootContainer}>
      <View style={styles.topBar} />
      <View style={styles.container}>
        <Text style={styles.title}>Add Your Own Meals</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={mealName}
            placeholder="Meal Name"
            onChangeText={text => setMealName(text)}
          />
          <TextInput
            style={styles.input}
            value={calories}
            placeholder="Calories"
            onChangeText={text => setCalories(text)}
          />

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setDietModalVisible(true)}>
              <Text>{dietPreference || 'Diet Preference'}</Text>
              {/* You can place your dropdown icon here */}
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setFoodRestrictionModalVisible(true)}>
              <Text>
                {foodRestrictions.length === 0
                  ? 'Food Restrictions'
                  : foodRestrictions.join(', ')}
              </Text>
              {/* You can place your dropdown icon here */}
            </TouchableOpacity>
          </View>

          {/* Your Instructions Text Inputs */}
          {recipeSteps.map((step, index) => (
            <View key={index} style={styles.recipeStepContainer}>
              {/* Left Button to Add New Step */}
              {index === 0 && (
                <TouchableOpacity
                  style={styles.addStepButton}
                  onPress={handleAddStep}>
                  <Text style={styles.addStepButtonText}>+ Add Step</Text>
                </TouchableOpacity>
              )}
              {/* Recipe Step Text Input */}
              <TextInput
                style={styles.recipeStepInput}
                placeholder={`Step ${index + 1}`}
                value={step}
                onChangeText={text => handleUpdateStep(index, text)}
              />
              {/* Right Button to Remove Step */}
              <TouchableOpacity
                style={styles.removeStepButton}
                onPress={() => handleRemoveStep(index)}
                disabled={index === 0} // Disable removal of the first step
              >
                <Text style={styles.removeStepButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Ingredient Button */}
          <TouchableOpacity
            style={styles.addIngredientButton}
            onPress={handleAddIngredientData}>
            <Text style={styles.addIngredientButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>

          {/* Ingredients */}
          {ingredientsData.map((ingredient, index) => (
            <View key={index} style={styles.ingredientContainer}>
              <View style={styles.ingredientInputContainer}>
                <TextInput
                  style={styles.ingredientNameInput}
                  placeholder="Ingredient Name"
                  value={ingredient.name}
                  onChangeText={text =>
                    handleUpdateIngredient(index, 'name', text)
                  }
                />
                <TextInput
                  style={styles.ingredientQuantityInput}
                  placeholder="Quantity"
                  value={ingredient.quantity.toString()} // Convert the number to a string for the TextInput
                  onChangeText={text => {
                    const numericValue = parseFloat(text); // Convert the input text to a number
                    handleUpdateIngredient(
                      index,
                      'quantity',
                      isNaN(numericValue) ? 0 : numericValue,
                    );
                  }}
                  keyboardType="numeric"
                />
                {/* Unit of Measurement Dropdown */}
                <TouchableOpacity
                  style={styles.ingredientUnitDropdown}
                  onPress={() => handleOpenUnitModal(index)}>
                  <Text style={styles.ingredientDropdownText}>
                    {ingredient.unit || 'Unit'}
                  </Text>
                </TouchableOpacity>
              </View>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => handleRemoveIngredient(index)}>
                  <Text style={styles.removeIngredientButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.uploadImageButton}
            onPress={handleUploadImage}>
            <Text style={styles.uploadImageButtonText}>Upload Meal Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveMealButton}
            onPress={handleSaveMeal}>
            <Text style={styles.saveMealButtonText}>Save Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Diet Preference Dropdown Modal */}
        <Modal visible={isDietModalVisible} animationType="fade" transparent>
          <TouchableOpacity onPress={() => setDietModalVisible(false)}>
            <View style={styles.modalContainer}>
              {/* List of options for diet preference */}
              {dietOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectDietPreference(option)}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Food Restrictions Dropdown Modal */}
        <Modal
          visible={isFoodRestrictionModalVisible}
          animationType="fade"
          transparent>
          <TouchableOpacity
            onPress={() => setFoodRestrictionModalVisible(false)}>
            <View style={styles.modalContainer}>
              {/* List of options for food restrictions */}
              {foodRestrictionOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() =>
                    handleSelectFoodRestrictions([...foodRestrictions, option])
                  }>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Unit of Measurement Modal */}
        <Modal visible={isUnitModalVisible} animationType="fade" transparent>
          <TouchableOpacity onPress={() => setUnitModalVisible(false)}>
            <View style={styles.modalContainer}>
              {/* List of options for unit of measurement */}
              {unitOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelectUnit(option)}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topBar: {
    height: 30,
    width: '100%',
    backgroundColor: '#CD6D15',
  },
  container: {
    padding: 10,
  },
  formContainer: {
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    height: 50,
  },
  dropdown: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    padding: 10,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
  },
  recipeStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addStepButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#CD6D15',
    borderRadius: 5,
    marginRight: 10,
  },
  addStepButtonText: {
    color: 'white',
  },
  recipeStepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  removeStepButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FF5733',
    borderRadius: 5,
    marginLeft: 10,
  },
  removeStepButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addIngredientButton: {
    alignSelf: 'stretch',
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: '#CD6D15',
    borderRadius: 5,
    alignItems: 'center',
  },
  addIngredientButtonText: {
    color: 'white',
    fontSize: 16,
  },
  ingredientContainer: {
    marginBottom: 10,
  },
  ingredientInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  ingredientQuantityInput: {
    width: 100,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  ingredientUnitDropdown: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientDropdownText: {
    fontSize: 16,
  },
  removeIngredientButton: {
    padding: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FF5733',
    borderRadius: 5,
  },
  removeIngredientButtonText: {
    color: 'white',
  },
  uploadImageButton: {
    alignSelf: 'stretch',
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: '#CD6D15',
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadImageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveMealButton: {
    alignSelf: 'stretch', // Make the button full width
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: '#CD6D15',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveMealButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AddMeals;
