import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  TextInputProps,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

import { usePostulante } from '@/context/PostulanteContext';
import { useCrearPostulacion } from '@/hooks/usePostulacion';
import { useQueryClient } from '@tanstack/react-query';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  ...props
}) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <TextInput
      style={[styles.input, props.multiline && styles.textArea, props.disabled && styles.disabledText]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#999"
      autoCapitalize="none"
      {...props}
    />
  </View>
);

const FormPicker = ({ label, value, onValueChange, items, placeholder, disabled }: any) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <RNPickerSelect
      onValueChange={onValueChange}
      items={items}
      value={value}
      placeholder={{ label: placeholder || 'Seleccione un valor...', value: null }}
      style={pickerSelectStyles}
      useNativeAndroidPickerStyle={false}
      disabled={disabled}
      Icon={() => {
        return <Ionicons name="chevron-down" size={20} color="gray" style={styles.pickerIcon} />;
      }}
    />
  </View>
);

export default function PostularScreen() {
  const router = useRouter();
  const clienteQuery = useQueryClient();

  const { user, asignaturasDisponibles, asignaturasTodas } = usePostulante();

  const { mutate: crearPostulacion, isPending } = useCrearPostulacion();

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

  const placeholderAsignaturas = {
    label: opcionesAsignaturas.length > 0 ? "Seleccione una asignatura"
    : "No hay asignaturas disponibles",
    value: null,
  };

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
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
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
  };

  const handleSubmit = () => {
    if (!form.id_asignatura || !form.descripcion_carta || !form.correo_profe || !form.dia || !form.bloque) {
      Alert.alert("Campos incompletos", "Por favor, rellena todos los campos requeridos.");
      return;
    }

    crearPostulacion(form, {
      onSuccess: () => {
        Alert.alert("¡Éxito!", "Postulación enviada correctamente.");
        limpiarFormulario();
        clienteQuery.invalidateQueries({ queryKey: ['postulaciones', user?.rut] });
        router.push('/(tabs)');
      },
      onError: (error: any) => {
        Alert.alert("Error", `No se pudo enviar la postulación: ${error.message}`);
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.title}>Crear Postulación</ThemedText>
        <ThemedText style={styles.subtitle}>
          Completa el formulario para postular a una ayudantía.
        </ThemedText>

        <View style={styles.formContainer}>

          {opcionesAsignaturas.length > 0 ? (
            <FormPicker
            label="Asignatura"
            items={opcionesAsignaturas}
            placeholder={placeholderAsignaturas.label}
            value={form.id_asignatura}
            disabled={opcionesAsignaturas.length === 0}
            onValueChange={(value: string, index: number) => {
              if(value === null)
              {
                handleChange('id_asignatura', '');
                handleChange('nombre_asignatura', '');
                return;
              }
              handleChange('id_asignatura', value);
              const opcionSeleccionada = opcionesAsignaturas.find(opt => opt.value === value)?.label || "";
              handleChange('nombre_asignatura', opcionSeleccionada);
            }}
          />
          ): (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Asignatura</ThemedText>
                <ThemedText style={styles.disabledText}>
                  No hay asignaturas disponibles
                </ThemedText> 
            </View>
          )}
          

          <FormInput
            label="Carta de Interés"
            value={form.descripcion_carta}
            onChangeText={(t) => handleChange('descripcion_carta', t)}
            placeholder="Describe por qué estás interesado..."
            multiline
            numberOfLines={6}
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>Plan de Trabajo</ThemedText>

          <FormInput
            label="Correo del Profesor (para recomendación)"
            value={form.correo_profe}
            onChangeText={(t) => handleChange('correo_profe', t)}
            placeholder="profesor@universidad.cl"
            keyboardType="email-address"
          />

          <FormInput
            label="Actividad Propuesta"
            value={form.actividad}
            onChangeText={(t) => handleChange('actividad', t)}
            placeholder="Ej: Resolución de ejercicios"
          />

          <FormInput
            label="Metodología"
            value={form.metodologia}
            onChangeText={(t) => handleChange('metodologia', t)}
            placeholder="Ej: Aprendizaje activo"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <FormPicker
                label="Día Preferente"
                items={opcionesDias}
                placeholder="Seleccione un día"
                value={form.dia}
                onValueChange={(value: string) => handleChange('dia', value)}
              />
            </View>
            <View style={styles.col}>
              <FormPicker
                label="Bloque Horario"
                items={opcionesBloques}
                placeholder="Seleccione un bloque"
                value={form.bloque}
                onValueChange={(value: string) => handleChange('bloque', value)}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonBack]}
              onPress={limpiarFormulario}
            >
              <ThemedText style={styles.buttonTextBack}>Limpiar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <ThemedText style={styles.buttonText}>
                {isPending ? "Enviando..." : "Enviar Postulación"}
              </ThemedText>
              <Ionicons name="paper-plane-outline" size={18} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  )





}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  formContainer: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledText: {
    fontSize: 16,
    color: '#666', 
    fontStyle: 'italic',
    paddingVertical: 12, 
    paddingHorizontal: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  buttonBack: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonTextBack: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubmit: {
    flex: 2,
    backgroundColor: '#28a745',
  },
  pickerIcon: {
    top: Platform.OS === 'ios' ? 0 : 16,
    right: 10,
  },
  });

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: 'black',
  },
});



