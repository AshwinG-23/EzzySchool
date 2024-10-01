import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ClassroomHome({ route }) {
  const [modalVisiblePost, setModalVisiblePost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescrip, setPostDescrip] = useState('');
  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState('');
  const { classId, className, description, userId, teacherId } = route.params;

  let role = 'S';
  if (teacherId === userId) {
    role = 'T';
  }

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserName(currentUser.displayName || 'Teacher');
    }

    const unsubscribe = firestore()
      .collection('classes')
      .doc(classId)
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const postList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postList);
        },
        (error) => {
          console.error('Error fetching posts: ', error);
        }
      );

    return () => unsubscribe();
  }, []);

  const postAssign = async () => {
    if (!postTitle || !postDescrip) {
      Alert.alert('Error', 'Please fill the required fields');
      return;
    }

    try {
      await firestore()
        .collection('classes')
        .doc(classId)
        .collection('posts')
        .add({
          authorId: userId,
          authorName: userName,
          content: postDescrip,
          title: postTitle,
          type: 'Announcement',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      setModalVisiblePost(false);
      setPostTitle('');
      setPostDescrip('');
      Alert.alert('Success', `Post "${postTitle}" created successfully!`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="bg-pink-200 flex justify-between p-5 rounded-xl">
        <Text className="text-black text-3xl mt-3 font-semibold">{className}</Text>
        <Text className="text-black bottom-0 text-base">{description}</Text>
      </View>
      <Text className="text-black text-2xl font-semibold m-3">Class Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 m-2 rounded-lg shadow-md">
            <Text className="text-black text-xl font-semibold">{item.title}</Text>
            <Text className="text-gray-700">{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">No posts available</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisiblePost}
        onRequestClose={() => {
          setModalVisiblePost(!modalVisiblePost);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold mb-4">Announce something to the Class</Text>
            <TextInput
              className="border border-gray-300 text-black text-lg rounded-md px-3 py-2 mb-3"
              placeholder="Post Title"
              value={postTitle}
              onChangeText={setPostTitle}
            />
            <TextInput
              className="border border-gray-300 text-black text-lg rounded-md px-3 py-2 mb-3"
              placeholder="Post Description"
              value={postDescrip}
              onChangeText={setPostDescrip}
            />
            <View className="flex-row justify-between mt-1">
              <TouchableOpacity className="bg-customPurple py-2 px-4 rounded-lg" onPress={postAssign}>
                <Text className="text-white">Create Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 py-2 px-4 rounded-lg"
                onPress={() => setModalVisiblePost(false)}
              >
                <Text className="text-black">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {role === 'T' ? (
        <TouchableOpacity
          className="absolute bottom-10 right-10 bg-customPurple p-4 rounded-full"
          onPress={() => setModalVisiblePost(true)}
        >
          <Text className="text-white text-lg">+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
