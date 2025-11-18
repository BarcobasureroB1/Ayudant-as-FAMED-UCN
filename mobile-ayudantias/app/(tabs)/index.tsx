
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View, ScrollView, Alert } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
//import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
//import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
//import * as SecureStore from 'expo-secure-store';
import { usePostulante } from '@/context/PostulanteContext';
import { PostulacionData } from '@/hooks/usePostulacion';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <ThemedView style={styles.infoCard}>
    <ThemedText type="subtitle" style={styles.infoCardTitle}>{title}</ThemedText>
    <View style={styles.infoCardContent}>
      {children}
    </View>
  </ThemedView>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.badge}>
    <ThemedText style={styles.badgeText}>{children}</ThemedText>
  </View>
);

const InfoRow = ({ label, value }: { label: string, value?: string | number | null }) => (
  <View style={styles.modalInfoRow}>
    <ThemedText style={styles.modalInfoLabel}>{label}</ThemedText>
    <ThemedText style={styles.modalInfoValue}>{value || 'No especificado'}</ThemedText>
  </View>
);


const ItemCard = ({ title, label1, value1, label2, value2, label3, value3 }: 
  { title: string, label1: string, value1?: string, label2: string, value2?: string, label3?: string, value3?: string }) => (
  <View style={styles.itemCard}>
    <ThemedText style={styles.itemTitle}>{title}</ThemedText>
    <InfoRow label={label1} value={value1} />
    <InfoRow label={label2} value={value2} />
    {label3 && <InfoRow label={label3} value={value3} />}
  </View>
);


export default function PerfilScreen(){
  const { 
    user,
    alumno,
    curriculum,
    postulaciones,
    cancelarPostulacion,
    actividadesExtracurriculares,
    actividadesCientificas,
    cursosTitulosGrados,
    ayudantias,
    ayudantiasAnteriores
  } = usePostulante();

  const router = useRouter();

  const { setToken, setUsertipo } = useAuth();
  const clienteQuery = useQueryClient();
  
  const [mostrarCurriculum, setMostrarCurriculum] = useState(false);
  const [mostrarPostulacion, setMostrarPostulacion] = useState(false);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<PostulacionData | null>(null);

  const abrirModalPostulacion = (postulacion: PostulacionData) => {
    setPostulacionSeleccionada(postulacion);
    setMostrarPostulacion(true);
  };

  const handleCancelarPostulacion = (id: number) => {
    Alert.alert(
      "Cancelar Postulación",
      "¿Estás seguro de que quieres cancelar esta postulación?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, Cancelar", 
          style: "destructive",
          onPress: () => cancelarPostulacion.mutate({ id })
        }
      ]
    );
  };

  const logout = () => {
    clienteQuery.clear();
    if (setToken)
    {
      setToken(null);
    }

    if (setUsertipo)
    {
      setUsertipo(null);
    }
    //SecureStore.deleteItemAsync('token');
    //SecureStore.deleteItemAsync('tipoUser');
    router.replace('/(auth)/login');
  }


  return(
    <ParallaxScrollView
      headerBackgroundColor={{light: '#F0F0F0', dark: '#353636'}}
      headerImage={
        <Ionicons
          size={280}
          color="#808080"
          name="person-circle-outline"
          style={styles.headerImage}
        /> 
      }>
      
      <ThemedText style={styles.titleContainer}>
        <ThemedText type="title">Mi perfil</ThemedText>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#c70039"/>
          <ThemedText style={styles.logoutButtonText}>Salir</ThemedText>
        </TouchableOpacity>
      </ThemedText>


      <View style={styles.columnContainer}>
        <InfoCard title="Información Personal">
          <InfoRow label="RUT" value={user?.rut}/>
          <InfoRow label="Nombre" value={`${user?.nombres} ${user?.apellidos}`}/>
          <InfoRow label="Correo" value={curriculum?.correo}/>
          <InfoRow label="Año de ingreso" value={alumno?.fecha_admision}/>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Semestre Actual</ThemedText>
            <Badge>{alumno?.nivel}</Badge>
          </View>
        </InfoCard>

        <TouchableOpacity
          style={[styles.button, styles.buttonBlue]}
          onPress={() => setMostrarCurriculum(true)}>
          <Ionicons name="document-text-outline" size={18} color="#fff"/>
          <ThemedText style={styles.buttonText}>Ver Curriculum Completo</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonYellow]}
          onPress={() => router.push('/editar-curriculum')}>
          <Ionicons name="pencil-outline" size={18} color="#333"/>
          <ThemedText style={[styles.buttonText, styles.buttonTextDark]}>Editar Curriculum</ThemedText>
        </TouchableOpacity>
      </View>

        <View style={styles.columnContainer}>
          <InfoCard title="Postulaciones Activas">
            {postulaciones && postulaciones.length > 0 ? (
              postulaciones.map((p) => (
                <View key={p.id} style={styles.postulacionCard}>
                  <ThemedText style={styles.postulacionTitle}>{p.nombre_asignatura}</ThemedText>
                  <View style={styles.postulacionBotones}>
                    <TouchableOpacity
                      style={[styles.buttonSmall, styles.buttonSmallBlue]}
                      onPress={() => abrirModalPostulacion(p)}>
                        <ThemedText style={styles.buttonSmallText}>Ver</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.buttonSmall, styles.buttonSmallYellow]}
                        onPress={() => router.push(`/editar-postulacion/${p.id}`)}>
                          <ThemedText style={styles.buttonSmallText}>Editar</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.buttonSmall, styles.buttonSmallRed]}
                        onPress={() => handleCancelarPostulacion(p.id)}>
                          <ThemedText style={styles.buttonSmallText}>Cancelar</ThemedText>
                      </TouchableOpacity>
                  </View>
                </View>
              ))
            ): (
              <View style={styles.noPostulaciones}>
                <Ionicons name="file-tray-outline" size={64} color="#ccc"/>
                <ThemedText style={styles.noPostulacionesText}>No hay postulaciones activas</ThemedText>
                <ThemedText style={styles.noPostulacionesSubText}>Ve a la pestaña Postular para crear una</ThemedText>
              </View>
            )}
          </InfoCard>
        </View>

      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={mostrarCurriculum}
        onRequestClose={() => setMostrarCurriculum(false)}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="title">Curriculum Vitae</ThemedText>
                <TouchableOpacity onPress={() => setMostrarCurriculum(false)}>
                  <Ionicons name="close-circle" size={30} color="#ccc"/>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <InfoCard title="Información Personal">
                  <InfoRow label="RUT" value={curriculum?.usuario.rut}/>
                  <InfoRow label="Nombre" value={`${curriculum?.nombres} ${curriculum?.apellidos}`}/>
                  <InfoRow label="Fecha de Nacimiento" value={curriculum?.fecha_nacimiento}/>
                  <InfoRow label="Comuna" value={curriculum?.comuna}/>
                  <InfoRow label="Ciudad" value={curriculum?.ciudad}/>
                  <InfoRow label="Celular" value={curriculum?.Num_Celular}/>
                  <InfoRow label="Correo" value={curriculum?.correo}/>
                  <InfoRow label="Carrera" value={curriculum?.carrera}/>
                  <InfoRow label="Otros" value={curriculum?.otros}/>
                </InfoCard>

                {ayudantias && ayudantias.length > 0 && (
                  <InfoCard title="Ayudantías Currículum">
                    {ayudantias.map((a) => (
                      <ItemCard
                        key={a.id}
                        title={a.nombre_asig}
                        label1="Coordinador"
                        value1={a.nombre_coordinador}
                        label2="Evaluación"
                        value2={a.evaluacion}
                      />
                    ))}
                  </InfoCard>
                )}

                {ayudantiasAnteriores && ayudantiasAnteriores.length > 0 && (
                  <InfoCard title="Ayudantías Anteriores">
                    {ayudantiasAnteriores.map((a) => (
                      <ItemCard
                        key={a.id}
                        title={a.nombre_asig}
                        label1="Coordinador"
                        value1={a.n_coordinador}
                        label2="RUT Coordinador"
                        value2={a.rut_coordinador_otro}
                        label3="Evaluación"
                        value3={a.evaluacion}
                      />
                    ))}
                  </InfoCard>
                )}

                {cursosTitulosGrados && cursosTitulosGrados.length > 0 && (
                  <InfoCard title="Cursos, Títulos y Grados">
                    {cursosTitulosGrados.map((c) => (
                      <ItemCard
                        key={c.id}
                        title={c.nombre_asig}
                        label1="Coordinador"
                        value1={c.n_coordinador}
                        label2="Evaluación"
                        value2={c.evaluacion}
                      />
                    ))}
                  </InfoCard>
                )}

                {actividadesCientificas && actividadesCientificas.length > 0 && (
                  <InfoCard title="Actividades Cientificas">
                    {actividadesCientificas.map((a) => (
                      <ItemCard
                        key={a.id}
                        title={a.nombre}
                        label1="Descripción"
                        value1={a.descripcion}
                        label2="Periodo"
                        value2={a.periodo_participacion}
                      />
                    ))}
                  </InfoCard>
                )}

                {actividadesExtracurriculares && actividadesExtracurriculares.length > 0 && (
                  <InfoCard title="Actividades Extracurriculares">
                    {actividadesExtracurriculares.map((a) => (
                      <ItemCard
                        key={a.id}
                        title={a.nombre}
                        label1="Docente"
                        value1={a.docente}
                        label2="Descripción"
                        value2={a.descripcion}
                        label3="Periodo"
                        value3={a.periodo_participacion}
                      />
                    ))}
                  </InfoCard>
                )}
              </ScrollView>
            </ThemedText>
          </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={mostrarPostulacion}
        onRequestClose={() => setMostrarPostulacion(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedText style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Detalle Postulación</ThemedText>
              <TouchableOpacity onPress={() => setMostrarPostulacion(false)}>
                <Ionicons name="close-circle" size={30} color="#ccc"/>
              </TouchableOpacity>
            </View>
            
            {postulacionSeleccionada && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <InfoCard title="Información">
                  <InfoRow label="Asignatura" value={postulacionSeleccionada.nombre_asignatura} />
                  <InfoRow label="Correo Profesor" value={postulacionSeleccionada.correo_profe} />
                  <InfoRow label="Actividad" value={postulacionSeleccionada.actividad}/>
                  <InfoRow label="Metodología" value={postulacionSeleccionada.metodologia} />
                  <InfoRow label="Día" value={postulacionSeleccionada.dia}/>
                  <InfoRow label="Bloque" value={postulacionSeleccionada.bloque}/>
                </InfoCard>
                <InfoCard title="Carta de Interés">
                  <ThemedText style={styles.cartaInteres}>
                    {postulacionSeleccionada.descripcion_carta}
                  </ThemedText>
                </InfoCard>
              </ScrollView>
            )}
          </ThemedText>
        </View>
      </Modal>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -80,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF0F0', 
  },
  logoutButtonText: {
    marginLeft: 4,
    color: '#C70039', 
    fontWeight: '600',
    fontSize: 14,
  },
  columnContainer: {
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  
  infoCard: {
    padding: 16,
    borderRadius: 12,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    
    elevation: 2,
  },
  infoCardTitle: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 12,
    fontWeight: '600',
  },
  infoCardContent: {
    gap: 12,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
 
  badge: {
    backgroundColor: '#e6f7ff', 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#0056b3', 
    fontSize: 14,
    fontWeight: '600',
  },
 
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  buttonBlue: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonYellow: {
    backgroundColor: '#ffc107',
  },
  buttonTextDark: {
    color: '#333',
  },
  
  postulacionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  postulacionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  postulacionBotones: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonSmallBlue: { backgroundColor: '#e6f7ff' },
  buttonSmallYellow: { backgroundColor: '#fffbe6' },
  buttonSmallRed: { backgroundColor: '#ffebee' },
  buttonSmallText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
 
  noPostulaciones: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  noPostulacionesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#aaa',
  },
  noPostulacionesSubText: {
    fontSize: 14,
    color: '#ccc',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '85%', 
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalInfoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cartaInteres: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    padding: 8,
  }
});

/*export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}


const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
*/