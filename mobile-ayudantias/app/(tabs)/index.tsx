import React, { useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, ScrollView, SafeAreaView, StatusBar, Platform, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePostulante } from '@/context/PostulanteContext';
import { PostulacionData } from '@/hooks/usePostulacion';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '@/hooks/useThemeColors';

// Componentes internos reutilizados
import { Badge, InfoRow } from '@/components/profile/ProfileVisual';
import CurriculumModal from '@/components/profile/CurriculumModal';
import PostulacionModal from '@/components/profile/PostulacionDetalleModal';

export default function PerfilScreen() {
  const colorScheme = useColorScheme();

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
    ayudantiasAnteriores,
    loadingGlobal
  } = usePostulante();

  const router = useRouter();
  const { setToken, setUsertipo } = useAuth();
  const clienteQuery = useQueryClient();
  
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [mostrarCurriculum, setMostrarCurriculum] = useState(false);
  const [mostrarPostulacion, setMostrarPostulacion] = useState(false);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<PostulacionData | null>(null);

  // Helper para obtener iniciales
  const getInitials = () => {
    if (!user?.nombres || !user?.apellidos) return "US";
    return `${user.nombres[0]}${user.apellidos[0]}`.toUpperCase();
  };

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
    if (setToken) setToken(null);
    if (setUsertipo) setUsertipo(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.headerProfile}>
          <View style={styles.headerTopRow}>
            <ThemedText type="subtitle" style={styles.headerTitle}>Mi Perfil</ThemedText>
            <TouchableOpacity onPress={logout} style={styles.logoutIconBtn}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSummary}>
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatarText}>{getInitials()}</ThemedText>
            </View>
            <View style={styles.profileTexts}>
              <ThemedText type="title" style={styles.profileName}>
                {user?.nombres} {user?.apellidos}
              </ThemedText>
              <ThemedText style={styles.profileRut}>RUT: {user?.rut}</ThemedText>
              <View style={styles.tagsRow}>
                <Badge styles={styles}>Semestre: {alumno?.nivel || 'Estudiante'}</Badge>
                <ThemedText style={styles.admissionText}>Ingreso: {alumno?.fecha_admision}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* --- ACCIONES RÁPIDAS (Curriculum) --- */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.primary + '15' }]} 
            onPress={() => setMostrarCurriculum(true)}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="document-text" size={20} color="#fff"/>
            </View>
            <View>
              <ThemedText style={styles.actionCardTitle}>Ver CV</ThemedText>
              <ThemedText style={styles.actionCardSub}>Detalle completo</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#ffc107' + '20' }]}
            onPress={() => router.push('/editar-curriculum')}>
            <View style={[styles.iconCircle, { backgroundColor: '#ffc107' }]}>
              <Ionicons name="pencil" size={20} color="#333"/>
            </View>
            <View>
              <ThemedText style={styles.actionCardTitle}>Editar CV</ThemedText>
              <ThemedText style={styles.actionCardSub}>Actualizar datos</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- SECCIÓN DATOS PERSONALES --- */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Información de Contacto</ThemedText>
          <View style={styles.cleanCard}>
            <InfoRow label="Correo Institucional" value={user?.correo} styles={styles}/>
          </View>
        </View>

        {/* --- SECCIÓN POSTULACIONES  --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="subtitle" style={styles.sectionHeader}>Mis Postulaciones</ThemedText>
            {postulaciones && postulaciones.length > 0 && (
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>{postulaciones.length}</ThemedText>
              </View>
            )}
          </View>

          {loadingGlobal?.postulaciones ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.postulacionesContainer}>
              {postulaciones && postulaciones.length > 0 ? (
                <ScrollView 
                  style={styles.postulacionesScroll}
                  contentContainerStyle={styles.postulacionesContent}
                  nestedScrollEnabled={true} 
                  showsVerticalScrollIndicator={true}
                >
                  {postulaciones.map((p) => (
                    <View key={p.id} style={styles.modernPostulacionCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                          <Ionicons name="school-outline" size={20} color={colors.primary} />
                        </View>
                        <ThemedText style={styles.postulacionTitle} numberOfLines={1}>
                          {p.nombre_asignatura}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.divider} />

                      <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => abrirModalPostulacion(p)} style={styles.actionLink}>
                          <ThemedText style={[styles.actionLinkText, { color: colors.primary }]}>Ver</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push(`/editar-postulacion/${p.id}`)} style={styles.actionLink}>
                          <ThemedText style={[styles.actionLinkText, { color: '#f59e0b' }]}>Editar</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCancelarPostulacion(p.id)} style={styles.actionLink}>
                          <ThemedText style={[styles.actionLinkText, { color: colors.error }]}>Cancelar</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color={colors.textPlaceholder} />
                  <ThemedText style={styles.emptyStateText}>Sin postulaciones activas</ThemedText>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- MODALES --- */}
      <CurriculumModal 
        visible={mostrarCurriculum} 
        onClose={() => setMostrarCurriculum(false)}
        colors={colors}
        styles={styles} 
        curriculum={curriculum}
        loadingGlobal={loadingGlobal}
        ayudantias={ayudantias}
        ayudantiasAnteriores={ayudantiasAnteriores}
        cursosTitulosGrados={cursosTitulosGrados}
        actividadesCientificas={actividadesCientificas}
        actividadesExtracurriculares={actividadesExtracurriculares}
      />

      <PostulacionModal 
        visible={mostrarPostulacion}
        onClose={() => setMostrarPostulacion(false)}
        postulacion={postulacionSeleccionada}
        colors={colors}
        styles={styles}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  // --- Layout Base ---
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // --- Header Profile ---
  headerProfile: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoutIconBtn: {
    padding: 8,
    backgroundColor: colors.error + '10',
    borderRadius: 20,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    lineHeight: 28,
  },
  profileRut: {
    fontSize: 16,
    color: colors.textLabel,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  admissionText: {
    fontSize: 16,
    color: colors.textPlaceholder,
  },

  // --- Quick Actions Grid ---
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  actionCardSub: {
    fontSize: 11,
    color: colors.textLabel,
  },

  // --- Sections ---
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  
  // --- Clean Info Card ---
  cleanCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  // --- Postulaciones Styles ---
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  postulacionesContainer: {
  },
  postulacionesScroll: {
    maxHeight: 320, 
  },
  postulacionesContent: {
    gap: 12, 
    paddingBottom: 4, 
  },

  modernPostulacionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postulacionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginVertical: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  actionLink: {
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyStateText: {
    marginTop: 8,
    color: colors.textPlaceholder,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },

  infoCard: {
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    paddingBottom: 8,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLabel,
    marginBottom: 2,
  },
  badge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '90%', 
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    padding: 20,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  modalInfoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: colors.textLabel,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    color: colors.text,
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.inputBackground,
  },
  itemTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  cartaInteres: {
    color: colors.text,
    lineHeight: 20,
  },
});