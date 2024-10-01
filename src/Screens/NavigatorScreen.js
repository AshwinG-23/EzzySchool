import React, { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { ClassContext } from '../components/globalClassContext';
import auth from '@react-native-firebase/auth';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import CustomHeader from '../components/CustomHeader';
import ClassroomHome from './classroomHome';
import { createStackNavigator } from '@react-navigation/stack';

const CustomDrawerContent = (props) => {
  const [userName, setUserName] = useState('');
  const { classes, fetchClasses } = useContext(ClassContext);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserName(user.displayName || 'User');
    }

    fetchClasses(userId);
  }, []);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.navigate('SignIn');
      })
      .catch(error => {
        console.error('Error signing out: ', error);
      });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 0 }}>
      <View style={{ backgroundColor: '#473f97', height: 80, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Hello {userName}</Text>
      </View>

      <DrawerItemList {...props} />

      <View>
        <Text style={{ marginTop: 16, fontSize: 18, textAlign: 'center', fontWeight: 'bold' }}>Your Classes</Text>
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <DrawerItem
              key={classItem.id}
              label={classItem.className || "N/A"}
              onPress={() =>
                navigation.navigate('ClassroomHome', {
                  classId: classItem.id,
                  className: classItem.className,
                  description: classItem.description,
                  userId: userId,
                  teacherId: classItem.teacherId,
                })
              }
            />
          ))
        ) : (
          <Text style={{ marginLeft: 16, marginTop: 8, color: 'gray' }}>No classes available</Text>
        )}
      </View>

      <DrawerItem label="Logout" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
};

const Stack = createStackNavigator();
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,}}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
      <Stack.Screen name="ClassroomHome" component={ClassroomHome} options={{ headerTitle: 'Classroom Home' }} />
    </Stack.Navigator>
  );
}

export default function NavigatorScreen() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
      }}
    >
      <Drawer.Screen name="HomeStack" component={MainStackNavigator} options={{ headerTitle: null }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: null }} />
    </Drawer.Navigator>
  );
}
