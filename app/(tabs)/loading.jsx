// app/loading.js
import React from 'react';
import { View, Image, StyleSheet, ImageBackground } from 'react-native';

export default function LoadingScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/main-bg.jpg')} // Replace with your background image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/logo-with-glow-new.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
});
