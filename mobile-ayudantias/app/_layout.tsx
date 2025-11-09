import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProveedorAuth, useAuth } from '../context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';


const queryCliente = new QueryClient();

function RootLayoutNav() {
  const { token, loading, tipoUser } = useAuth();
  const router = useRouter();
  const segmentos = useSegments();

  const colorScheme = useColorScheme() ?? 'light';

  //redireccion
  useEffect(() => {
    if (loading)
    {
      return;
    }

    const appGrupo = segmentos[0] === '(tabs)';

    if (token && tipoUser === 'postulante')
    {
      // si se logueo y es postulante se manda a la app
      if(!appGrupo)
      {
        router.replace('/(tabs)');
      }
    } else if (!token)
    {
      //si no esta logueado se manda al login 
      if (appGrupo)
      {
        router.replace('/login');
      }
    } else if (tipoUser !== 'postulante')
      // y si no es postulante tambien se manda al login
      if(appGrupo)
      {
        router.replace('/login')
      }
  }, [token, loading, tipoUser, segmentos, router]);


  if(loading)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'black'}/>
      </View>
    );
  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme: DefaultTheme}>
      <Stack screenOptions={{headerShown: false }}>
        <Stack.Screen name = "login"/>
        <Stack.Screen name = "register"/>
        <Stack.Screen name="(app)"/>
        <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
      </Stack>
      <StatusBar style = {colorScheme === 'dark' ? 'light' : 'dark'}/>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryCliente}>
      <ProveedorAuth>
        <RootLayoutNav/>
      </ProveedorAuth>
    </QueryClientProvider>
  );
}
