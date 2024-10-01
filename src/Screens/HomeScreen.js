import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ScrollView } from 'react-native-gesture-handler';
import { ClassContext } from '../components/globalClassContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [modalVisibleJoin, setmodalVisibleJoin] = useState(false);
  const [modalVisibleCreate, setmodalVisibleCreate] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [classData, setClassData] = useState([]);
  const { classes, fetchClasses } = useContext(ClassContext);
  const navigation = useNavigation();
  let generatedCode

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const updatedClasses = await Promise.all(
        classes.map(async (item) => {
          const teacherDoc = await firestore().collection('users').doc(item.teacherId).get();
          const teacherName = teacherDoc.exists ? teacherDoc.data().name : 'Unknown';
          return { ...item, teacherName };
        })
      );
      setClassData(updatedClasses);
    } catch (error) {
      console.error("Error fetching class details: ", error);
    }
  };

  const generateClassCode = () => {
    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  const joinClass = async () => {
    if (!classCode) {
      Alert.alert('Error', 'Please enter a code');
      return;
    }

    try {
      await firestore().collection('classes').doc(classCode).update({
        participants: firestore.FieldValue.arrayUnion(userId),
      });
      await firestore().collection('users').doc(userId).update({
        classes: firestore.FieldValue.arrayUnion(classCode),
      });
      setClassCode('');
      fetchClasses(userId);
      setmodalVisibleJoin(false);
    } catch (error) {
      if (error.code === 'firestore/not-found') {
        Alert.alert('Error', 'Classroom does not exist');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const createClass = async () => {
    generatedCode = generateClassCode();

    if (!className || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await firestore().collection('classes').doc(generatedCode).set({
        className: className,
        description: description,
        code: generatedCode,
        teacherId: userId,
        participants: [userId],
      });

      await firestore().collection('users').doc(userId).update({
        classes: firestore.FieldValue.arrayUnion(generatedCode),
      });

      setmodalVisibleCreate(false);
      Alert.alert('Class Created', `Class Code: ${generatedCode}`);
      setClassName('');
      setDescription('');
      fetchClasses(userId);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Text className="m-4 mb-0 text-black text-xl">Your Classes</Text>
      <ScrollView>
        {classData.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              navigation.navigate('ClassroomHome', {
                classId: item.id,
                className: item.className,
                description: item.description,
                userId: userId,
                teacherId: item.teacherId,
              })
            }
            className="p-4 flex-row bg-red-100 rounded-lg shadow-md m-3 items-center">
            <View className="flex-1">
              <Text className="text-black text-xl m-2 font-semibold">{item.className}</Text>
              <Text className="text-gray-700 m-2 mb-0 text-s">Teacher: {item.teacherName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleJoin}
        onRequestClose={() => {
          setmodalVisibleJoin(!modalVisibleJoin);
        }}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-4">Join a Class</Text>
            <TextInput
              className="border border-gray-300 text-black text-lg rounded-md px-3 py-2 mb-3"
              placeholder="Class Code"
              value={classCode}
              onChangeText={setClassCode}
            />
            <View className="flex-row justify-between mt-1">
              <TouchableOpacity
                className="bg-customPurple py-2 px-4 rounded-lg"
                onPress={joinClass}>
                <Text className="text-white">Join Class</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 py-2 px-4 rounded-lg"
                onPress={() => setmodalVisibleJoin(false)}>
                <Text className="text-black">Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
                className="py-2 px-4 rounded-lg self-center"
                onPress={() => {setmodalVisibleCreate(true); setmodalVisibleJoin(false);}}>
                <Text className="text-black">Want to create your own class?</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleCreate}
        onRequestClose={() => {
          setmodalVisibleCreate(!modalVisibleCreate);
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
                onPress={() => setmodalVisibleCreate(false)}>
                <Text className="text-black">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        className="absolute bottom-10 right-10 bg-customPurple p-4 rounded-full"
        onPress={() => setmodalVisibleJoin(true)}>
        <Text className="text-white text-lg">+</Text>
      </TouchableOpacity>
    </View>
  );
}
