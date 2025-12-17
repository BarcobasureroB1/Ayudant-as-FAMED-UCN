import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  TextInputProps,
  Platform,
  useColorScheme,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Pressable
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostulante } from '@/context/PostulanteContext';
import { useCrearPostulacion } from '@/hooks/usePostulacion';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '@/hooks/useThemeColors';

// --- COMPONENTE INPUT (Actualizado con contador) ---
interface ModernInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const ModernInput: React.FC<ModernInputProps & { styles: any, colors: any }> = ({
  label,
  icon,
  styles,
  colors,
  error,
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
        autoCapitalize="none"
        value={value}
        maxLength={maxLength}
        {...props}
      />
    </View>
    {/* Contador de caracteres */}
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

export default function PostularScreen() {
  const router = useRouter();
  const clienteQuery = useQueryClient();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const { user, asignaturasDisponibles, asignaturasTodas, loadingGlobal } = usePostulante();
  const { mutate: crearPostulacion, isPending } = useCrearPostulacion();

  const [incluirCorreoProfe, setIncluirCorreoProfe] = useState(false);

  const [form, setForm] = useState({
    rut_alumno: user?.rut || "",
    id_asignatura: "",
    nombre_asignatura: "",
    descripcion_carta: "",
    correo_profe: "",
    actividad: "",
    metodologia: "",
    dia: "",
    bloque: "",
  });

  const listaAsignaturas = user?.tipo === 'admin' ? asignaturasTodas : asignaturasDisponibles;

  const opcionesAsignaturas = listaAsignaturas?.map(a => ({
    label: a.nombre,
    value: a.id.toString(),
  })) || [];

  const opcionesDias = [
    { label: 'Lunes', value: 'Lunes' },
    { label: 'Martes', value: 'Martes' },
    { label: 'Miércoles', value: 'Miércoles' },
    { label: 'Jueves', value: 'Jueves' },
    { label: 'Viernes', value: 'Viernes' },
    { label: 'Sábado', value: 'Sábado' },
  ];

  const opcionesBloques = [
    { label: 'A (08:10 - 09:30)', value: 'A' },
    { label: 'B (09:55 - 11:20)', value: 'B' },
    { label: 'C (11:40 - 13:10)', value: 'C' },
    { label: 'C2 (13:10 - 14:30)', value: 'C2' },
    { label: 'D (14:30 - 16:00)', value: 'D' },
    { label: 'E (16:15 - 17:47)', value: 'E' },
    { label: 'F (18:00 - 19:30)', value: 'F' },
  ];

  const handleChange = (name: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (val: boolean) => {
    setIncluirCorreoProfe(val);
    if (!val) handleChange('correo_profe', "");
  };

  const limpiarFormulario = () => {
    setForm({
      rut_alumno: user?.rut || "",
      id_asignatura: "",
      nombre_asignatura: "",
      descripcion_carta: "",
      correo_profe: "",
      actividad: "",
      metodologia: "",
      dia: "",
      bloque: "",
    });
    setIncluirCorreoProfe(false);
  };

  const handleSubmit = () => {
    if (!form.id_asignatura || !form.descripcion_carta || !form.dia || !form.bloque || !form.actividad || !form.metodologia) {
      Alert.alert("Atención", "Por favor completa todos los campos obligatorios.");
      return;
    }
    if (incluirCorreoProfe && !form.correo_profe) {
      Alert.alert("Atención", "Has activado la recomendación, debes ingresar el correo del profesor.");
      return;
    }
    
    // Validación longitud
    if (form.descripcion_carta.length > 700) {
      Alert.alert("Error", "La carta de interés excede el límite de 700 caracteres.");
      return;
    }

    const datosAEnviar = { ...form, correo_profe: incluirCorreoProfe ? form.correo_profe : "" };

    crearPostulacion(datosAEnviar, {
      onSuccess: () => {
        Alert.alert("¡Enviado!", "Tu postulación ha sido registrada con éxito.");
        limpiarFormulario();
        clienteQuery.invalidateQueries({ queryKey: ['postulaciones', user?.rut] });
        router.push('/(tabs)');
      },
      onError: (error: any) => {
        Alert.alert("Error", `No se pudo enviar: ${error.message}`);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>Nueva Postulación</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Completa los detalles para tu ayudantía</ThemedText>
          </View>

          {/* GENERAL */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Datos Generales</ThemedText>
            
            {loadingGlobal?.asignaturas ? (
              <View style={[styles.inputContainer, { padding: 16, justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
                <ThemedText style={{ marginLeft: 10, color: colors.textPlaceholder }}>Cargando asignaturas...</ThemedText>
              </View>
            ) : (
              <ModernSelect
                label="Asignatura"
                icon="school-outline"
                options={opcionesAsignaturas}
                styles={styles}
                colors={colors}
                placeholder="Seleccione una asignatura..."
                value={form.id_asignatura}
                searchable={true}
                onChange={(value: string) => {
                  if(!value) {
                    handleChange('id_asignatura', '');
                    handleChange('nombre_asignatura', '');
                    return;
                  }
                  handleChange('id_asignatura', value);
                  const label = opcionesAsignaturas.find(opt => opt.value === value)?.label || "";
                  handleChange('nombre_asignatura', label);
                }}
              />
            )}

            {/* CARTA DE INTERÉS */}
            <ModernInput
              label="Carta de Interés"
              icon="document-text-outline"
              styles={styles}
              colors={colors}
              value={form.descripcion_carta}
              onChangeText={(t) => handleChange('descripcion_carta', t)}
              placeholder="Explica brevemente tu motivación..."
              multiline
              numberOfLines={6}
              maxLength={700} 
              showCharCount={true} 
            />
          </View>

          {/* PLAN DE TRABAJO */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Plan de Trabajo</ThemedText>

            <ModernInput
              label="Actividad Propuesta"
              icon="bulb-outline"
              styles={styles}
              colors={colors}
              value={form.actividad}
              onChangeText={(t) => handleChange('actividad', t)}
              placeholder="Ej: Resolución de guías"
            />

            <ModernInput
              label="Metodología"
              icon="easel-outline"
              styles={styles}
              colors={colors}
              value={form.metodologia}
              onChangeText={(t) => handleChange('metodologia', t)}
              placeholder="Ej: Trabajo grupal"
            />

            {/* Recomendación */}
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

            {incluirCorreoProfe && (
              <View style={{ marginTop: 16 }}>
                 <ModernInput
                  label="Correo del Profesor"
                  icon="at-outline"
                  styles={styles}
                  colors={colors}
                  value={form.correo_profe}
                  onChangeText={(t) => handleChange('correo_profe', t)}
                  placeholder="profesor@ucn.cl"
                  keyboardType="email-address"
                />
              </View>
            )}
          </View>

          {/* DISPONIBILIDAD */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Disponibilidad</ThemedText>
            <View style={styles.row}>
              <View style={styles.col}>
                <ModernSelect
                  label="Día"
                  icon="calendar-outline"
                  styles={styles}
                  colors={colors}
                  options={opcionesDias}
                  placeholder="Día..."
                  value={form.dia}
                  onChange={(val: string) => handleChange('dia', val)}
                />
              </View>
              <View style={styles.col}>
                <ModernSelect
                  label="Bloque"
                  icon="time-outline"
                  styles={styles}
                  colors={colors}
                  options={opcionesBloques}
                  placeholder="Bloque..."
                  value={form.bloque}
                  onChange={(val: string) => handleChange('bloque', val)}
                />
              </View>
            </View>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity onPress={limpiarFormulario} style={styles.btnSecondary}>
              <ThemedText style={{ color: colors.textLabel }}>Limpiar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={isPending || !!loadingGlobal?.asignaturas}
              style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: isPending ? 0.7 : 1 }]}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : <Ionicons name="paper-plane" size={20} color="#fff" />}
              <ThemedText style={styles.btnPrimaryText}>
                {isPending ? "Enviando..." : "Enviar Postulación"}
              </ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  
  header: {
    marginBottom: 24,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLabel,
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },

  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textLabel,
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
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
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

  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  footerActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
  },
  btnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

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
});