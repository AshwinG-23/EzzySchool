import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function HomeScreen() {
  const [classes, setClasses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userId, setUserId] = useState(null); 


  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchClasses = async () => {
        const userSnapshot = await firestore().collection('users').doc(userId).get();
        const userData = userSnapshot.data();

        if (userData.classes) {
          const classPromises = userData.classes.map(classId =>
            firestore().collection('classes').doc(classId).get()
          );
          const classSnapshots = await Promise.all(classPromises);
          const classData = classSnapshots.map(doc => ({ id: doc.id, ...doc.data() }));
          setClasses(classData);
        }
      };

      fetchClasses();
    }
  }, [userId]);

  const generateClassCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a 6-char random string
    setGeneratedCode(code);
  };

  const createClass = async () => {
    if (!className || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    generateClassCode();

    try {
      const newClassRef = await firestore().collection('classes').add({
        className: className,
        description: description,
        teacherId: userId,
        participants: [userId], 
      });

      await firestore().collection('users').doc(userId).update({
        classes: firestore.FieldValue.arrayUnion(newClassRef.id),
      });

      setClasses([...classes, { id: newClassRef.id, className, description, participants: [userId] }]);
      setModalVisible(false);
      Alert.alert('Class Created', `Class Code: ${generatedCode}`);
      setClassName('');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-300">
            <Text className="text-xl font-bold">{item.className}</Text>
            <Text className="text-gray-500">{item.description}</Text>
          </View>
        )}
      />

      {/* Modal for creating a new class */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-4">Create a New Class</Text>
            <TextInput
              className="border border-gray-300 text-black text-lg rounded-md px-3 py-2 mb-3"
              placeholder="Class Name"
              value={className}
              onChangeText={setClassName}
            />
            <TextInput
              className="border border-gray-300 text-black text-lg rounded-md px-3 py-2 mb-3"
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            {generatedCode ? (
              <Text className="text-gray-700 text-sm mb-3">Generated Code: {generatedCode}</Text>
            ) : null}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-customPurple py-2 px-4 rounded-lg"
                onPress={createClass}>
                <Text className="text-white">Create Class</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 py-2 px-4 rounded-lg"
                onPress={() => setModalVisible(false)}>
                <Text className="text-black">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        className="absolute bottom-10 right-10 bg-customPurple p-4 rounded-full"
        onPress={() => setModalVisible(true)}>
        <Text className="text-white text-lg">+</Text>
      </TouchableOpacity>
    </View>
  );
}
