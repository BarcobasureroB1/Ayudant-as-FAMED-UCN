import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/use-color-scheme'; 

function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = {
    light: { text: '#000', background: '#fff', active: '#007bff', inactive: 'gray' },
    dark: { text: '#fff', background: '#000', active: '#007bff', inactive: 'gray' },
  };
  const theme = colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.active,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.background,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
        }
      }}>
      <Tabs.Screen
        name="index" // archivo index.tsx
        options={{
          title: 'Mi Perfil', // texto que verá el usuario
          tabBarIcon: ({ color }) => <TabBarIcon name="person-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="postular" // se refiere al archivo postular.tsx
        options={{
          title: 'Postular', // texto que verá el usuario
          tabBarIcon: ({ color }) => <TabBarIcon name="paper-plane-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, 
        }}
      />
    </Tabs>
  );
}