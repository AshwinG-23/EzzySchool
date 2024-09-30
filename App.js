import 'react-native-gesture-handler';
import React from 'react'
import SignIn from './src/SignIn'
import SignUp from './src/SignUp'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigatorScreen from './src/Screens/NavigatorScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const Stack = createStackNavigator();
  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='SignIn'>
          <Stack.Screen name='SignIn' component={SignIn} options={{headerShown:false}}></Stack.Screen>
          <Stack.Screen name='SignUp' component={SignUp} options={{headerShown:false}}></Stack.Screen>
          <Stack.Screen name='HomeMain' component={NavigatorScreen} options={{headerShown:false}}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}