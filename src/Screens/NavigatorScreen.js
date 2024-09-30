import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import CustomHeader from '../components/CustomHeader';
import auth from '@react-native-firebase/auth';

const CustomDrawerContent = (props) => {
  const [userName, setUserName] = useState('');
  const Navigation = useNavigation();

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserName(user.displayName || "User");
    }
  }, []);

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Navigation.navigate('SignIn');
      })
      .catch(error => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 0 }}>
      <View className="bg-[#473f97] h-20 justify-center items-center m-0">
        <Text className="text-white text-2xl font-bold">Hello {userName}</Text>
      </View>

      <DrawerItemList {...props} />

      <DrawerItem
        label="Logout"
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

export default function NavigatorScreen() {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ headerTitle: null }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: null }} />
    </Drawer.Navigator>
  );
}
