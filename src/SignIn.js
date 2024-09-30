import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import splash from '../assets/Splash.png';
import { useNavigation } from '@react-navigation/native';

export default function SignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        setLoading(false);
        Alert.alert('Success', 'Signed in successfully');
        navigation.navigate('HomeMain');
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'No user found with this email');
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert('Error', 'Incorrect password');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'Invalid email format');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  return (
    <View className="">
      <View className="h-1/2 bg-white">
        <View className="flex-1">
          <Image
            source={splash}
            className="w-full flex-1 rounded-bl-3xl"
          />
          <View className="absolute bottom-0 w-full items-center z-10 mb-10">
            <Text className="text-white text-5xl">Sign In</Text>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: '#473f97' }} className="h-1/2">
        <View className="bg-white p-7 rounded-tr-3xl flex-1">
          <View className="mt-5">
            <Text className="text-black text-2xl">Email</Text>
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-4"
              placeholder="example@xmail.com"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
            />
            <Text className="text-black text-2xl mt-5">Password</Text>
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-4"
              placeholder="Password"
              placeholderTextColor="gray"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View>
            <TouchableOpacity
              className="absolute right-0 top-0  mt-1"
            >
              <Text className="text-blue-500 text-sm">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-12">
            <TouchableOpacity
              className="bg-pink-500 py-3 rounded-2xl"
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-white text-center text-lg">{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>

          <View className="">
            <TouchableOpacity
              className="py-3 rounded-2xl"
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text className="text-black text-center text-s">Not a User? Sign Up!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
