import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';

const AddPantryIngredients = ({route, navigation}) => {
  const {user_id, email, password, updatedPantryIngredients} = route.params;
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState(0); // Default quantity as a number
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('grams'); // Default unit of measurement
  const [isModalVisible, setModalVisible] = useState(false);
  const [pantryIngredients, setPantryIngredients] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');

  // Function to handle submitting the form
  const handleSubmit = () => {
    // Check if the quantity is a valid number
    if (isNaN(parseFloat(quantity))) {
      console.error('Quantity must be a valid number');
      return;
    }

    // Define the newIngredient object
    const newIngredient = {
      user_id,
      ingredient_name: ingredientName,
      quantity: parseFloat(quantity), // Ensure quantity is converted to a number
      unit_of_measurement: unitOfMeasurement,
    };

    // Here you can make an API call to add the ingredient to the pantry table using fetch or any other library
    fetch('http://10.0.2.2:3000/add-pantry-ingredient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIngredient),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from server:', data);
        // If the response is successful, you can update the pantryIngredients state with the new ingredient
        if (data.success) {
          setPantryIngredients([...pantryIngredients, newIngredient]);
          // Show the success message for a few seconds
          setSuccessMessage('Ingredient added successfully!');
          setTimeout(() => {
            setSuccessMessage('');
            // Navigate back to PantryList after setting the success message
            navigation.navigate('PantryList', {
              user_id,
              email,
              password,
              updatedPantryIngredients: [...pantryIngredients, newIngredient],
            });
          }, 3000); // Hide the success message after 3 seconds
        }
      })
      .catch(error => {
        console.error('Error adding ingredient:', error);
        // Display an error message to the user
        alert('Error occurred while adding the ingredient.');
      });
  };

  // Function to handle selecting a unit of measurement from the dropdown menu
  const handleSelectUnit = selectedUnit => {
    setUnitOfMeasurement(selectedUnit);
    setModalVisible(false); // Close the dropdown menu after selection
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.topBar} />
      <Text style={styles.topTxt}>Add Pantry Ingredients</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ingredient Name"
          value={ingredientName}
          onChangeText={text => setIngredientName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={quantity.toString()} // Convert the number to a string for the TextInput
          onChangeText={text => {
            const numericValue = parseFloat(text); // Convert the input text to a number
            setQuantity(isNaN(numericValue) ? 0 : numericValue); // Set the quantity state to the numeric value
          }}
          keyboardType="numeric"
        />
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Unit of Measurement:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setModalVisible(true)}>
            <Text>{unitOfMeasurement}</Text>
            {/* You can place your dropdown icon here */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            {/* List of options for unit of measurement */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('grams')}>
              <Text style={styles.modalOptionText}>grams</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('teaspoon')}>
              <Text style={styles.modalOptionText}>teaspoon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('tablespoon')}>
              <Text style={styles.modalOptionText}>tablespoon</Text>
            </TouchableOpacity>
            {/* Add more options as needed */}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('handful')}>
              <Text style={styles.modalOptionText}>handful</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('piece')}>
              <Text style={styles.modalOptionText}>piece</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('slice')}>
              <Text style={styles.modalOptionText}>slice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('ml')}>
              <Text style={styles.modalOptionText}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('cup')}>
              <Text style={styles.modalOptionText}>cup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSelectUnit('pinch')}>
              <Text style={styles.modalOptionText}>pinch</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Message */}
      {successMessage !== '' && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}

      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonTxt}>Add Ingredient</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  topTxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formContainer: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownLabel: {
    marginRight: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#CD6D15',
    width: '90%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  addButtonTxt: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  modalOptionText: {
    fontSize: 15,
  },
  successMessage: {
    textAlign: 'center',
    color: 'green',
    fontSize: 18,
    marginVertical: 10,
  },
});

export default AddPantryIngredients;
