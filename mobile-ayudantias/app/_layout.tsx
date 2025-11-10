import React, { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProveedorAuth, useAuth } from '../context/AuthContext';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync(); //

const queryCliente = new QueryClient();

function RootLayoutNav() {
  const { token, loading, tipoUser } = useAuth();
  const router = useRouter();
  const segmentos = useSegments();
  const colorScheme = useColorScheme() ?? 'light';

  const [estadoNav, setEstadoNav] = useState(false);

  //redireccion
  useEffect(() => {
    if (loading)
    {
      return;
    }

    const authGrupo = segmentos[0] === '(auth)';
    const appGrupo = segmentos[0] === '(tabs)';
    let rutaRedir = null;

    if (token && tipoUser === 'alumno')
    {
      // si se logueo y es postulante se manda a la app
      if(!appGrupo)
      {
        router.replace('/(tabs)');
      }
    } else if (!token || tipoUser !== 'alumno')
    {
      //si no esta logueado y si no es postulante se manda al login 
      if (!authGrupo)
      {
        router.replace('/(auth)/login');
      }
    }

    // redirige a la ruta correcta
    if (rutaRedir)
    {
      router.replace(rutaRedir);
    }

    //oculta el splash ()
    setEstadoNav(true);
  }, [token, loading, tipoUser, segmentos, router]);

  const vistaRaiz = useCallback(async () => {
    //se oculta el splash para cargar la vista correcta
    if (estadoNav)
    {
      await SplashScreen.hideAsync();
    }
  }, [estadoNav]);

  //si la navegacion aun no carga, se muestra cargando
  if(!estadoNav)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'black'}/>
      </View>
    );
  }
 /*if (!estadoNav) {
  return null;
  
 }*/


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme: DefaultTheme}>
      <View style={ {flex: 1}} onLayout={vistaRaiz}>
        <Stack screenOptions={{headerShown: false }}>
          <Stack.Screen name = "(auth)"/>
          <Stack.Screen name="(tabs)"/>
          <Stack.Screen name="modal" options={{presentation: 'modal', title: 'Modal'}}/>
        </Stack>
        <StatusBar style = {colorScheme === 'dark' ? 'light' : 'dark'}/>
      </View>
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
