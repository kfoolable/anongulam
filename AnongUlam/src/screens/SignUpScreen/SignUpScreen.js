import React, {useState} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Logo from '../../../assets/images/au_logo.png';
import CustomInput from '../../components/CustomInput/CustomInput';
import CustomButton from '../../components/CustomButton/CustomButton';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onCreateAccountPressed = () => {
    if (!name || !email || !password) {
      console.log('Please fill in all the required fields.');
      return;
    }

    // Simulating user creation and navigation to the PreferenceScreen
    const userData = {
      name,
      email,
      password,
    };

    // You can save the user data to your backend or any data store as per your requirements.

    // Navigate to PreferenceScreen with user details as route parameters
    navigation.navigate('Preference', userData);
  };

  const onCancelPressed = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.root}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />

      <CustomInput placeholder="Name" value={name} onChangeText={setName} />
      <CustomInput placeholder="Email" value={email} onChangeText={setEmail} />
      <CustomInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton text="Create Account" onPress={onCreateAccountPressed} />
      <CustomButton text="Cancel" onPress={onCancelPressed} />
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

export default SignUpScreen;
