import { View, Text } from 'react-native'
import React from 'react'
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen'
import SignUpScreen from '../screens/SignUpScreen'
import PreferenceScreen from '../screens/PreferenceScreen'
import Dashboard from '../screens/Dashboard'
import MealView from '../screens/MealViewScreen';
import WeeklyMeal from '../screens/WeeklyMeal';
import GroceryList from '../screens/GroceryList';
import PantryList from '../screens/PantryList';
import AddPantryIngredients from '../screens/AddPantryIngredients';
import AddMeals from '../screens/AddMeals';
import YourMeals from '../screens/YourMeals';
import EditMeal from '../screens/EditMeal';
import UserProfile from '../screens/UserProfile';
import MealImage from '../screens/MealImage';
import SearchScreen from '../screens/SearchScreen/SearchScreen';

const Stack = createNativeStackNavigator()

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Preference" component={PreferenceScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="MealView" component={MealView} />
        <Stack.Screen name="WeeklyMeal" component={WeeklyMeal} />
        <Stack.Screen name="GroceryList" component={GroceryList} />
        <Stack.Screen name="PantryList" component={PantryList} />
        <Stack.Screen
          name="AddPantryIngredients"
          component={AddPantryIngredients}
        />
        <Stack.Screen name="AddMeals" component={AddMeals} />
        <Stack.Screen name="YourMeals" component={YourMeals} />
        <Stack.Screen name="EditMeal" component={EditMeal} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="MealImage" component={MealImage} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation