import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '../../components/TopBar';

const PantryList = ({route, navigation}) => {
  const {user_id, email, password, updatedPantryIngredients} = route.params;
  const [pantryIngredients, setPantryIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Function to fetch pantry ingredients from backend
  const fetchPantryIngredients = useCallback(() => {
    fetch(`http://10.0.2.2:3000/pantry/${user_id}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.pantryData && Array.isArray(data.pantryData)) {
          // Combine ingredients with the same names and sum up their quantities
          const combinedIngredients = combineIngredients(data.pantryData);
          setPantryIngredients(combinedIngredients);
        } else {
          console.error('Error fetching pantry data:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching pantry data:', error);
      });
  }, [user_id]);

  // Fetch pantry ingredients on initial render and whenever updatedPantryIngredients changes
  useEffect(() => {
    fetchPantryIngredients();
  }, [fetchPantryIngredients, updatedPantryIngredients]);

  // Function to combine and sum up ingredients with the same name
  const combineIngredients = pantryData => {
    const combinedIngredients = [];
    pantryData.forEach(item => {
      const existingIngredient = combinedIngredients.find(
        ingredient => ingredient.ingredient_name === item.ingredient_name,
      );

      if (existingIngredient) {
        existingIngredient.total_quantity += parseFloat(item.quantity);
      } else {
        combinedIngredients.push({
          ...item,
          total_quantity: parseFloat(item.quantity),
        });
      }
    });

    return combinedIngredients;
  };

  // Selects the ingredients to delete from the pantry
  const handleIngredientSelection = ingredient => {
    const isSelected = selectedIngredients.some(item => item === ingredient);

    if (isSelected) {
      setSelectedIngredients(
        selectedIngredients.filter(item => item !== ingredient),
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Deletes selected ingredients from the pantry table
  const handleDeleteSelectedIngredients = () => {
    // Prepare an array of selected ingredient names
    const selectedIngredientNames = selectedIngredients.map(
      ingredient => ingredient.ingredient_name,
    );

    // Call the backend endpoint to delete the selected ingredients
    fetch('http://10.0.2.2:3000/delete-pantry-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        ingredient_names: selectedIngredientNames, // <-- Use selectedIngredientNames here
      }),
    })
      .then(response => response.json())
      .then(data => {
        // Check if the deletion was successful
        if (data.success) {
          // Remove the selected ingredients from the pantryIngredients state
          const updatedPantryIngredients = pantryIngredients.filter(
            item => !selectedIngredientNames.includes(item.ingredient_name), // <-- Use selectedIngredientNames here
          );
          setPantryIngredients(updatedPantryIngredients);

          // Clear the selected ingredients list
          setSelectedIngredients([]);
        } else {
          console.error('Error deleting pantry ingredients:', data);
        }
      })
      .catch(error => {
        console.error('Error deleting pantry ingredients:', error);
      });
  };

  const handleAddToPantryForm = () => {
    navigation.navigate('AddPantryIngredients', {email, password, user_id});
  };

  return (
    <View style={styles.rootContainer}>
      <TopBar email={email} password={password} user_id={user_id} />

      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={styles.title}>Ingredients</Text>
          <View style={styles.groceryCapContainer}>
            <Text style={styles.groceryCap}>You currently have...</Text>
          </View>
        </View>

        <Text style={styles.titleGrocery}>Your Pantry List</Text>
        <ScrollView style={styles.groceryListContainer}>
          <View style={styles.listContainer}>
            {pantryIngredients.map(ingredient => (
              <View
                key={ingredient.ingredient_name}
                style={styles.groceryListItem}>
                {/* Select button */}
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    selectedIngredients.includes(ingredient) &&
                      styles.selectedButton,
                  ]}
                  onPress={() => handleIngredientSelection(ingredient)}>
                  {/* Empty content, button will be red when selected */}
                </TouchableOpacity>

                {/* Name of the ingredient */}
                <Text style={styles.ingredientName}>
                  {ingredient.ingredient_name}
                </Text>

                {/* Total quantity and unit of measurement */}
                <Text style={styles.quantity}>
                  {ingredient.total_quantity} {ingredient.unit_of_measurement}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedIngredients.length > 0 && (
        <View style={styles.buttonContainerLeft}>
          <TouchableOpacity
            style={styles.delButton}
            onPress={handleDeleteSelectedIngredients}>
            <Text style={styles.delButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToPantryForm}>
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
  container: {
    margin: 20,
  },
  topContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  titleGrocery: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  groceryListContainer: {
    height: 480,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  groceryCapContainer: {
    borderWidth: 2,
    borderColor: '#CD6D15',
    height: 30,
    width: 182,
    borderRadius: 10,
  },
  groceryCap: {
    color: '#CD6D15',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    marginTop: 10,
    alignItems: 'center', // Center the list items horizontally
  },
  groceryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectButton: {
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 10,
    borderColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#CD6D15',
  },
  buttonContainerLeft: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'grey',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  delButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
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

export default PantryList;
