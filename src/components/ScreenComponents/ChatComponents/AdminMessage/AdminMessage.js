import React from 'react';
import { Text, View } from 'react-native';

export default function AdminMessage(props) {
  const { message } = props;
  return (
    <>
      <View style={style.container}>
        <Text style={style.message}>{message.message}</Text>
      </View>
    </>
  );
};

const style = {
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12
  },
  message: {
    fontSize: 18,
    color: '#ccc'
  }
};