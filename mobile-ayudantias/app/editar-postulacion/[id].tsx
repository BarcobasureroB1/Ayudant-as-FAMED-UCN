import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { useQueryClient } from '@tanstack/react-query';

import { usePostulacionesPorAlumno, useEditarPostulacion, EditarPostulacion } from '@/hooks/usePostulacion';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { useUserProfile } from '@/hooks/useUserProfile';


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

const FormInput: React.FC<FormInputProps> = ({label,value,onChangeText,...props}) => (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, props.multiline && styles.textArea, props.disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        autoCapitalize="none"
        {...props}
      />
    </View>
);

const FormPicker = ({ label, value, onValueChange, items, placeholder }: any) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <RNPickerSelect
      onValueChange={onValueChange}
      items={items}
      value={value}
      placeholder={{ label: placeholder || 'Seleccione un valor...', value: null }}
      style={pickerSelectStyles}
      useNativeAndroidPickerStyle={false}
      Icon={() => {
        return <Ionicons name="chevron-down" size={20} color="gray" style={styles.pickerIcon} />;
      }}
    />
  </View>
);


export default function EditarPostulacionScreen(){
  const router = useRouter();
  const clienteQuery = useQueryClient();
  const { id } = useLocalSearchParams();

  const { data: user } = useUserProfile();
  const { data: postulaciones, isLoading: cargaPostulaciones } = usePostulacionesPorAlumno(user?.rut);
  const { data: asignaturasTodas, isLoading: cargaAsignaturas } = useTodasAsignaturas();

  const { mutateAsync: editarPostulacion, isPending } = useEditarPostulacion();

  const [form, setForm] = useState<EditarPostulacion | null>(null);

  useEffect(() => {
    if (postulaciones && id) {
      const postulacionAEditar = postulaciones.find(p => p.id.toString() === id);
      if (postulacionAEditar) {
        setForm(postulacionAEditar);
      }
    }
  }, [postulaciones, id]);

  const opcionesAsignaturas = asignaturasTodas?.map(a => ({
    label: a.nombre,
    value: a.id.toString(),
  })) || [];

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
    setForm(prev => prev ? ({
      ...prev,
      [name]: value,
    }) : null);
  };

  const handleSubmit = async () => {
    if (!form) return Alert.alert("Error", "No se han cargado los datos del formulario.");
    
    try {
      await editarPostulacion(form);
      Alert.alert("Éxito", "Postulación actualizada correctamente.");
      await clienteQuery.invalidateQueries({ queryKey: ['postulaciones', user?.rut] });
      
      router.back();

    } catch (error: any) {
      Alert.alert("Error", `No se pudo guardar: ${error.message}`);
    }
  };

  if (cargaPostulaciones || cargaAsignaturas || !form) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{title: 'Editar Postulación' }}/>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.title}>Editar Postulación</ThemedText>
        <View style={styles.formContainer}>
          <FormPicker
            label="Asignatura"
            items={opcionesAsignaturas}
            placeholder="Seleccione una asignatura"
            value={form.id_asignatura.toString()}
            onValueChange={(value: string) => {
              if (value === null)
              {
                return;
              }
              const opcionSeleccionada = opcionesAsignaturas.find(opt => opt.value === value)?.label || "";
              handleChange('id_asignatura', value);
              handleChange('nombre_asignatura', opcionSeleccionada);
            }}
          />

          <FormInput
            label="Carta de Interés"
            value={form.descripcion_carta}
            onChangeText={(t) => handleChange('descripcion_carta', t)}
            multiline
            numberOfLines={6}
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>Plan de Trabajo</ThemedText>
          <FormInput
            label="Correo del Profesor (para recomendación)"
            value={form.correo_profe}
            onChangeText={(t) => handleChange('correo_profe', t)}
            keyboardType="email-address"
          />

          <FormInput
            label="Actividad Propuesta"
            value={form.actividad}
            onChangeText={(t) => handleChange('actividad', t)}
          />
          <FormInput
            label="Metodologia"
            value={form.metodologia}
            onChangeText={(t) => handleChange('metodologia', t)}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <FormPicker
                label="Día Preferente"
                items={opcionesDias}
                placeholder="Seleccione un día"
                value={form.dia}
                onValueChange={(value) => handleChange('dia', value)}
              />
            </View>

            <View style={styles.col}>
              <FormPicker
                label="Bloque Horario"
                items={opcionesBloques}
                placeholder="Seleccione un bloque"
                value={form.bloque}
                onValueChange={(value) => handleChange('bloque', value)}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonBack]}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.buttonTextBack}>Cancelar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <ThemedText style={styles.buttonText}>
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </ThemedText>
              <Ionicons name="save-outline" size={18} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#888',
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
    backgroundColor: '#007bff',
  },
  pickerIcon: {
    top: Platform.OS === 'ios' ? 0 : 16,
    right: 10,
  }
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