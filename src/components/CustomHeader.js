import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import splash from '../../assets/AppIcon.png';

const CustomHeader = ({ studentName, studentImage }) => {
  const navigation = useNavigation();
  const defaultStudentImage = require('./../../assets/Default_pfp.jpg');
  const drawerOpener = require('./../../assets/drawerOpener.png');

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-[#473f97]">
      <TouchableOpacity onPress={openDrawer} className="p-2">
        <Image source={drawerOpener} className="w-10 h-10 bg-transparent" />
      </TouchableOpacity>
      <View className="flex-1 flex-row items-center gap-2 pl-4">
        <Image source={splash} className="w-10 h-10 rounded-full" />
        <Text className="text-white text-xl">Ezzy School</Text>
      </View>
      <View className="ml-2">
        <Image source={studentImage || defaultStudentImage} className="w-10 h-10 rounded-full" />
      </View>
    </View>
  );
};

export default CustomHeader;
