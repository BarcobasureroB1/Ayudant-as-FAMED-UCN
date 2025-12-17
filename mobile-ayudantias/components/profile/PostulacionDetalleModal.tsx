import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { PostulacionData } from '@/hooks/usePostulacion';

interface PostulacionModalProps {
  visible: boolean;
  onClose: () => void;
  postulacion: PostulacionData | null;
  colors: any;
  styles: any;
}

// --- Componente filas de detalle con icono ---
const DetailRow = ({ icon, label, value, colors, isLast = false }: any) => (
  <View style={[localStyles.detailRow, !isLast && { borderBottomColor: colors.inputBorder, borderBottomWidth: 1 }]}>
    <View style={[localStyles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={localStyles.detailTextContainer}>
      <ThemedText style={[localStyles.detailLabel, { color: colors.textLabel }]}>{label}</ThemedText>
      <ThemedText style={[localStyles.detailValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  </View>
);

export default function PostulacionModal({ visible, onClose, postulacion, colors, styles: parentStyles }: PostulacionModalProps) {
  
  if (!postulacion) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={parentStyles.modalContainer}>
        <View style={[parentStyles.modalContent, { backgroundColor: colors.background }]}>
          
          {/* --- HEADER DEL MODAL --- */}
          <View style={[parentStyles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="document-attach-outline" size={24} color={colors.primary} />
              <ThemedText type="title" style={{ fontSize: 20 }}>Detalle Postulación</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={26} color={colors.textPlaceholder}/>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            
            {/* --- CABECERA DE ASIGNATURA --- */}
            <View style={[localStyles.headerCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <ThemedText style={[localStyles.asignaturaTitle, { color: colors.text }]}>
                {postulacion.nombre_asignatura}
              </ThemedText>
              <View style={[localStyles.badge, { backgroundColor: colors.primary }]}>
                <ThemedText style={localStyles.badgeText}>Actividad: {postulacion.actividad}</ThemedText>
              </View>
            </View>

            {/* --- SECCIÓN ACADÉMICA --- */}
            <ThemedText style={[localStyles.sectionTitle, { color: colors.text }]}>Información Académica</ThemedText>
            <View style={[localStyles.cardContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <DetailRow 
                icon="person-circle-outline" 
                label="Profesor Encargado" 
                value={postulacion.correo_profe} 
                colors={colors} 
              />
              <DetailRow 
                icon="school-outline" 
                label="Metodología" 
                value={postulacion.metodologia} 
                colors={colors} 
                isLast
              />
            </View>

            {/* --- SECCIÓN HORARIO --- */}
            <ThemedText style={[localStyles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Horario Disponibilidad</ThemedText>
            <View style={[localStyles.cardContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                    <DetailRow 
                        icon="calendar-outline" 
                        label="Día" 
                        value={postulacion.dia} 
                        colors={colors} 
                        isLast
                    />
                </View>
                <View style={{ width: 1, backgroundColor: colors.inputBorder }} />
                <View style={{ flex: 1 }}>
                    <DetailRow 
                        icon="time-outline" 
                        label="Bloque" 
                        value={postulacion.bloque} 
                        colors={colors} 
                        isLast
                    />
                </View>
              </View>
            </View>

            {/* --- CARTA DE INTERÉS --- */}
            <ThemedText style={[localStyles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Carta de Interés</ThemedText>
            <View style={[localStyles.cartaContainer, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
              <MaterialIcons name="format-quote" size={32} color={colors.primary + '40'} style={localStyles.quoteIcon} />
              <ThemedText style={[localStyles.cartaText, { color: colors.text }]}>
                {postulacion.descripcion_carta}
              </ThemedText>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  // Tarjeta principal superior
  headerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  asignaturaTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },

  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  
  // detalle individual
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Estilos específicos para Carta
  cartaContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    minHeight: 100,
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cartaText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});