import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const TopBar = ({email, password, user_id}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = useNavigation();
  const handleMenuPress = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUserProfilePress = () => {
    navigation.navigate('UserProfile', {email, password, user_id});
  };

  const handleHomePress = () => {
    navigation.navigate('Dashboard', {email, password, user_id});
  };

  const handleSearchPress = () => { 
    navigation.navigate('SearchScreen', {email, password, user_id})
  }

  const handleYourMealsPress = () => { 
    navigation.navigate('YourMeals', { email, password, user_id});
  };

  const handleIngredientsPress = () => {
    navigation.navigate('GroceryList', {email, password, user_id});
  };

  const handlePantryPress = () => {
    navigation.navigate('PantryList', {email, password, user_id});
  };

  const handleLogoutPress = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleMenuPress}>
        <FontAwesomeIcon
          style={styles.icons}
          icon={faBars}
          size={30}
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUserProfilePress}>
        <FontAwesomeIcon
          style={styles.icons}
          icon={faUser}
          size={25}
          color="white"
        />
      </TouchableOpacity>
      {isSidebarOpen && (
        <View style={styles.sidebarMenu}>
          <Text style={styles.textContent} onPress={handleHomePress}>
            Home
          </Text>
          <Text style={styles.textContent} onPress={handleSearchPress}>
            Search Meals
          </Text>
          <Text style={styles.textContent} onPress={handleYourMealsPress}>
            Your Meals
          </Text>
          <Text style={styles.textContent} onPress={handleIngredientsPress}>
            Grocery List
          </Text>
          <Text style={styles.textContent} onPress={handlePantryPress}>
            Pantry
          </Text>
          <Text style={styles.textContent} onPress={handleLogoutPress}>
            Logout
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    backgroundColor: '#CD6D15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  icons: {
    marginHorizontal: 20,
  },
  sidebarMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 250,
    height: 750,
    backgroundColor: '#F2EBE5',
    zIndex: 2,
  },
  textContent: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    color: '#CD6D15',
  },
});

export default TopBar;
