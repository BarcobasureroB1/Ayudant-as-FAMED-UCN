import React, { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProveedorAuth, useAuth } from '../context/AuthContext';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync(); //para evitar que se oculte la pantalla de inicio

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

    const appPantallas = 
      segmentos[0] === 'crear-curriculum' || 
      segmentos[0] === 'editar-curriculum' ||
      segmentos[0] === 'editar-postulacion';

    if (token && tipoUser === 'alumno')
    {
      // si se logueo y es postulante se manda a la app
      if(!appGrupo && !appPantallas)
      {
        router.replace('/(tabs)');
      }
    } else if (!token || tipoUser !== 'alumno')
    {
      //si no esta logueado o si no es postulante se manda al login 
      if (!authGrupo)
      {
        router.replace('/(auth)/login');
      }
    }

    //muestra la app y oculta la vista de carga al inicio (login y register)
    setEstadoNav(true);
  }, [token, loading, tipoUser, segmentos, router]);

  const vistaRaiz = useCallback(async () => {
    //se oculta el splash para cargar la vista correcta
    if (estadoNav)
    {
      await SplashScreen.hideAsync();
    }
  }, [estadoNav]);

  //si la navegacion aun no carga, no muestra nada
 if (!estadoNav) {
  return null;
  
 }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme: DefaultTheme}>
      <View style={ {flex: 1}} onLayout={vistaRaiz}>
        <Stack screenOptions={{headerShown: false }}>
          <Stack.Screen name = "(auth)"/>
          <Stack.Screen name="(tabs)"/>

          <Stack.Screen
            name="crear-curriculum"
            options={{
              headerShown: true,
              title: 'Crear Currículum',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="editar-curriculum"
            options={{
              headerShown: true,
              title: 'Editar Currículum',
              headerBackTitle: 'Atrás'
            }}
          />
          <Stack.Screen
            name="editar-postulacion/[id]"
            options={{
              headerShown: true,
              title: 'Editar Postulación',
              headerBackTitle: 'Atrás'
            }}
          />

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
