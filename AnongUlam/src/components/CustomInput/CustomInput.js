import {View, TextInput, StyleSheet} from 'react-native'
import React from 'react'

const CustomInput = ({value, onChangeText, placeholder, secureTextEntry}) => {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={secureTextEntry}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,

    paddingHorizontal: 10,
    marginVertical: 5,
  },
})

export default CustomInput
