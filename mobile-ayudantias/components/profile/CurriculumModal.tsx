import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ActividadCientifica, ActividadExtracurricular, AyudantiaResponse, CursoTituloGrado } from '@/hooks/useCurriculum';
import { AyudantiasAnteriores } from '@/hooks/useAyudantia';

// --- COMPONENTES VISUALES INTERNOS ---

// ícono (para info personal)
const DetailRow = ({ icon, label, value, colors, isLast }: any) => {
  if (!value) return null;
  return (
    <View style={[
      localStyles.detailRow, 
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.inputBorder }
    ]}>
      <View style={[localStyles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={localStyles.detailTextContainer}>
        <ThemedText style={[localStyles.detailLabel, { color: colors.textLabel }]}>{label}</ThemedText>
        <ThemedText style={[localStyles.detailValue, { color: colors.text }]}>{value}</ThemedText>
      </View>
    </View>
  );
};

// Tarjeta para items de (Ayudantías, Cursos, etc.)
const ListItemCard = ({ title, subtitle1, value1, subtitle2, value2, subtitle3, value3, colors, icon = "school-outline" }: any) => (
  <View style={[localStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
    <View style={localStyles.itemHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 8 }} />
      <ThemedText style={[localStyles.itemTitle, { color: colors.text }]}>{title}</ThemedText>
    </View>
    
    <View style={localStyles.itemDivider} />
    
    <View style={localStyles.itemContent}>
      {value1 ? (
        <View style={localStyles.itemRow}>
          <ThemedText style={[localStyles.itemLabel, { color: colors.textLabel }]}>{subtitle1}:</ThemedText>
          <ThemedText style={[localStyles.itemValue, { color: colors.text }]} numberOfLines={1}>{value1}</ThemedText>
        </View>
      ) : null}

      {value2 ? (
        <View style={localStyles.itemRow}>
          <ThemedText style={[localStyles.itemLabel, { color: colors.textLabel }]}>{subtitle2}:</ThemedText>
          <ThemedText style={[localStyles.itemValue, { color: colors.text }]} numberOfLines={1}>{value2}</ThemedText>
        </View>
      ) : null}

      {value3 ? (
        <View style={localStyles.itemRow}>
          <ThemedText style={[localStyles.itemLabel, { color: colors.textLabel }]}>{subtitle3}:</ThemedText>
          <ThemedText style={[localStyles.itemValue, { color: colors.text }]} numberOfLines={1}>{value3}</ThemedText>
        </View>
      ) : null}
    </View>
  </View>
);

// Sección contenedora Título
const SectionBlock = ({ title, children }: any) => (
  <View style={localStyles.sectionBlock}>
    <ThemedText type="subtitle" style={localStyles.sectionTitle}>{title}</ThemedText>
    {children}
  </View>
);

const formatNota = (valor: any) => {
  const num = Number(valor);
  // Si es un número válido y es mayor o igual a 10 (ej: 50, 65, 70), lo dividimos por 10
  if (!isNaN(num) && num >= 10) {
    return (num / 10).toFixed(1); // Retorna "5.0", "6.5", etc.
  }
  // Si ya viene como 5.0 o 4.5, se devuelve tal cual
  return valor;
};

interface CurriculumModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  styles: any;
  curriculum: any;
  loadingGlobal: any;
  ayudantias: AyudantiaResponse[] | undefined;
  ayudantiasAnteriores: AyudantiasAnteriores[] | undefined;
  cursosTitulosGrados: CursoTituloGrado[] | undefined;
  actividadesCientificas: ActividadCientifica[] | undefined;
  actividadesExtracurriculares: ActividadExtracurricular[] | undefined;
  otros?: any[];
}

export default function CurriculumModal({ 
  visible, onClose, colors, styles, curriculum, loadingGlobal,
  ayudantias, ayudantiasAnteriores, cursosTitulosGrados, actividadesCientificas, actividadesExtracurriculares, otros
}: CurriculumModalProps) {

  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          
          {/* HEADER */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <ThemedText type="title" style={{ fontSize: 20 }}>Curriculum Vitae</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={26} color={colors.textPlaceholder}/>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* DATOS PERSONALES */}
            <SectionBlock title="Información Personal">
              <View style={[localStyles.cardContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                <DetailRow icon="person-outline" label="Nombre Completo" value={`${curriculum?.nombres} ${curriculum?.apellidos}`} colors={colors} />
                <DetailRow icon="card-outline" label="RUT" value={curriculum?.usuario.rut} colors={colors} />
                <DetailRow icon="calendar-outline" label="Fecha Nacimiento" value={curriculum?.fecha_nacimiento} colors={colors} />
                <DetailRow icon="location-outline" label="Ubicación" value={curriculum?.ciudad ? `${curriculum?.comuna}, ${curriculum?.ciudad}` : null} colors={colors} />
                <DetailRow icon="call-outline" label="Celular" value={curriculum?.Num_Celular} colors={colors} />
                <DetailRow icon="mail-outline" label="Correo" value={curriculum?.correo} colors={colors} />
                <DetailRow icon="school-outline" label="Carrera" value={curriculum?.carrera} colors={colors} isLast />
              </View>
            </SectionBlock>
            
            {/* AYUDANTÍAS */}
            <SectionBlock title="Ayudantías">
              {loadingGlobal?.ayudantias ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : (
                <View style={{ gap: 12 }}>
                  {ayudantias?.map((a) => (
                    <ListItemCard
                      key={`curr-${a.id}`} title={a.nombre_asig} colors={colors}
                      subtitle1="Coordinador" value1={a.nombre_coordinador}
                      subtitle2="Evaluación" value2={a.evaluacion}
                      icon="book-outline"
                    />
                  ))}
                  {ayudantiasAnteriores?.map((a) => (
                    <ListItemCard
                      key={`prev-${a.id}`} title={a.asignatura.nombre} colors={colors}
                      subtitle1="Coordinador" value1={a.coordinador.nombres + " " + a.coordinador.apellidos}
                      subtitle2="Evaluación" value2={formatNota(a.evaluacion)}
                      icon="time-outline"
                    />
                  ))}
                  {(!ayudantias?.length && !ayudantiasAnteriores?.length) && (
                    <ThemedText style={{ color: colors.textPlaceholder, fontStyle: 'italic' }}>No hay ayudantías registradas.</ThemedText>
                  )}
                </View>
              )}
            </SectionBlock>

            {/* CURSOS / TÍTULOS */}
            <SectionBlock title="Cursos, Títulos y Grados">
               {cursosTitulosGrados?.length ? (
                 cursosTitulosGrados.map((c) => (
                    <ListItemCard
                      key={c.id} title={c.nombre_asig} colors={colors}
                      subtitle1="Institución/Coord" value1={c.n_coordinador}
                      subtitle2="Fecha" value2={c.evaluacion}
                      icon="ribbon-outline"
                    />
                 ))
               ) : (
                 <ThemedText style={{ color: colors.textPlaceholder, fontStyle: 'italic' }}>Sin registros.</ThemedText>
               )}
            </SectionBlock>

            {/* ACTIVIDADES EXTRACURRICULARES */}
            {(actividadesExtracurriculares?.length || 0) > 0 && (
                <SectionBlock title="Extracurriculares">
                    {actividadesExtracurriculares?.map((item, index) => (
                        <ListItemCard
                            key={index} 
                            title={item.nombre} 
                            colors={colors}
                            subtitle1="Docente" 
                            value1={item.docente}
                            subtitle2="Descripción" 
                            value2={item.descripcion}
                            subtitle3="Periodo"
                            value3={item.periodo_participacion}
                            icon="basketball-outline"
                        />
                    ))}
                </SectionBlock>
            )}

             {/* ACTIVIDADES CIENTIFICAS */}
             {(actividadesCientificas?.length || 0) > 0 && (
                <SectionBlock title="Científicas">
                    {actividadesCientificas?.map((item, index) => (
                        <ListItemCard
                            key={index} 
                            title={item.nombre} 
                            colors={colors}
                            subtitle1="Descripción" 
                            value1={item.descripcion}
                            subtitle2="Periodo" 
                            value2={item.periodo_participacion}
                            icon="flask-outline"
                        />
                    ))}
                </SectionBlock>
            )}

            {/* OTROS ANTECEDENTES */}
            {curriculum?.otros && curriculum.otros.trim() !== "" && (
                <SectionBlock title="Otros Antecedentes">
                    <View style={[localStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
                        <View style={localStyles.itemHeader}>
                            <Ionicons name="layers-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <ThemedText style={[localStyles.itemTitle, { color: colors.text }]}>Información Adicional</ThemedText>
                        </View>
                        <View style={localStyles.itemDivider} />
                        <ThemedText style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>
                            {curriculum.otros}
                        </ThemedText>
                    </View>
                </SectionBlock>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  
  // Estilos de la tarjeta de info personal
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Estilos para Item Cards
  itemCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#ccc', 
    opacity: 0.2,
    marginBottom: 8,
  },
  itemContent: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '400',
    maxWidth: '60%',
    textAlign: 'right',
  },
});