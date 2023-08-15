import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

const MealImage = ({photoFilePath}) => {
  return (
    <View style={styles.container}>
      <Image source={{uri: photoFilePath}} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default MealImage;
