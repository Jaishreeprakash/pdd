import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/main/DashboardScreen';
import SleepScreen from '../screens/main/SleepScreen';
import EmotionScreen from '../screens/main/EmotionScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Colors } from '../constants/colors';

export type TabParamList = {
  Dashboard: undefined;
  Sleep: undefined;
  Emotion: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconMap: Record<string, string> = {
            Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
            Sleep: focused ? 'moon-waning-crescent' : 'moon-waning-crescent',
            Emotion: focused ? 'heart' : 'heart-outline',
            Activity: focused ? 'lightning-bolt' : 'lightning-bolt-outline',
            Profile: focused ? 'account-circle' : 'account-circle-outline',
          };

          const iconName = iconMap[route.name] || 'circle';

          if (route.name === 'Emotion') {
            return (
              <View style={[styles.centerIcon, { backgroundColor: focused ? Colors.primary : Colors.surfaceLight }]}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={26}
                  color={focused ? '#fff' : Colors.textMuted}
                />
              </View>
            );
          }

          return (
            <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Sleep" component={SleepScreen} />
      <Tab.Screen
        name="Emotion"
        component={EmotionScreen}
        options={{
          tabBarLabel: 'Emotion',
        }}
      />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TabNavigator;
