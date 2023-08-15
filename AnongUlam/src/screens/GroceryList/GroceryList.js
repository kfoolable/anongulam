import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import TopBar from '../../components/TopBar';

const GroceryList = ({route, navigation}) => {
  const [groceryListData, setGroceryListData] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const {email, password, user_id} = route.params;

  useEffect(() => {
    const fetchGroceryListData = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/grocery-list/${email}/${password}`,
        );

        if (!response.ok) {
          console.error(
            'Error fetching grocery list data:',
            response.statusText,
          );
          return;
        }

        const data = await response.json();
        const combinedIngredients = combineIngredients(data.groceryListData);
        setGroceryListData(combinedIngredients);
      } catch (error) {
        console.error('Error fetching grocery list data:', error);
      }
    };

    fetchGroceryListData();
  }, [email, password]);

  // Helper function to combine and sum up ingredients with the same name
  const combineIngredients = groceryListData => {
    const combinedIngredients = [];
    groceryListData.forEach(item => {
      const existingIngredient = combinedIngredients.find(
        ingredient => ingredient.ingredient_name === item.ingredient_name,
      );

      if (existingIngredient) {
        existingIngredient.quantity += parseFloat(item.quantity);
      } else {
        combinedIngredients.push({
          ...item,
          quantity: parseFloat(item.quantity),
        });
      }
    });
    return combinedIngredients;
  };

  const handleButtonPress = ingredientId => {
    setSelectedIngredients(prevSelected => {
      if (prevSelected.includes(ingredientId)) {
        // If the ingredient is already selected, remove it from the selected list
        return prevSelected.filter(id => id !== ingredientId);
      } else {
        // If the ingredient is not already selected, add it to the selected list
        return [...prevSelected, ingredientId];
      }
    });
  };

  // Add to Pantry keneme roots
  /*const handleAddToPantry = () => {
    // Get the selected ingredients from the grocery list data
    const selectedGroceryItems = groceryListData.filter(item =>
      selectedIngredients.some(
        selectedItem => selectedItem.ingredient_id === item.ingredient_id,
      ),
    );

    // Get the unique ingredient names from the selected grocery items
    const ingredientNames = selectedGroceryItems.map(
      item => item.ingredient_name,
    );

    console.log('Ingredient Names to be added to pantry:', ingredientNames);

    fetch(`http://10.0.2.2:3000/add-to-pantry/${user_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredient_names: ingredientNames, // Pass the ingredient names to the backend
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);

        // After adding to pantry, remove selected ingredients from grocery list
        const updatedGroceryListData = groceryListData.filter(
          item =>
            !selectedIngredients.some(
              selectedItem => selectedItem.ingredient_id === item.ingredient_id,
            ),
        );

        setGroceryListData(updatedGroceryListData);
        setSelectedIngredients([]); // Clear selected ingredients after adding to pantry
      })
      .catch(error => {
        console.error('Error adding ingredients to pantry:', error);
      });
  };*/

   const handleAddToPantry = () => {
     // Get the selected ingredients from the grocery list data
     const selectedGroceryItems = groceryListData.filter(item =>
       selectedIngredients.some(
         selectedItem => selectedItem.ingredient_name === item.ingredient_name,
       ),
     );

     // Now, create the pantry_items array with all the required fields, including ingredient_id.
     const pantryItems = selectedGroceryItems.map(item => {
       return {
         user_id: user_id,
         ingredient_id: item.ingredient_id, // We already have the ingredient_id from the grocery table
         ingredient_name: item.ingredient_name,
         quantity: item.quantity,
         unit_of_measurement: item.unit_of_measurement,
       };
     });

     console.log('Pantry Items Data to be added:', pantryItems);

     // Finally, send the pantry_items to the backend to add them to the pantry table
     fetch(`http://10.0.2.2:3000/add-to-pantry/${user_id}`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         ingredient_names: pantryItems.map(item => item.ingredient_name),
         pantry_items: pantryItems,
       }),
     })
       .then(response => response.json())
       .then(data => {
         console.log(data.message);

         // After adding to pantry, remove selected ingredients from grocery list
         const updatedGroceryListData = groceryListData.filter(
           item =>
             !selectedIngredients.some(
               selectedItem =>
                 selectedItem.ingredient_id === item.ingredient_id,
             ),
         );

         setGroceryListData(updatedGroceryListData);
         setSelectedIngredients([]); // Clear selected ingredients after adding to pantry
       })
       .catch(error => {
         console.error('Error adding ingredients to pantry:', error);
       });
   };

  return (
    <View style={styles.rootContainer}>
      <TopBar email={email} password={password} user_id={user_id} />
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Text style={styles.title}>Ingredients</Text>
          <View style={styles.groceryCapContainer}>
            <Text style={styles.groceryCap}>You will need...</Text>
          </View>
        </View>
        <Text style={styles.titleGrocery}>Grocery List</Text>
        <View style={styles.groceryListContainer}>
          <ScrollView>
            <View style={styles.listContainer}>
              {groceryListData.map(item => (
                <View key={item.ingredient_id} style={styles.groceryListItem}>
                  {/* Circle button */}
                  <TouchableOpacity
                    style={[
                      styles.circleButton,
                      selectedIngredients.some(
                        selectedItem =>
                          selectedItem.ingredient_id === item.ingredient_id,
                      ) && styles.selectedCircleButton,
                    ]}
                    onPress={() => handleButtonPress(item)} // Pass the entire 'item' object
                  />

                  {/* Name of the ingredient */}
                  <Text style={styles.ingredientName}>
                    {item.ingredient_name}
                  </Text>

                  {/* Quantity and unit of measurement */}
                  <Text style={styles.quantity}>
                    {item.quantity} {item.unit_of_measurement}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      {/* Add to Pantry button outside the ScrollView */}
      <View style={styles.centerContainer}>
        <TouchableOpacity
          style={styles.addToPantryBtn}
          onPress={handleAddToPantry}>
          <Text style={styles.addToPantryTxt}>Add to Pantry</Text>
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
    alignItems: 'center',
  },
  groceryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  circleButton: {
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'grey',
    marginRight: 10,
  },
  selectedCircleButton: {
    backgroundColor: '#CD6D15',
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
  centerContainer: {
    alignItems: 'center',
  },
  addToPantryBtn: {
    height: 50,
    width: 270,
    backgroundColor: '#CD6D15',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToPantryTxt: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GroceryList;
