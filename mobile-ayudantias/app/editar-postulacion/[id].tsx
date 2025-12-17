import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  TextInputProps,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Pressable,
  Switch 
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { usePostulacionesPorAlumno, useEditarPostulacion, EditarPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useThemeColors } from '@/hooks/useThemeColors';

// --- COMPONENTE INPUT ---
interface ModernInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  showCharCount?: boolean;
  maxLength?: number;
}

const ModernInput: React.FC<ModernInputProps & { styles: any, colors: any }> = ({
  label,
  icon,
  styles,
  colors,
  showCharCount,
  maxLength,
  value,
  ...props
}) => (
  <View style={styles.inputGroup}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <View style={[styles.inputContainer, props.multiline && styles.textAreaContainer]}>
      <Ionicons name={icon} size={20} color={colors.primary} style={[styles.inputIcon, props.multiline && { marginTop: 12 }]} />
      <TextInput
        style={[styles.input, props.multiline && styles.textArea]}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        maxLength={maxLength}
        {...props}
      />
    </View>
    {showCharCount && maxLength && (
      <ThemedText style={[styles.charCount, (value?.length || 0) >= maxLength ? { color: colors.error } : {}]}>
        {value?.length || 0} / {maxLength}
      </ThemedText>
    )}
  </View>
);

// --- COMPONENTE SELECTOR ---
interface Option {
  label: string;
  value: string;
}

interface ModernSelectProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  styles: any;
  colors: any;
}

const ModernSelect: React.FC<ModernSelectProps> = ({ 
  label, icon, value, onChange, options, placeholder, searchable, styles, colors 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedLabel = options.find(op => op.value === value)?.label;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchText) return options;
    return options.filter(op => op.label.toLowerCase().includes(searchText.toLowerCase()));
  }, [options, searchText, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setModalVisible(false);
    setSearchText('');
  };

  return (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={icon} size={20} color={colors.primary} style={styles.inputIcon} />
        <ThemedText 
          style={[styles.inputText, !selectedLabel && { color: colors.textPlaceholder }]}
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {selectedLabel || placeholder || "Seleccionar..."}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={colors.textPlaceholder} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                {label}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textPlaceholder} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                <Ionicons name="search" size={18} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
                <TextInput 
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar..."
                  placeholderTextColor={colors.textPlaceholder}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={false} 
                />
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 300 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem, 
                    item.value === value && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <ThemedText style={[
                    styles.optionText, 
                    item.value === value && { color: colors.primary, fontWeight: 'bold' }
                  ]}>
                    {item.label}
                  </ThemedText>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                   <ThemedText style={{ color: colors.textPlaceholder }}>No se encontraron resultados</ThemedText>
                </View>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};


// --- PANTALLA PRINCIPAL ---

export default function EditarPostulacionScreen() {
  const router = useRouter();
  const clienteQuery = useQueryClient();
  const { id } = useLocalSearchParams();
  
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const { data: user } = useUserProfile();
  const { data: postulaciones, isLoading: cargaPostulaciones } = usePostulacionesPorAlumno(user?.rut);
  const { data: asignaturasTodas, isLoading: cargaAsignaturas } = useTodasAsignaturas();
  const { data: asignaturasDisponibles, isLoading: cargaAsigDisp } = useAsignaturasDisponiblesPostulacion(user?.rut);

  const { mutateAsync: editarPostulacion, isPending } = useEditarPostulacion();

  const [form, setForm] = useState<EditarPostulacion | null>(null);
  const [incluirCorreoProfe, setIncluirCorreoProfe] = useState(false);

  useEffect(() => {
    if (postulaciones && Array.isArray(postulaciones) && id) {
      const postulacionAEditar = postulaciones.find(p => p.id.toString() === id);
      if (postulacionAEditar) {
        setForm(postulacionAEditar);
        if (postulacionAEditar.correo_profe && postulacionAEditar.correo_profe.trim() !== '') {
            setIncluirCorreoProfe(true);
        } else {
            setIncluirCorreoProfe(false);
        }
      }
    }
  }, [postulaciones, id]);

  const listaAsignaturas = user?.tipo === 'admin' ? asignaturasTodas : asignaturasDisponibles;
  
  const opcionesAsignaturas = useMemo(() => {
    const base = listaAsignaturas?.map((a: { id: any, nombre: string }) => ({
      label: a.nombre,
      value: a.id.toString(),
    })) || [];
    
    if (form && form.id_asignatura && !base.find((op: any) => op.value === form.id_asignatura.toString())) {
       base.push({ label: form.nombre_asignatura || "Asignatura Actual", value: form.id_asignatura.toString() });
    }
    return base;
  }, [listaAsignaturas, form]);

  const opcionesDias = [
    { label: 'Lunes', value: 'Lunes' }, { label: 'Martes', value: 'Martes' },
    { label: 'Miércoles', value: 'Miércoles' }, { label: 'Jueves', value: 'Jueves' },
    { label: 'Viernes', value: 'Viernes' }, { label: 'Sábado', value: 'Sábado' },
  ];

  const opcionesBloques = [
    { label: 'A (08:10 - 09:30)', value: 'A' }, { label: 'B (09:55 - 11:20)', value: 'B' },
    { label: 'C (11:40 - 13:10)', value: 'C' }, { label: 'C2 (13:10 - 14:30)', value: 'C2' },
    { label: 'D (14:30 - 16:00)', value: 'D' }, { label: 'E (16:15 - 17:47)', value: 'E' },
    { label: 'F (18:00 - 19:30)', value: 'F' },
  ];

  const handleChange = (name: keyof EditarPostulacion, value: string) => {
    if (!form) return;
    setForm(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSwitchChange = (val: boolean) => {
    setIncluirCorreoProfe(val);
    if (!val && form) {
        handleChange('correo_profe', "");
    }
  };

  const handleSubmit = async () => {
    if (!form) return Alert.alert("Error", "No se han cargado los datos.");
    
    if (!form.descripcion_carta || form.descripcion_carta.length > 700) {
        return Alert.alert("Error", "La carta de interés es obligatoria y debe tener máximo 700 caracteres.");
    }

    if (incluirCorreoProfe && (!form.correo_profe || form.correo_profe.trim() === "")) {
        return Alert.alert("Atención", "Has activado la recomendación, debes ingresar el correo del profesor.");
    }

    const datosAEnviar = {
        ...form,
        correo_profe: incluirCorreoProfe ? form.correo_profe : ""
    };

    try {
      await editarPostulacion(datosAEnviar);
      Alert.alert("Éxito", "Postulación actualizada correctamente.");
      await clienteQuery.invalidateQueries({ queryKey: ['postulaciones', user?.rut] });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", `No se pudo guardar: ${error.message}`);
    }
  };

  if (cargaPostulaciones || cargaAsignaturas || !form) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Editar Postulación</ThemedText>
        <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
             {isPending ? <ActivityIndicator color={colors.primary} /> : <ThemedText style={{color: colors.primary, fontWeight: 'bold'}}>Guardar</ThemedText>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <ThemedText style={styles.subtitle}>
            Actualiza los detalles de tu postulación para <ThemedText type="defaultSemiBold">{form.nombre_asignatura}</ThemedText>.
          </ThemedText>

          {/* DETALLES */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <ThemedText type="defaultSemiBold">Detalles Principales</ThemedText>
            </View>

            <ModernSelect
              label="Asignatura"
              icon="school-outline"
              value={form.id_asignatura?.toString()}
              options={opcionesAsignaturas}
              onChange={(val) => {
                 const label = opcionesAsignaturas.find((op:any) => op.value === val)?.label || "";
                 handleChange('id_asignatura', val);
                 handleChange('nombre_asignatura', label);
              }}
              searchable={true}
              placeholder="Seleccionar Asignatura..."
              styles={styles}
              colors={colors}
            />

            <ModernInput
              label="Carta de Interés"
              icon="create-outline"
              value={form.descripcion_carta}
              onChangeText={(t) => handleChange('descripcion_carta', t)}
              placeholder="Explica tu motivación..."
              multiline
              numberOfLines={6}
              styles={styles}
              colors={colors}
              maxLength={700}
              showCharCount={true}
            />
          </View>

          {/* PLAN DE TRABAJO */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
               <ThemedText type="defaultSemiBold">Plan de Trabajo</ThemedText>
            </View>
            
            <ModernInput
              label="Actividad Propuesta"
              icon="bulb-outline"
              value={form.actividad}
              onChangeText={(t) => handleChange('actividad', t)}
              placeholder="Ej: Apoyo en laboratorios"
              styles={styles}
              colors={colors}
            />

            <ModernInput
              label="Metodología"
              icon="construct-outline"
              value={form.metodologia}
              onChangeText={(t) => handleChange('metodologia', t)}
              placeholder="Ej: Aprendizaje basado en problemas"
              styles={styles}
              colors={colors}
            />

            {/* SWITCH CORREO */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.iconBox, { backgroundColor: '#8b5cf6' + '20' }]}>
                  <Ionicons name="mail-open-outline" size={20} color="#8b5cf6" />
                </View>
                <View>
                  <ThemedText style={styles.switchTitle}>Carta de Recomendación</ThemedText>
                  <ThemedText style={styles.switchSub}>Incluir correo del profesor</ThemedText>
                </View>
              </View>
              <Switch
                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                thumbColor={'#fff'}
                onValueChange={handleSwitchChange}
                value={incluirCorreoProfe}
              />
            </View>

            {/* INPUT CONDICIONAL */}
            {incluirCorreoProfe && (
                <View style={{ marginTop: 16 }}>
                    <ModernInput
                        label="Correo Profesor (Recomendación)"
                        icon="mail-outline"
                        value={form.correo_profe}
                        onChangeText={(t) => handleChange('correo_profe', t)}
                        placeholder="profesor@institucion.cl"
                        keyboardType="email-address"
                        styles={styles}
                        colors={colors}
                    />
                </View>
            )}
          </View>

          {/* HORARIO */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="time-outline" size={20} color={colors.primary} />
               <ThemedText type="defaultSemiBold">Horario Preferente</ThemedText>
            </View>
            
            <View style={styles.row}>
                <View style={styles.col}>
                    <ModernSelect
                        label="Día"
                        icon="calendar-outline"
                        value={form.dia}
                        options={opcionesDias}
                        onChange={(v) => handleChange('dia', v)}
                        styles={styles}
                        colors={colors}
                    />
                </View>
                <View style={styles.col}>
                     <ModernSelect
                        label="Bloque"
                        icon="time-outline"
                        value={form.bloque}
                        options={opcionesBloques}
                        onChange={(v) => handleChange('bloque', v)}
                        styles={styles}
                        colors={colors}
                    />
                </View>
            </View>
          </View>

          <View style={styles.footerSpace} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 15,
    color: colors.textLabel,
    marginBottom: 20,
    lineHeight: 22,
  },
  
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    gap: 10,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textLabel,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: colors.textPlaceholder,
    marginTop: 4,
    marginRight: 4,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  switchSub: {
    fontSize: 12,
    color: colors.textPlaceholder,
  },
  
  // --- Estilos para el Modal del Selector ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },

  // Grid helpers
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  footerSpace: {
    height: 40,
  },
});