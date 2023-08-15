import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomInput from '../../components/CustomInput/CustomInput';
import CustomButton from '../../components/CustomButton/CustomButton';
import Logo from '../../../assets/images/au_logo.png';
import axios from 'axios';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear email and password when the component mounts (initial render)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setEmail('');
      setPassword('');
    });

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, [navigation]);

  const onLoginPressed = () => {
    // Make API call to login the user and send email and password
    axios
      .post('http://10.0.2.2:3000/login', {
        email,
        password,
      })
      .then(response => {
        const {user_id} = response.data; // Extract the user_id from the response data
        navigation.navigate('Dashboard', {user_id, email, password});
      })
      .catch(error => {
        // Handle error, e.g., show an error alert
        if (error.response && error.response.data) {
          Alert.alert('Error', error.response.data.error);
        } else {
          Alert.alert('Error', 'An error occurred. Please try again later.');
        }
      });
  };

  const onRegisterPressed = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.root}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <CustomInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={text => setPassword(text)}
      />

      <CustomButton text="Log in" onPress={onLoginPressed} />
      <CustomButton text="Register" onPress={onRegisterPressed} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    marginTop: 90,
  },
  logo: {
    width: 300,
    height: 300,
  },
});

export default LoginScreen;
