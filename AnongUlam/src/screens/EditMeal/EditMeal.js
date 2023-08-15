import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  Image
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

const EditMeal = ({route, navigation}) => {
  const {meal_id, user_id, email, password} = route.params;
  const [meal, setMeal] = useState(null);
  const [mealName, setMealName] = useState('');
  const [dietPreference, setDietPreference] = useState('');
  const [foodRestrictions, setFoodRestrictions] = useState([]); // Initialize as an empty array
  const [calories, setCalories] = useState('');
  const [recipeSteps, setRecipeSteps] = useState([]);

  //const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepDescriptions, setNewStepDescriptions] = useState([]);

  const [openUnitModal, setOpenUnitModal] = useState(false);

  const [editedIngredients, setEditedIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [ingredientsToAdd, setIngredientsToAdd] = useState([
    {
      ingredient_name: '',
      quantity: 0,
      unit_of_measurement: '', // Set an initial value for the unit_of_measurement
    },
  ]);

  const [selectedNewUnitIndex, setSelectedNewUnitIndex] = useState(null);

  // State to keep track of the indices of the updated recipe steps
  const [updatedStepIndices, setUpdatedStepIndices] = useState([]);

  // Add the selectedUnitIndex state and its setter function
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(null);
  const [updatedIngredientIndices, setUpdatedIngredientIndices] = useState([]);

  const [isAddingNewStep, setIsAddingNewStep] = useState(false);

  // State variable to track whether the "Add Ingredient" button is clicked
  const [showNewIngredients, setShowNewIngredients] = useState(false);

  const [dietPreferenceModalVisible, setDietPreferenceModalVisible] =
    useState(false);
  const [foodRestrictionsModalVisible, setFoodRestrictionsModalVisible] =
    useState(false);

  const [mealImageUri, setMealImageUri] = useState(null);

  // Add these state variables
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);

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

  // Define the unit options array
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
        //console.log('Fetched Meal Data:', data);
        //console.log('Ingredients:', ingredients);
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

        // Map the ingredients to include the 'unit_of_measurement' field
        const updatedIngredients =
          data.meal?.ingredients?.map(ingredient => ({
            ...ingredient,
            unit_of_measurement: ingredient.unit_of_measurement || '', // Ensure that unit_of_measurement is never undefined
          })) || [];

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
        //setIngredients(updatedIngredients);
        setIngredients(data.meal.ingredients || []);
        setEditedIngredients(updatedIngredients);

        // Set the meal image URI if available
        setMealImageUri(
          data.meal.photo_filepath
            ? `http://10.0.2.2:3000${data.meal.photo_filepath}`
            : null,
        );
      })
      .catch(error => console.error('Error fetching meal details:', error));
  }, [meal_id]);

  const handleAddStep = useCallback(() => {
    // Add an empty string to the newStepDescriptions array
    setNewStepDescriptions(prevDescriptions => [...prevDescriptions, '']);
    setIsAddingNewStep(true);
  }, []);

  const handleCancelAddStep = () => {
    // Remove the last step description from the newStepDescriptions array
    setNewStepDescriptions(prevDescriptions =>
      prevDescriptions.slice(0, prevDescriptions.length - 1),
    );
    // Set isAddingNewStep to false to hide the new TextInput field
    setIsAddingNewStep(false);
  };

  const addNewRecipeSteps = async (mealId, newSteps) => {
    try {
      const response = await fetch(
        `http://10.0.2.2:3000/meals/${mealId}/recipe_steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_steps: newSteps,
          }),
        },
      );

      const data = await response.json();
      if (data.error) {
        console.log('Error adding new recipe steps:', data.error);
        throw new Error(data.error);
      }
      console.log('New recipe steps added successfully');
    } catch (error) {
      console.error('Error adding new recipe steps:', error);
      throw error;
    }
  };

  // Function to handle updating a specific step description
  const handleUpdateStepDescription = (stepIndex, stepId, newDescription) => {
    fetch(`http://10.0.2.2:3000/meals/${meal_id}/recipe_steps/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({step_description: newDescription}),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.log('Error updating recipe step:', data.error);
          // You can choose to handle the error in a different way if needed.
          throw new Error(data.error);
        }
        console.log('Recipe step updated successfully');
        // Optionally, you can update the state or perform other actions after a successful update
      })
      .catch(error => console.error('Error updating recipe step:', error));
  };

  const handleDeleteRecipeStep = (index, stepId) => {
    //console.log('Recipe Steps:', recipeSteps);
    //console.log('Step ID to be deleted:', stepId);
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

  // New function to handle adding a new ingredient
  const handleAddIngredient = () => {
    // Clear the unit modal selection after adding a new ingredient
    setSelectedUnitIndex(null);
    handleCloseUnitModal();
    setShowNewIngredients(true);

    // Add the new ingredient to the ingredientsToAdd state
    setIngredientsToAdd(prevIngredients => [
      ...prevIngredients,
      {
        ingredient_name: '',
        quantity: 0,
        unit_of_measurement: '',
      },
    ]);
  };

  const addNewIngredients = async (mealId, newIngredients) => {
    try {
      const response = await fetch(
        `http://10.0.2.2:3000/meals/${mealId}/ingredients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ingredients: newIngredients}),
        },
      );

      const data = await response.json();
      if (data.error) {
        console.log('Error adding new ingredients:', data.error);
        throw new Error(data.error);
      }
      console.log('New ingredients added successfully:', data.ingredients);
      // Update the state with the newly added ingredients (optional)
      setIngredients(prevIngredients => [
        ...prevIngredients,
        ...data.ingredients,
      ]);
    } catch (error) {
      console.error('Error adding new ingredients:', error);
    }
  };

  // Function to handle updating a specific ingredient field
  const handleUpdateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);

    // Add the index of the modified ingredient to updatedIngredientIndices
    if (!updatedIngredientIndices.includes(index)) {
      setUpdatedIngredientIndices(prevIndices => [...prevIndices, index]);
    }

    // Update the unit of measurement in ingredientsToAdd as well (for the modal)
    const ingredientToAdd = ingredientsToAdd[index];
    if (ingredientToAdd) {
      ingredientToAdd.unit_of_measurement = value;
      const newIngredientsToAdd = [...ingredientsToAdd];
      newIngredientsToAdd[index] = ingredientToAdd;
      setIngredientsToAdd(newIngredientsToAdd);
    }
  };

  // Function to send API call for a specific ingredient
  const sendAPIUpdateIngredient = index => {
    const ingredient = ingredients[index];
    fetch(
      `http://10.0.2.2:3000/meals/${meal_id}/ingredients/${ingredient.ingredient_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit_of_measurement: ingredient.unit_of_measurement,
        }),
      },
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.log('Error updating ingredient:', data.error);
          // You can choose to handle the error in a different way if needed.
          throw new Error(data.error);
        }
        console.log('Ingredient updated successfully');
        // Optionally, you can update the state or perform other actions after a successful update
      })
      .catch(error => console.error('Error updating ingredient:', error));
  };

  // New function to handle updating newly added ingredient
  const handleUpdateNewIngredient = (index, field, value) => {
    setIngredientsToAdd(prevIngredients => {
      const updatedIngredients = [...prevIngredients];
      const updatedIngredient = {...updatedIngredients[index]};
      updatedIngredient[field] = value;
      if (field === 'unit_of_measurement') {
        // Set the selected unit of measurement from the dropdown
        updatedIngredient[field] = value;
      }
      updatedIngredients[index] = updatedIngredient;
      return updatedIngredients;
    });
  };

  // Function to handle updating a specific ingredient field
  /*const handleUpdateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);

    // Add the index of the modified ingredient to updatedIngredientIndices
    if (!updatedIngredientIndices.includes(index)) {
      setUpdatedIngredientIndices(prevIndices => [...prevIndices, index]);
    }

    // Send the PUT request to update the ingredient
    const ingredient = newIngredients[index];
    fetch(
      `http://10.0.2.2:3000/meals/${meal_id}/ingredients/${ingredient.ingredient_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit_of_measurement: ingredient.unit_of_measurement,
        }),
      },
    )
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.log('Error updating ingredient:', data.error);
          // You can choose to handle the error in a different way if needed.
          throw new Error(data.error);
        }
        console.log('Ingredient updated successfully');
        // Optionally, you can update the state or perform other actions after a successful update
      })
      .catch(error => console.error('Error updating ingredient:', error));
  };*/

  /*const handleDeleteIngredient = (index, ingredientId) => {
    //console.log('Ingredients data:', ingredients);
    console.log('Index to be deleted:', index);
    console.log('Ingredient ID to be deleted:', ingredientId);

    // Call the backend API to delete the ingredient from the database
    fetch(`http://10.0.2.2:3000/meals/${meal_id}/ingredients/${ingredientId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Ingredient deleted successfully:', data);
        // If the ingredient is deleted successfully from the backend,
        // update the local state by removing the ingredient with the matching ingredientId
        setIngredients(prevIngredients =>
          prevIngredients.filter(
            ingredient => ingredient.ingredient_id !== ingredientId,
          ),
        );
      })
      .catch(error => console.error('Error deleting ingredient:', error));
  };*/

  const handleDeleteIngredient = (index, ingredientId) => {
    console.log('Ingredients data:', ingredients);
    console.log('Index to be deleted:', index);
    console.log('Ingredient ID to be deleted:', ingredientId);

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

  const handleSelectUnit = unit => {
    if (selectedUnitIndex !== null && selectedUnitIndex < ingredients.length) {
      // Update the unit of measurement for the selected ingredient
      handleUpdateIngredient(selectedUnitIndex, 'unit_of_measurement', unit);
    }

    if (
      selectedNewUnitIndex !== null &&
      selectedNewUnitIndex < ingredientsToAdd.length
    ) {
      // Update the unit of measurement for the selected new ingredient
      const newIngredientsToAdd = [...ingredientsToAdd];
      newIngredientsToAdd[selectedNewUnitIndex].unit_of_measurement = unit;
      setIngredientsToAdd(newIngredientsToAdd);
    }

    handleCloseUnitModal();
  };

  /*const handleSaveChanges = () => {
    // Convert recipeSteps and ingredients to arrays of strings
    const formattedRecipeSteps = recipeSteps.map((step, index) => ({
      step_id: index + 1,
      step_description: step.step_description || '',
    }));

    //handleUpdateStepDescription(updatedStepDescriptions);

    // Update only the modified recipe steps
    updatedStepIndices.forEach(index => {
      const step = recipeSteps[index];
      handleUpdateStepDescription(index, step.step_id, step.step_description);
    });

    /*const formattedIngredients = ingredients.map(ingredient => {
      const editedIngredient = editedIngredients.find(
        edited => edited.ingredient_id === ingredient.ingredient_id,
      );
      if (editedIngredient) {
        return {
          ingredient_id: ingredient.ingredient_id,
          ingredient_name:
            editedIngredient.ingredient_name || ingredient.ingredient_name,
          quantity: editedIngredient.quantity || ingredient.quantity,
          unit_of_measurement:
            editedIngredient.unit_of_measurement ||
            ingredient.unit_of_measurement,
        };
      }
      return ingredient;
    });*/

  // Update only the modified ingredients
  /*updatedIngredientIndices.forEach(index => {
      const ingredient = ingredients[index];
      handleUpdateIngredient(
        index,
        'ingredient_name',
        ingredient.ingredient_name,
      );
      handleUpdateIngredient(index, 'quantity', ingredient.quantity.toString());
      handleUpdateIngredient(
        index,
        'unit_of_measurement',
        ingredient.unit_of_measurement,
      );
    });

    // Filter out new ingredients with empty or null ingredient_name
    const newIngredientsToAdd = ingredientsToAdd.filter(
      ingredient =>
        ingredient.ingredient_name && ingredient.ingredient_name.trim() !== '',
    );

    console.log('New Ingredients to Add:', newIngredientsToAdd);

    // Check if there are new ingredients to add
    if (newIngredientsToAdd.length > 0) {
      // Check for null ingredient_name and replace with an empty string
      const sanitizedIngredientsToAdd = newIngredientsToAdd.map(ingredient => ({
        ...ingredient,
        ingredient_name: ingredient.ingredient_name || '',
      }));

      //console.log('Sanitized Ingredients to Add:', sanitizedIngredientsToAdd);

      // Send a POST request to the backend to add the new ingredients
      fetch(`http://10.0.2.2:3000/meals/${meal_id}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ingredients: sanitizedIngredientsToAdd}),
      })
        .then(response => {
          if (!response.ok) {
            // Check if the response status indicates an error
            console.log('Error adding new ingredients:', response);
            throw new Error('Failed to add new ingredients');
          }
          // Parse the response body as JSON
          return response.json();
        })
        .then(data => {
          console.log('New ingredients added successfully:', data);
          console.log('Data type:', typeof data);
          console.log('Data ingredients:', data.ingredients);
          console.log('New ingredients added successfully:', data);
          // Combine the existing ingredients and the newly added ingredients
          //const allIngredients = [...formattedIngredients, ...data.ingredients];

          //console.log('All Ingredients:', allIngredients);

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
              recipe_steps: formattedRecipeSteps,
              ingredients: editedIngredients,
            }),
          })
            .then(response => {
              if (!response.ok) {
                // Check if the response status indicates an error
                console.log('Error updating meal:', response);
                throw new Error('Failed to update meal details');
              }
              return response.json();
            })
            .then(data => {
              if (data.error) {
                console.log('Error updating meal:', data.error);
                throw new Error(data.error);
              }

              console.log('Meal details updated successfully');

              // Check if there are new recipe steps to add
              if (isAddingNewStep) {
                // Map the new recipe steps to the format expected by the backend
                const newSteps = newStepDescriptions.filter(
                  stepDescription => stepDescription.trim() !== '',
                );
                const formattedNewSteps = newSteps.map(
                  (stepDescription, index) => ({
                    step_order: formattedRecipeSteps.length + index + 1,
                    step_description: stepDescription,
                  }),
                );

                // Send a POST request to the backend to add the new recipe steps
                fetch(`http://10.0.2.2:3000/meals/${meal_id}/recipe_steps`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({recipe_steps: formattedNewSteps}),
                })
                  .then(response => response.json())
                  .then(data => {
                    console.log('New recipe steps added successfully');
                    setIsAddingNewStep(false); // Reset the isAddingNewStep state
                    // Proceed with other actions (e.g., navigation back to YourMeals screen)
                    navigation.navigate('YourMeals', {user_id});
                  })
                  .catch(error =>
                    console.error('Error adding new recipe steps:', error),
                  );
              } else {
                // If there are no new steps, proceed with other actions (e.g., navigation back to YourMeals screen)
                navigation.navigate('YourMeals', {user_id, email, password});
              }
            })
            .catch(error => console.error('Error updating meal:', error));
        })
        .catch(error => console.error('Error adding new ingredients:', error));
    } else {
      // If there are no new ingredients to add, just update the existing ingredients
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
          recipe_steps: formattedRecipeSteps,
          ingredients: editedIngredients,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Meal details updated successfully');

          // Check if there are new recipe steps to add
          if (isAddingNewStep) {
            // Map the new recipe steps to the format expected by the backend
            const newSteps = newStepDescriptions.filter(
              stepDescription => stepDescription.trim() !== '',
            );
            const formattedNewSteps = newSteps.map(
              (stepDescription, index) => ({
                step_order: formattedRecipeSteps.length + index + 1,
                step_description: stepDescription,
              }),
            );

            // Send a POST request to the backend to add the new recipe steps
            fetch(`http://10.0.2.2:3000/meals/${meal_id}/recipe_steps`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({recipe_steps: formattedNewSteps}),
            })
              .then(response => response.json())
              .then(data => {
                console.log('New recipe steps added successfully');
                setIsAddingNewStep(false); // Reset the isAddingNewStep state
                // Proceed with other actions (e.g., navigation back to YourMeals screen)
                navigation.navigate('YourMeals', {user_id, email, password});
              })
              .catch(error =>
                console.error('Error adding new recipe steps:', error),
              );
          } else {
            // If there are no new steps, proceed with other actions (e.g., navigation back to YourMeals screen)
            navigation.navigate('YourMeals', {user_id, email, password});
          }
        })
        .catch(error => console.error('Error updating meal:', error));
    }
  };*/

  const handleSaveChanges = async () => {
    // Convert recipeSteps and ingredients to arrays of strings
    const formattedRecipeSteps = recipeSteps.map((step, index) => ({
      step_id: index + 1,
      step_description: step.step_description || '',
    }));

    // Update only the modified recipe steps
    updatedStepIndices.forEach(index => {
      const step = recipeSteps[index];
      handleUpdateStepDescription(index, step.step_id, step.step_description);
    });

    // Update only the modified ingredients
    updatedIngredientIndices.forEach(index => {
      sendAPIUpdateIngredient(index);
    });

    // Update only the modified ingredients
    /*updatedIngredientIndices.forEach(index => {
      const ingredient = ingredients[index];
      handleUpdateIngredient(
        index,
        'ingredient_name',
        ingredient.ingredient_name,
      );
      handleUpdateIngredient(index, 'quantity', ingredient.quantity.toString());
      handleUpdateIngredient(
        index,
        'unit_of_measurement',
        ingredient.unit_of_measurement,
      );
    });*/

    // Filter out new ingredients with empty or null ingredient_name
    const newIngredientsToAdd = ingredientsToAdd.filter(
      ingredient =>
        ingredient.ingredient_name && ingredient.ingredient_name.trim() !== '',
    );

    // Prepare the payload for the PUT request
    const payload = {
      meal_name: mealName,
      diet_preference: dietPreference,
      food_restrictions: foodRestrictions,
      calories: parseInt(calories),
      recipe_steps: [...formattedRecipeSteps, ...newStepDescriptions], // Include the new step descriptions
      ingredients: editedIngredients, // Use editedIngredients instead of ingredients
    };

    try {
      // First, add the new recipe steps if there are any
      if (newStepDescriptions.length > 0) {
        await addNewRecipeSteps(
          meal_id,
          newStepDescriptions.map((step, index) => ({
            step_order: formattedRecipeSteps.length + index + 1,
            step_description: step,
          })),
        );
      }

      // Then, add the new ingredients if there are any
      if (newIngredientsToAdd.length > 0) {
        await addNewIngredients(meal_id, newIngredientsToAdd);
      }

      // Send the PUT request to update the meal
      const response = await fetch(`http://10.0.2.2:3000/meals/${meal_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) {
        console.log('Error updating meal:', data.error);
        throw new Error(data.error);
      }
      console.log('Meal updated successfully');

      navigation.navigate('Dashboard', {user_id, email, password});
    } catch (error) {
      console.error('Error updating meal:', error);
    }
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
                navigation.navigate('Dashboard', {user_id, email, password});
              })
              .catch(error => console.error('Error deleting meal:', error));
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleOpenUnitModal = index => {
    setSelectedUnitIndex(index); // For existing ingredients
    setSelectedNewUnitIndex(index); // For new ingredients
    setOpenUnitModal(true);
  };

  const handleCloseUnitModal = () => {
    setOpenUnitModal(false);
  };

  // Function to handle the "Remove Photo" button press
  const handleRemovePhoto = () => {
    // Call the backend endpoint to remove the photo_filepath from the meals table
    fetch(`http://10.0.2.2:3000/remove-meal-photo/${meal_id}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        // Update the mealImageUri state with an empty value to remove the image
        setMealImageUri('');
      })
      .catch(error => console.error('Error removing meal photo:', error));
  };

  // Function to handle uploading the image from the gallery
  const handleChoosePhoto = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error:', response.error);
      } else if (response.assets.length > 0) {
        setMealImageUri(response.assets[0].uri); // Update the state with the file path
      }
    });
  };

  // Function to handle saving the photo to the server
  const handleSavePhoto = async () => {
    try {
      // Send a POST request to the server with the selected image file
      const formData = new FormData();
      const filename = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}.jpg`;
      formData.append('photo', {
        uri: mealImageUri,
        name: filename, // Use the generated filename
        type: 'image/jpeg', // Adjust the file type based on the actual image type
      });

      // Assuming you have the meal_id available in the state
      const mealId = meal?.meal_id;

      // Append the mealId to the formData
      formData.append('mealId', mealId);

      // Send the POST request to the server
      const response = await fetch('http://10.0.2.2:3000/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        // Photo uploaded successfully, show a success message if needed
        Alert.alert('Photo uploaded successfully.');
      } else {
        // Handle error if needed
        Alert.alert('Failed to upload the photo.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Failed to upload the photo.');
    }
  };

  if (!meal) {
    // If meal is null, show nothing until the data is fetched
    return null;
  }

  return (
    <View style={styles.root}>
      {mealImageUri ? (
        <Image
          source={{uri: mealImageUri}}
          style={styles.mealImg}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.mealImgPlaceholder} />
      )}

      {/* Container for the buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRemovePhoto}>
          <Text style={styles.buttonText}>Remove Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleChoosePhoto}>
          <Text style={styles.buttonText}>Choose Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSavePhoto}>
          <Text style={styles.buttonText}>Save Photo</Text>
        </TouchableOpacity>
      </View>

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
                value={step.step_description}
                onChangeText={text => {
                  // Update the specific step description when it changes
                  setRecipeSteps(prevSteps =>
                    prevSteps.map((prevStep, idx) =>
                      idx === index
                        ? {...prevStep, step_description: text}
                        : prevStep,
                    ),
                  );

                  // Mark the step as updated by adding its index to the updatedStepIndices array
                  if (!updatedStepIndices.includes(index)) {
                    setUpdatedStepIndices(prevIndices => [
                      ...prevIndices,
                      index,
                    ]);
                  }
                }}
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecipeStep(index, step.step_id)}>
                <Text style={styles.buttonText}>Delete Step</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* New Step Input Field */}
          {newStepDescriptions.map((stepDescription, index) => (
            <View key={index} style={styles.stepContainer}>
              <TextInput
                value={stepDescription}
                onChangeText={text => {
                  // Update the specific step description when it changes
                  setNewStepDescriptions(prevDescriptions =>
                    prevDescriptions.map((desc, i) =>
                      i === index ? text : desc,
                    ),
                  );
                }}
                placeholder="Enter new step description..."
                multiline
                style={styles.newStepInput}
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleCancelAddStep}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
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
                onPress={() => handleOpenUnitModal(index)} // Pass the index as an argument
              >
                <Text style={styles.ingredientDropdownText}>
                  {ingredient.unit_of_measurement
                    ? ingredient.unit_of_measurement
                    : 'Select Unit'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteIngredientButton}
                onPress={() =>
                  handleDeleteIngredient(index, ingredient.ingredient_id)
                }>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* New ingredients to add */}
          {ingredientsToAdd.map((ingredient, index) => (
            <View key={index} style={styles.ingredientContainer}>
              <TextInput
                style={styles.ingredientInput}
                placeholder="Ingredient Name"
                value={ingredient.ingredient_name}
                onChangeText={text =>
                  handleUpdateNewIngredient(index, 'ingredient_name', text)
                }
              />
              <TextInput
                style={styles.quantityInput}
                placeholder="Quantity"
                value={ingredient.quantity.toString()}
                onChangeText={text => {
                  const numericValue = parseFloat(text);
                  handleUpdateNewIngredient(
                    index,
                    'quantity',
                    isNaN(numericValue) ? 0 : numericValue,
                  );
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.unitDropdown}
                onPress={() => handleOpenUnitModal(index)} // Pass the index as an argument
              >
                <Text style={styles.ingredientDropdownText}>
                  {ingredient.unit_of_measurement
                    ? ingredient.unit_of_measurement
                    : 'Select Unit'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteIngredientButton}
                onPress={() => handleDeleteNewIngredient(index)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addIngredientButton}
            onPress={handleAddIngredient}>
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </TouchableOpacity>

          {/* Unit of Measurement Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={openUnitModal}
            onRequestClose={handleCloseUnitModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {unitOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalOption}
                    onPress={() => handleSelectUnit(option)}>
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseUnitModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>

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
    //marginBottom: 20,
  },
  mealImgPlaceholder: {
    height: 250,
    backgroundColor: 'lightgrey', // Customize the placeholder background color
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
    marginBottom: 10,
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
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row', // Arrange buttons in a row
    justifyContent: 'center', // Center the buttons horizontally
    marginTop: 10, // Add some space between the image and buttons
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: '#CD6D15',
    borderRadius: 5,
    marginHorizontal: 5, // Add some space between buttons
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EditMeal;
