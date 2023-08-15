import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

const dietPreferenceOptions = [
  'None',
  'Keto',
  'Halal',
  'Paleo',
  'Vegetarian',
  'Pescatarian',
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

const UserProfile = ({route, navigation}) => {
  const {user_id} = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dietPreference, setDietPreference] = useState('None');
  const [foodRestrictions, setFoodRestrictions] = useState([]);

  const [showPassword, setShowPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(true);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  useEffect(() => {
    // Fetch user profile data from the backend
    fetch(`http://10.0.2.2:3000/user/${user_id}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const {name, email, password, dietPreference, foodRestrictions} =
            data;
          /*
          console.log('Name:', name);
          console.log('Email:', email);
          console.log('Diet Preference:', dietPreference);
          console.log('Food Restrictions:', foodRestrictions);
          */
          setName(name);
          setEmail(email);
          setPassword(password);
          setDietPreference(dietPreference);
          setFoodRestrictions(foodRestrictions || []);
        } else {
          console.error('Error fetching user profile data:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching user profile data:', error);
      });
  }, [user_id]);

  // Function to update user profile
  const handleSaveProfile = () => {
    // Prepare the data to be sent in the request body
    const userData = {
      user_id,
      name,
      email,
      password,
      dietPreference,
      foodRestrictions,
    };

    fetch('http://10.0.2.2:3000/update-user-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from server:', data);
        // If the response is successful, set isEditing to false to exit edit mode
        if (data.success) {
          setIsEditing(false);
          // Navigate to the Dashboard screen after successfully updating the profile
          navigation.navigate('Dashboard', {user_id, email, password, dietPreference, foodRestrictions});
        } else {
          console.error('Error updating user profile:', data.message);
        }
      })
      .catch(error => {
        console.error('Error updating user profile:', error);
      });
  };

  // Function to add a food restriction
  const handleAddFoodRestriction = restriction => {
    setFoodRestrictions([...foodRestrictions, restriction]);
  };

  // Function to remove a food restriction
  const handleRemoveFoodRestriction = restriction => {
    if (foodRestrictions && foodRestrictions.length > 0) {
      setFoodRestrictions(
        foodRestrictions.filter(item => item !== restriction),
      );
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.topBar} />
      <View style={styles.container}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.labelGreeting}>Hello, {name}</Text>
        <Text style={styles.label}>Email: {email}</Text>
        <Text style={styles.label}>Diet Preference: {dietPreference}</Text>
        <Text style={styles.label}>
          Food Restrictions:{' '}
          {foodRestrictions.length > 0
            ? foodRestrictions.join(', ')
            : 'No food restrictions'}
        </Text>

        {isEditing && (
          <>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.inputPassword}
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry={!showPassword} // Show the password in plain text when showPassword is true
              editable={true}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}>
              <Text style={styles.showPasswordButtonText}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Diet Preference */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDietModal(true)}>
          <Text>{dietPreference}</Text>
        </TouchableOpacity>

        {/* Food Restrictions */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowRestrictionModal(true)}>
          <Text>
            {foodRestrictions.length > 0
              ? foodRestrictions.join(', ')
              : 'No food restrictions'}
          </Text>
        </TouchableOpacity>

        {/* Diet Preference Modal */}
        <Modal visible={showDietModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              {dietPreferenceOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    setDietPreference(option);
                    setShowDietModal(false);
                  }}>
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Close button for Diet Preference Modal */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDietModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Food Restrictions Modal */}
        <Modal
          visible={showRestrictionModal}
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
              onPress={() => setShowRestrictionModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {isEditing ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#CD6D15',
    height: 24,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  labelGreeting: {
    fontSize: 25,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  inputPassword: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
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
  saveButton: {
    backgroundColor: '#CD6D15',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSelected: {
    color: 'green',
  },
  showPasswordButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  showPasswordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfile;
