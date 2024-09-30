import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import splash from '../assets/Splash.png';
import { useNavigation } from '@react-navigation/native';

export default function SignUp() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;

        return firestore()
          .collection('users')
          .doc(userId)
          .set({
            name,
            email,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
      })
      .then(() => {
        setLoading(false);
        Alert.alert('Success', 'Account created successfully');
        navigation.navigate("SignIn");
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Error', 'The password is too weak.');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <View className="">
      <View className="h-1/2 bg-white">
        <View className="flex-1">
          <Image source={splash} className="w-full flex-1 rounded-bl-3xl" />
          <View className="absolute bottom-0 w-full items-center z-10 mb-10">
            <Text className="text-white text-5xl">Sign Up</Text>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: '#473f97' }} className="h-1/2">
        <View className="bg-white p-7 rounded-tr-3xl flex-1">
          <View className="mt-2">
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-3"
              placeholder="Name"
              placeholderTextColor="gray"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-3"
              placeholder="Email"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-3"
              placeholder="Password"
              placeholderTextColor="gray"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              className="border border-gray-300 text-black text-xl rounded-md px-3 py-2 mt-3"
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View className="mt-4">
            <TouchableOpacity className="bg-pink-500 py-3 rounded-2xl" onPress={handleSignUp}>
              <Text className="text-white text-center text-lg">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
