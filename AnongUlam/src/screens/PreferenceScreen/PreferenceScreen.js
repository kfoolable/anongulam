import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'; // Added ScrollView for better scrolling
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';

const PreferenceScreen = () => {
  const navigation = useNavigation();
  const [preference, setPreference] = useState('');
  const [restrictions, setRestrictions] = useState([]);

  const route = useRoute();
  const {name, email, password} = route.params;

  const handlePreferenceSelect = selectedPreference => {
    setPreference(selectedPreference);
  };

  const handleRestrictionToggle = selectedRestriction => {
    if (selectedRestriction === 'None') {
      setRestrictions(['None']);
    } else {
      if (restrictions.length === 0) {
        // Check if restrictions is an empty array
        setRestrictions([selectedRestriction]);
      } else {
        if (restrictions.includes('None')) {
          setRestrictions([selectedRestriction]);
        } else {
          if (restrictions.includes(selectedRestriction)) {
            setRestrictions(
              restrictions.filter(item => item !== selectedRestriction),
            );
          } else {
            setRestrictions([...restrictions, selectedRestriction]);
          }
        }
      }
    }
  };

  const handleNext = () => {
    // Log the data to check if it is correct
    console.log('Preference:', preference);
    console.log('Restrictions:', restrictions);

    // If preference is "None", send "None" instead of null
    const dietPreferenceToSend = preference === 'None' ? 'None' : preference;

    // If restrictions are empty or include "None", send "None" instead of null
    const foodRestrictionsToSend =
      restrictions.length === 0 || restrictions.includes('None')
        ? 'None'
        : restrictions;

    // Make API call to register the user and send user data along with preference and restrictions
    axios
      .post('http://10.0.2.2:3000/register', {
        name,
        email,
        password,
        diet_preference: dietPreferenceToSend,
        food_restrictions: foodRestrictionsToSend,
      })
      .then(response => {
        // Handle success response, e.g., navigate to LoginScreen instead of Dashboard
        navigation.navigate('Login');
      })
      .catch(error => {
        // Handle error, e.g., show an error message
        console.error('Error registering user:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Diet Preference:</Text>
      {/* Preference options */}
      <TouchableOpacity
        style={[styles.option, preference === 'Keto' && styles.selectedOption]}
        onPress={() => handlePreferenceSelect('Keto')}>
        <Text style={styles.optionText}>Keto</Text>
      </TouchableOpacity>
      {/* Add the other preference options here */}
      <TouchableOpacity
        style={[styles.option, preference === 'Paleo' && styles.selectedOption]}
        onPress={() => handlePreferenceSelect('Paleo')}>
        <Text style={styles.optionText}>Paleo</Text>
      </TouchableOpacity>
      {/* Rest of the preference options */}
      <TouchableOpacity
        style={[styles.option, preference === 'Halal' && styles.selectedOption]}
        onPress={() => handlePreferenceSelect('Halal')}>
        <Text style={styles.optionText}>Halal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          preference === 'Vegetarian' && styles.selectedOption,
        ]}
        onPress={() => handlePreferenceSelect('Vegetarian')}>
        <Text style={styles.optionText}>Vegetarian</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          preference === 'Pescatarian' && styles.selectedOption,
        ]}
        onPress={() => handlePreferenceSelect('Pescatarian')}>
        <Text style={styles.optionText}>Pescatarian</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, preference === 'None' && styles.selectedOption]}
        onPress={() => handlePreferenceSelect('None')}>
        <Text style={styles.optionText}>None</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Choose Your Food Restrictions:</Text>
      {/* Restriction options */}
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Fatty') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Fatty')}>
        <Text style={styles.optionText}>Fatty</Text>
      </TouchableOpacity>
      {/* Add the other restriction options here */}
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Sugary') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Sugary')}>
        <Text style={styles.optionText}>Sugary</Text>
      </TouchableOpacity>
      {/* Rest of the restriction options */}
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Wheat') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Wheat')}>
        <Text style={styles.optionText}>Wheat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Soy') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Soy')}>
        <Text style={styles.optionText}>Soy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Seafoods') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Seafoods')}>
        <Text style={styles.optionText}>Seafoods</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('Peanuts') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('Peanuts')}>
        <Text style={styles.optionText}>Peanuts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.option,
          restrictions.includes('None') && styles.selectedOption,
        ]}
        onPress={() => handleRestrictionToggle('None')}>
        <Text style={styles.optionText}>None</Text>
      </TouchableOpacity>

      {/* Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white', // Set your desired background color for the screen
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: 'lightblue',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#CD6D15',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 20, // Add some margin at the bottom
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreferenceScreen;
