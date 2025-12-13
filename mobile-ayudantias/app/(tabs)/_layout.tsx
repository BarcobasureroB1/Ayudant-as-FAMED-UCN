import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/use-color-scheme'; 
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlumnoProfile } from '@/hooks/useAlumnoProfile';
import {
  useComprobarCurriculum,
  useActividadesExtracurriculares,
  useActividadescientificas,
  useCursos_titulos_grados,
  useAyudantias
} from '@/hooks/useCurriculum';
import { useAyudantiasPorAlumno } from '@/hooks/useAyudantia';
import { usePostulacionesPorAlumno, useCancelarPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { PostulanteContexto, PostulanteContextType } from '@/context/PostulanteContext';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';


function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

const AppLoadingScreen = () => (
  <ThemedView style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007bff"/>
  </ThemedView>
);

export default function TabLayout() {
  const { setToken, setUsertipo} = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [appReady, setAppReady] = useState(false);

  const colors = useThemeColors();

  const {data: user, isLoading: cargauser, isError } = useUserProfile();

  const {data: alumno, isLoading: cargaAlumno } = useAlumnoProfile(user?.rut);
  const {data: curriculum, isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);
  const {data: actividadesExtracurriculares, isLoading: cargaExtra } = useActividadesExtracurriculares(user?.rut);
  const {data: actividadesCientificas, isLoading: cargaCientifica } = useActividadescientificas(user?.rut);
  const {data: cursosTitulosGrados, isLoading: cargaCursos } = useCursos_titulos_grados(user?.rut);
  const {data: ayudantias, isLoading: cargaAyudantias } = useAyudantias(user?.rut);
  const {data: ayudantiasAnteriores, isLoading: cargaAyuAnteriores } = useAyudantiasPorAlumno(user?.rut);
  const {data: postulaciones, isLoading: cargaPostulaciones } = usePostulacionesPorAlumno(user?.rut);
  const {data: asignaturasDisponibles, isLoading: cargaAsigDisp } = useAsignaturasDisponiblesPostulacion(user?.rut);
  const {data: asignaturasTodas, isLoading: cargaAsigTodas } = useTodasAsignaturas();
  const cancelarPostulacion = useCancelarPostulacion();

  /*useEffect(() => {
    if (!cargauser && !cargaCurriculum && !cargaAlumno)
    {
      if (!curriculum)
      {
        router.replace('/crear-curriculum');
      } else {
        setAppReady(true);
      }
    }
  }, [cargauser, cargaCurriculum, cargaAlumno, curriculum, router]);*/

  useEffect(() => {

    if (cargauser)
    {
      return;
    }

    console.log("ruuut: ", user.rut);
    if (!user || !user.rut)
    {
      setToken(null);
      setUsertipo(null);
      router.replace('/(auth)/login');
      console.log("devolviendo");
      return;
    }

    if (cargaCurriculum)
    {
      return;
    }


    if (!curriculum)
    {
      router.replace('/crear-curriculum');
      return;
    }

    if (
      cargaAlumno ||
      cargaExtra ||
      cargaCientifica ||
      cargaCursos ||
      cargaAyudantias ||
      cargaAyuAnteriores ||
      cargaPostulaciones ||
      cargaAsigDisp ||
      cargaAsigTodas
    ) {
      return;
    }

    setAppReady(true);

  }, [cargauser, user, cargaAlumno, cargaCurriculum, curriculum, router, cargaExtra, cargaCientifica, cargaCursos, cargaAyudantias, cargaAyuAnteriores, cargaPostulaciones, cargaAsigDisp, cargaAsigTodas,setToken, setUsertipo, isError]);

  if (!appReady)
  {
    return <AppLoadingScreen/>;
  }

  const contextoValue = { 
    user,
    alumno,
    curriculum,
    postulaciones,
    actividadesExtracurriculares,
    actividadesCientificas,
    cursosTitulosGrados,
    ayudantias,
    ayudantiasAnteriores,
    asignaturasDisponibles,
    asignaturasTodas,
    cancelarPostulacion,
  };

  return (
    <PostulanteContexto.Provider value={contextoValue as PostulanteContextType}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textPlaceholder,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.inputBorder,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
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
      </Tabs>
    </PostulanteContexto.Provider>
  );
}


  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
    }
});