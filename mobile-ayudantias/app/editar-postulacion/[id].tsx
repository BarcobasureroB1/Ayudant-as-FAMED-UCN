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
  useColorScheme
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { useQueryClient } from '@tanstack/react-query';

import { usePostulacionesPorAlumno, useEditarPostulacion, EditarPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
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

const FormInput: React.FC<FormInputProps & { styles: any }> = ({
  label,
  value,
  onChangeText,
  styles,
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

const FormPicker = ({ label, value, onValueChange, items, placeholder, disabled, styles, pickerSelectStyles, pickerProps }: any) => (
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
      pickerProps={pickerProps}
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
  const colorScheme = useColorScheme() ?? 'light';


  const { data: user } = useUserProfile();
  const { data: postulaciones, isLoading: cargaPostulaciones } = usePostulacionesPorAlumno(user?.rut);
  const { data: asignaturasTodas, isLoading: cargaAsignaturas } = useTodasAsignaturas();
  const { data: asignaturasDisponibles, isLoading: cargaAsigDisp } =useAsignaturasDisponiblesPostulacion(user?.rut);

  const { mutateAsync: editarPostulacion, isPending } = useEditarPostulacion();

  const [form, setForm] = useState<EditarPostulacion | null>(null);

  useEffect(() => {
    if (postulaciones && Array.isArray(postulaciones) && id) {
      const postulacionAEditar = postulaciones.find(p => p.id.toString() === id);
      if (postulacionAEditar) {
        setForm(postulacionAEditar);
      }
    }
  }, [postulaciones, id]);

  const listaAsignaturas = user?.tipo === 'admin' ? asignaturasTodas : asignaturasDisponibles;

  const opcionesAsignaturas = listaAsignaturas?.map((a: {id: any, nombre: string}) => ({
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

  const themeColors = useMemo(() => ({
      background: colorScheme === 'dark' ? '#000' : '#f0f2f5', // Un gris claro para el fondo
      text: colorScheme === 'dark' ? '#fff' : '#000',
      textLabel: colorScheme === 'dark' ? '#eee' : '#333',
      textPlaceholder: colorScheme === 'dark' ? '#888' : '#999',
      inputBackground: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
      borderColor: colorScheme === 'dark' ? '#444' : '#ccc',
      disabledText: colorScheme === 'dark' ? '#555' : '#999',
      buttonBackText: colorScheme === 'dark' ? '#fff' : '#333',
      buttonBackBackground: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0',
      buttonBackBorder: colorScheme === 'dark' ? '#444' : '#ddd',
    }), [colorScheme]);


    const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
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
      borderTopColor: themeColors.borderColor,
      paddingTop: 16,
    },
    inputContainer: {
      marginBottom: 4,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      color: themeColors.textLabel,
    },
    input: {
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: themeColors.inputBackground,
      color: themeColors.text,
    },
    disabledText: {
      fontSize: 16,
      color: themeColors.disabledText,
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
      backgroundColor: themeColors.buttonBackBackground,
      borderWidth: 1,
      borderColor: themeColors.buttonBackBorder,
    },
    buttonTextBack: {
      color: themeColors.buttonBackText,
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
    },
  }), [themeColors]);


  const dynamicPickerProps = {
    itemStyle: { color: 'black' }
  };

  const pickerSelectStyles = useMemo(() => StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      borderRadius: 8,
      backgroundColor: themeColors.inputBackground,
      color: themeColors.text,
    },
    inputAndroid: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      borderRadius: 8,
      backgroundColor: themeColors.inputBackground,
      color: themeColors.text,
    },
    placeholder: {
      color: themeColors.textPlaceholder,
    },
  }), [themeColors]);


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
            styles={styles}
            pickerSelectStyles={pickerSelectStyles}
            pickerProps={dynamicPickerProps}
            placeholder="Seleccione una asignatura"
            value={form.id_asignatura?.toString()}
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
            styles={styles}
            onChangeText={(t) => handleChange('descripcion_carta', t)}
            multiline
            numberOfLines={6}
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>Plan de Trabajo</ThemedText>
          <FormInput
            label="Correo del Profesor (para recomendación)"
            value={form.correo_profe}
            styles={styles}
            onChangeText={(t) => handleChange('correo_profe', t)}
            keyboardType="email-address"
          />

          <FormInput
            label="Actividad Propuesta"
            styles={styles}
            value={form.actividad}
            onChangeText={(t) => handleChange('actividad', t)}
          />
          <FormInput
            label="Metodologia"
            styles={styles}
            value={form.metodologia}
            onChangeText={(t) => handleChange('metodologia', t)}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <FormPicker
                label="Día Preferente"
                items={opcionesDias}
                styles={styles}
                pickerSelectStyles={pickerSelectStyles}
                pickerProps={dynamicPickerProps}
                placeholder="Seleccione un día"
                value={form.dia}
                onValueChange={(value) => handleChange('dia', value)}
              />
            </View>

            <View style={styles.col}>
              <FormPicker
                label="Bloque Horario"
                items={opcionesBloques}
                styles={styles}
                pickerSelectStyles={pickerSelectStyles}
                pickerProps={dynamicPickerProps}
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
