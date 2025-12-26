import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  TextInputProps,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  useEditarCurriculum, 
  CurriculumResponse, 
  useComprobarCurriculum, 
  useActividadesExtracurriculares, 
  useActividadescientificas, 
  useAyudantias, 
  useCursos_titulos_grados 
} from '@/hooks/useCurriculum';

// --- INTERFACES ---
export interface CurriculumDataEditar {
  id: number;
  rut_alumno?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  comuna?: string;
  ciudad?: string;
  num_celular?: string;
  correo?: string;
  carrera?: string;
  otros?: string;
  ayudantias?: Ayudantia[];
  cursos_titulos_grados?: CursoTituloGrado[];
  actividades_cientificas?: ActividadCientifica[];
  actividades_extracurriculares?: ActividadExtracurricular[];
}

interface Ayudantia {
  nombre_asig: string;
  nombre_coordinador: string;
  evaluacion_obtenida: string;
}
interface CursoTituloGrado {
  nombre_asig: string;
  n_coordinador: string;
  evaluacion: string;
}
interface ActividadCientifica {
  nombre: string;
  descripcion: string;
  periodo_participacion: string;
}
interface ActividadExtracurricular {
  nombre: string;
  docente: string;
  descripcion: string;
  periodo_participacion: string;
}

// --- COMPONENTE DE INPUT ---
interface ModernInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  styles: any;
  colors: any;
  showCharCount?: boolean;
  maxLength?: number;
  error?: string;
}

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  icon,
  value,
  styles,
  colors,
  showCharCount,
  maxLength,
  editable = true,
  error,
  ...props
}) => (
  <View style={styles.inputWrapper}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <View style={[styles.inputContainer, props.multiline && styles.textAreaContainer, !editable && { opacity: 0.7, backgroundColor: colors.inputBackground}, error ? { borderColor: colors.error } : {}]}>
      <Ionicons name={icon} size={20} color={error ? colors.error : (editable ? colors.primary : colors.textPlaceholder)} style={[styles.inputIcon, props.multiline && { marginTop: 12 }]} />
      <TextInput
        style={[styles.input, props.multiline && styles.textArea]}
        value={value}
        placeholderTextColor={colors.textPlaceholder}
        maxLength={maxLength}
        editable={editable}
        {...props}
      />
    </View>

    {error && (
        <ThemedText style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            {error}
        </ThemedText>
    )}

    {showCharCount && maxLength && !error && (
      <ThemedText style={[styles.charCount, (value?.length || 0) >= maxLength ? { color: colors.error } : {}]}>
        {value?.length || 0} / {maxLength}
      </ThemedText>
    )}
  </View>
);

// --- COMPONENTE PICKER MES / AÑO (Copiado de Crear Curriculum) ---
const MonthYearPicker = ({ visible, onClose, onConfirm, styles, colors }: any) => {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const handleConfirm = () => {
        const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
        onConfirm(`${monthStr}/${selectedYear}`);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.pickerHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <ThemedText style={{ color: colors.error }}>Cancelar</ThemedText>
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold">Seleccionar Periodo</ThemedText>
                        <TouchableOpacity onPress={handleConfirm}>
                            <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>Confirmar</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.pickerColumns}>
                        <View style={styles.pickerColumn}>
                            <ThemedText style={styles.pickerLabel}>Mes</ThemedText>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
                                {months.map((m, i) => (
                                    <TouchableOpacity key={m} onPress={() => setSelectedMonth(i)} style={[styles.pickerItem, selectedMonth === i && { backgroundColor: colors.primary + '20' }]}>
                                        <ThemedText style={[styles.pickerItemText, selectedMonth === i && { color: colors.primary, fontWeight: 'bold' }]}>{m}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.pickerColumn}>
                            <ThemedText style={styles.pickerLabel}>Año</ThemedText>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
                                {years.map((y) => (
                                    <TouchableOpacity key={y} onPress={() => setSelectedYear(y)} style={[styles.pickerItem, selectedYear === y && { backgroundColor: colors.primary + '20' }]}>
                                        <ThemedText style={[styles.pickerItemText, selectedYear === y && { color: colors.primary, fontWeight: 'bold' }]}>{y}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};



export default function EditarCurriculumScreen() {
  const router = useRouter();
  const clienteQuery = useQueryClient();
  const { data: user } = useUserProfile();
  
  const colors = useThemeColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const { data: curriculum, isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);
  const { data: actividadesExtracurriculares, isLoading: cargaExtra } = useActividadesExtracurriculares(user?.rut);
  const { data: actividadesCientificas, isLoading: cargaCientificas } = useActividadescientificas(user?.rut);
  const { data: cursosTitulosGrados, isLoading: cargaCursos } = useCursos_titulos_grados(user?.rut);
  const { data: ayudantias, isLoading: cargaAyudantias } = useAyudantias(user?.rut);
  const { mutate: editarCurriculum, isPending } = useEditarCurriculum();

  const [formData, setFormData] = useState<CurriculumDataEditar>({
    id: 0,
    nombres: "",
    apellidos: "",
    correo: "",
    comuna: "",
    ciudad: "",
    fecha_nacimiento: "",
    num_celular: "",
    carrera: "",
    otros: "",
    ayudantias: [],
    cursos_titulos_grados: [],
    actividades_cientificas: [],
    actividades_extracurriculares: [],
  });

  const [ayudantiaErrores, setAyudantiaErrores] = useState<{ [key: number]: string }>({});

  const [mostrarFullFechaPicker, setMostrarFullFechaPicker] = useState(false);
  const [fullFechaObjeto, setFullFechaObjeto] = useState(new Date());
  const [fullFechaTarget, setFullFechaTarget] = useState<{ type: 'nacimiento' | 'curso', index?: number } | null>(null);


  const [mostrarMesAnoPicker, setMostrarMesAnoPicker] = useState(false);
  const [mesAnoTarget, setMesAnoTarget] = useState<{ type: 'cientifica' | 'extracurricular', index: number } | null>(null);

  useEffect(() => {
    if (curriculum && ayudantias && cursosTitulosGrados && actividadesCientificas && actividadesExtracurriculares) {
      const d = curriculum as CurriculumResponse;
      
      setFormData({
        id: d.id || 0,
        nombres: d.nombres || "",
        apellidos: d.apellidos || "",
        correo: d.correo || "",
        comuna: d.comuna || "",
        ciudad: d.ciudad || "",
        fecha_nacimiento: d.fecha_nacimiento || "",
        num_celular: d.Num_Celular || "",
        carrera: d.carrera || "",
        otros: d.otros || "",
        ayudantias: ayudantias.map((a: any) => ({
            nombre_asig: a.nombre_asig,
            nombre_coordinador: a.nombre_coordinador,
            evaluacion_obtenida: a.evaluacion, 
        })) || [],
        cursos_titulos_grados: cursosTitulosGrados.map((t: any) => ({
            nombre_asig: t.nombre_asig,
            n_coordinador: t.n_coordinador,
            evaluacion: t.evaluacion,
        })) || [],
        actividades_cientificas: actividadesCientificas.map((c: any) => ({
            nombre: c.nombre,
            descripcion: c.descripcion,
            periodo_participacion: c.periodo_participacion,
        })) || [],
        actividades_extracurriculares: actividadesExtracurriculares.map((e: any) => ({
            nombre: e.nombre,
            docente: e.docente,
            descripcion: e.descripcion,
            periodo_participacion: e.periodo_participacion,
        })) || [],
      });
    }
  }, [curriculum, ayudantias, cursosTitulosGrados, actividadesCientificas, actividadesExtracurriculares]);

  const handleChange = (name: keyof CurriculumDataEditar, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (key: keyof CurriculumDataEditar, index: number, field: string, value: string) => {
    setFormData(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const updated = current.map((item, i) => i === index ? { ...item, [field]: value } : item);
        return { ...prev, [key]: updated };
      }
      return prev;
    });
  };

  const handleAddArrayItem = (key: keyof CurriculumDataEditar, newItem: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [...(prev[key] as any[]), newItem] : [newItem],
    }));
  };

  const handleRemoveArrayItem = (key: keyof CurriculumDataEditar, index: number) => {
    setFormData(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const updated = current.filter((_, i) => i !== index);
        return { ...prev, [key]: updated };
      }
      return prev;
    });
  };

  const handleNotaChange = (index: number, text: string) => {
        handleArrayChange('ayudantias', index, 'evaluacion_obtenida', text);

        const nota = text.replace(',', '.');
        const numNota = parseFloat(nota);

        let errorMsg = "";

        if (text.trim() === "") {
            errorMsg = "La nota es obligatoria.";
        } else if (isNaN(numNota)) {
            errorMsg = "La nota debe ser un número válido.";
        } else if (numNota < 1.0 || numNota > 5.0) {
            errorMsg = "La nota debe estar entre 1.0 y 5.0.";
        }

        setAyudantiaErrores(prev => ({
            ...prev,
            [index]: errorMsg
        }));
    };

    const openFullDatePicker = (type: 'nacimiento' | 'curso', index?: number, currentDateString?: string) => {
    let dateToSet = new Date();
    // Intenta parsear la fecha si existe string
    if (currentDateString) {
        // Formato esperado DD/MM/AAAA o AAAA-MM-DD
        if(currentDateString.includes('/')) {
            const [d, m, y] = currentDateString.split('/');
            const parsed = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
            if(!isNaN(parsed.getTime())) dateToSet = parsed;
        } else if (currentDateString.includes('-')) {
             const parsed = new Date(currentDateString + 'T12:00:00');
             if(!isNaN(parsed.getTime())) dateToSet = parsed;
        }
    }
    setFullFechaObjeto(dateToSet);
    setFullFechaTarget({ type, index });
    setMostrarFullFechaPicker(true);
  };

  const onFullDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || fullFechaObjeto;
    if (Platform.OS === 'android') setMostrarFullFechaPicker(false);
    setFullFechaObjeto(currentDate);

    if (!fullFechaTarget) return;

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    
    // Formato de salida: DD/MM/AAAA (Ajustar si se prefiere AAAA-MM-DD)
    const formattedDate = `${day}/${month}/${year}`;

    if (fullFechaTarget.type === 'nacimiento') {
        handleChange('fecha_nacimiento', formattedDate);
    } else if (fullFechaTarget.type === 'curso' && fullFechaTarget.index !== undefined) {
        handleArrayChange('cursos_titulos_grados', fullFechaTarget.index, 'evaluacion', formattedDate);
    }
  };

  const openMonthYearPicker = (type: 'cientifica' | 'extracurricular', index: number) => {
    setMesAnoTarget({ type, index });
    setMostrarMesAnoPicker(true);
    setMostrarFullFechaPicker(false);
  };

  const onMonthYearConfirm = (value: string) => {
    if (!mesAnoTarget) return;
    if (mesAnoTarget.type === 'cientifica') {
        handleArrayChange('actividades_cientificas', mesAnoTarget.index, 'periodo_participacion', value);
    } else {
        handleArrayChange('actividades_extracurriculares', mesAnoTarget.index, 'periodo_participacion', value);
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.id) return Alert.alert("Error", "Falta el ID del curriculum.");

    let hayCamposVacios = false;
    const nuevosErrores = { ...ayudantiaErrores };

    formData.ayudantias?.forEach((a, index) => {
      if (!a.evaluacion_obtenida || a.evaluacion_obtenida.toString().trim() === "") {
        nuevosErrores[index] = "La nota es obligatoria.";
        hayCamposVacios = true;
      }
    });

    if (hayCamposVacios) {
      setAyudantiaErrores(nuevosErrores);
      Alert.alert("Atención", "Por favor completa las notas de ayudantías previas.");
      return;
    }

    const hayErrores = Object.values(ayudantiaErrores).some(err => err !== "");
    if(hayErrores) {
        Alert.alert("Atención", "Por favor corrige las notas fuera de rango (1.0 - 5.0) en Ayudantías.");
        return;
    }

    editarCurriculum(formData, {
      onSuccess: () => {
        Alert.alert("Éxito", "Currículum actualizado correctamente");
        if (user?.rut) {
            const keys = ['curriculum', 'actividadesExtracurriculares', 'actividadesCientificas', 'cursosTitulosGrados', 'ayudantias'];
            keys.forEach(k => clienteQuery.invalidateQueries({ queryKey: [k, user.rut] }));
        }
        router.back(); 
      },
      onError: (error: any) => Alert.alert("Error", `No se pudo guardar: ${error.message}`)
    });
  };

  if (cargaCurriculum || cargaExtra || cargaCientificas || cargaCursos || cargaAyudantias) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Editar Currículum</ThemedText>
        <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
             {isPending ? <ActivityIndicator color={colors.primary} /> : <ThemedText style={{color: colors.primary, fontWeight: 'bold'}}>Guardar</ThemedText>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* DATOS PERSONALES */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <ThemedText type="defaultSemiBold">Información Personal</ThemedText>
            </View>
            <View style={styles.row}>
                <View style={{flex: 1}}>
                    <ModernInput placeholder="Ej: Juan Andrés" label="Nombres" icon="person" value={formData.nombres || ""} onChangeText={(t) => handleChange('nombres', t)} styles={styles} colors={colors} />
                </View>
                <View style={{width: 10}} />
                <View style={{flex: 1}}>
                    <ModernInput placeholder="Ej: Pérez Soto" label="Apellidos" icon="person" value={formData.apellidos || ""} onChangeText={(t) => handleChange('apellidos', t)} styles={styles} colors={colors} />
                </View>
            </View>
            
            {/* PICKER FECHA */}
            <View style={styles.inputWrapper}>
                <ThemedText style={styles.inputLabel}>Fecha de Nacimiento</ThemedText>
                <Pressable onPress={() => openFullDatePicker('nacimiento', undefined, formData.fecha_nacimiento)}>
                    <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                        <ThemedText style={[styles.dateText, !formData.fecha_nacimiento && {color: colors.textPlaceholder}]}>
                            {formData.fecha_nacimiento || "DD/MM/AAAA"}
                        </ThemedText>
                    </View>
                </Pressable>
            </View>
          </View>

          {/* CONTACTO */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <ThemedText type="defaultSemiBold">Contacto y Ubicación</ThemedText>
            </View>
            <ModernInput placeholder="correo@institucional.cl" label="Correo Institucional" icon="mail" value={formData.correo || ""} onChangeText={(t) => handleChange('correo', t)} keyboardType="email-address" styles={styles} colors={colors} />
            <ModernInput placeholder="Ej: 912345678" label="Número de Celular" icon="call" value={formData.num_celular || ""} onChangeText={(t) => handleChange('num_celular', t)} keyboardType="phone-pad" styles={styles} colors={colors} />
            <View style={styles.row}>
                <View style={{flex: 1}}>
                    <ModernInput placeholder="Ej: Viña del Mar" label="Ciudad" icon="map" value={formData.ciudad || ""} onChangeText={(t) => handleChange('ciudad', t)} styles={styles} colors={colors} />
                </View>
                <View style={{width: 10}} />
                <View style={{flex: 1}}>
                    <ModernInput placeholder="Ej: Centro" label="Comuna" icon="location" value={formData.comuna || ""} onChangeText={(t) => handleChange('comuna', t)} styles={styles} colors={colors} />
                </View>
            </View>
            <ModernInput placeholder="Ej: Medicina / Kinesiología" label="Carrera" icon="school" value={formData.carrera || ""} onChangeText={(t) => handleChange('carrera', t)} styles={styles} colors={colors} />
          </View>

          {/* AYUDANTIAS CONCURSOS Y OTROS */}
          <DynamicSection 
            title="Ayudantías Previas" 
            icon="book-outline"
            data={formData.ayudantias || []} 
            onAdd={() => handleAddArrayItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })}
            onRemove={(i: number) => {
              handleRemoveArrayItem("ayudantias", i);
              const errores = {...ayudantiaErrores};
              delete errores[i];
              setAyudantiaErrores(errores);
            }}
            renderItem={(item: any, i: number) => (
                <>
                    <ModernInput placeholder="Ej: Anatomía General / Fisiología" label="Asignatura" icon="book" value={item.nombre_asig} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_asig', t)} styles={styles} colors={colors} />
                    <ModernInput placeholder="Ej: Dr. Roberto González" label="Docente Coordinador" icon="person-circle" value={item.nombre_coordinador} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_coordinador', t)} styles={styles} colors={colors} />
                    <ModernInput placeholder="Ej: 4.8 " label="Evaluación (1.0 - 5.0)" icon="star" value={item.evaluacion_obtenida} keyboardType = "numeric" onChangeText={(t) => handleNotaChange(i,t)} error={ayudantiaErrores[i]} styles={styles} colors={colors} />
                </>
            )}
            styles={styles}
            colors={colors}
          />

         <DynamicSection 
            title="Cursos y Títulos" 
            icon="ribbon-outline"
            data={formData.cursos_titulos_grados || []} 
            onAdd={() => handleAddArrayItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })}
            onRemove={(i: number) => handleRemoveArrayItem("cursos_titulos_grados", i)}
            renderItem={(item: any, i: number) => (
                <>
                    <ModernInput placeholder="Ej: Curso RCP Básico / ACLS" label="Nombre Título/Curso" icon="ribbon" value={item.nombre_asig} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'nombre_asig', t)} styles={styles} colors={colors} />
                    <ModernInput placeholder="Ej: American Heart Association (AHA)" label="Institución" icon="business" value={item.n_coordinador} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'n_coordinador', t)} styles={styles} colors={colors} />

                    <View style={styles.inputWrapper}>
                        <ThemedText style={styles.inputLabel}>Fecha Realización (AAAA-MM-DD)</ThemedText>
                        <Pressable onPress={() => openFullDatePicker('curso', i, item.evaluacion)}>
                            <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                <ThemedText style={[styles.dateText, !item.evaluacion && {color: colors.textPlaceholder}]}>
                                    {item.evaluacion || "DD/MM/AAAA"}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </View>

                </>
            )}
            styles={styles}
            colors={colors}
          />

         <DynamicSection 
            title="Actividades Científicas" 
            icon="flask-outline"
            data={formData.actividades_cientificas || []} 
            onAdd={() => handleAddArrayItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })}
            onRemove={(i: number) => handleRemoveArrayItem("actividades_cientificas", i)}
            renderItem={(item: any, i: number) => (
                <>
                    <ModernInput placeholder="Ej: Publicación Case Report: Síndrome X" label="Nombre Actividad" icon="flask" value={item.nombre} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'nombre', t)} styles={styles} colors={colors} />
                    <ModernInput 
                        placeholder="Ej: Presentación de póster en congreso, co-autoría..." 
                        label="Descripción" 
                        icon="document-text" 
                        value={item.descripcion} 
                        onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'descripcion', t)} 
                        multiline 
                        styles={styles} 
                        colors={colors}
                        maxLength={700}
                        showCharCount={true}
                    />

                    <View style={styles.inputWrapper}>
                        <ThemedText style={styles.inputLabel}>Periodo (MM/AAAA)</ThemedText>
                        <Pressable onPress={() => openMonthYearPicker('cientifica', i)}>
                            <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                <ThemedText style={[styles.dateText, !item.periodo_participacion && {color: colors.textPlaceholder}]}>
                                    {item.periodo_participacion || "MM/AAAA"}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </View>

                </>
            )}
            styles={styles}
            colors={colors}
          />

         <DynamicSection 
            title="Extracurriculares" 
            icon="basketball-outline"
            data={formData.actividades_extracurriculares || []} 
            onAdd={() => handleAddArrayItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })}
            onRemove={(i: number) => handleRemoveArrayItem("actividades_extracurriculares", i)}
            renderItem={(item: any, i: number) => (
                <>
                    <ModernInput placeholder="Ej: Operativo de Salud Rural / IFMSA" label="Nombre Actividad" icon="basketball" value={item.nombre} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'nombre', t)} styles={styles} colors={colors} />
                    <ModernInput placeholder="Ej: Dra. María Soto" label="Docente / Encargado" icon="person" value={item.docente} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'docente', t)} styles={styles} colors={colors} />
                    
                    <View style={styles.inputWrapper}>
                        <ThemedText style={styles.inputLabel}>Periodo (MM/AAAA)</ThemedText>
                        <Pressable onPress={() => openMonthYearPicker('extracurricular', i)}>
                            <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                <ThemedText style={[styles.dateText, !item.periodo_participacion && {color: colors.textPlaceholder}]}>
                                    {item.periodo_participacion || "MM/AAAA"}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </View>


                </>
            )}
            styles={styles}
            colors={colors}
          />

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="layers-outline" size={20} color={colors.primary} />
              <ThemedText type="defaultSemiBold">Otros Antecedentes</ThemedText>
            </View>
            <ModernInput 
                label="Resumen Profesional / Habilidades" 
                placeholder="Ej: Nivel de Inglés C1, Manejo de Excel Avanzado, Delegado de Generación 2023. Interés en área de investigación clínica."
                icon="create" 
                value={formData.otros || ""} 
                onChangeText={(t) => handleChange('otros', t)} 
                multiline 
                numberOfLines={6} 
                styles={styles} 
                colors={colors}
                maxLength={700}
                showCharCount={true}
            />
          </View>

          <View style={{height: 40}} />
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- DATE PICKER ANDROID --- */}
      {Platform.OS === 'android' && mostrarFullFechaPicker && (
        <DateTimePicker
            value={fullFechaObjeto}
            mode="date"
            display="default"
            onChange={onFullDateChange}
            maximumDate={new Date()}
            locale="es-ES"
        />
      )}

      {/* --- DATE PICKER IOS--- */}
      {Platform.OS === 'ios' && (
        <Modal
            transparent={true}
            visible={mostrarFullFechaPicker}
            animationType="fade"
            onRequestClose={() => setMostrarFullFechaPicker(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setMostrarFullFechaPicker(false)}>
                <View style={[styles.iosDatePickerContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.iosDatePickerHeader}>
                        <TouchableOpacity onPress={() => setMostrarFullFechaPicker(false)}>
                            <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Listo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={fullFechaObjeto}
                        mode="date"
                        display="spinner"
                        onChange={onFullDateChange}
                        maximumDate={new Date()}
                        locale="es-ES"
                        textColor={colors.text}
                        themeVariant={colors.background === '#000' ? 'dark' : 'light'}
                    />
                </View>
            </Pressable>
        </Modal>
      )}

      <MonthYearPicker 
        visible={mostrarMesAnoPicker} 
        onClose={() => setMostrarMesAnoPicker(false)}
        onConfirm={onMonthYearConfirm}
        styles={styles}
        colors={colors}
      />

    </SafeAreaView>
  );
}

// Componente auxiliar
const DynamicSection = ({ title, icon, data, onAdd, onRemove, renderItem, styles, colors }: any) => (
    <View style={[styles.card, { paddingBottom: 10 }]}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name={icon || "list"} size={20} color={colors.primary} />
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
            </View>
            <TouchableOpacity onPress={onAdd} style={styles.miniAddBtn}>
                <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
        <ScrollView style={styles.dynamicListScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
            {data.length === 0 && (
                <ThemedText style={{fontStyle: 'italic', color: colors.textPlaceholder, marginBottom: 10, marginTop: 5}}>
                    No hay registros. Toca el botón + para agregar.
                </ThemedText>
            )}
            {data.map((item: any, i: number) => (
                <View key={i} style={styles.dynamicItemContainer}>
                    <View style={styles.dynamicItemHeader}>
                        <ThemedText style={styles.itemIndex}>#{i + 1}</ThemedText>
                        <TouchableOpacity onPress={() => onRemove(i)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                    {renderItem(item, i)}
                </View>
            ))}
        </ScrollView>
    </View>
);

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
    paddingBottom: 60,
  },
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 20,
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
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  row: {
    flexDirection: 'row',
  },
  // Inputs
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLabel,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 15,
    color: colors.text,
  },
  textAreaContainer: {
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: colors.textPlaceholder,
    marginTop: 4,
    marginRight: 4,
  },
  dynamicListScroll: {
    maxHeight: 400, 
  },
  miniAddBtn: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dynamicItemContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginRight: 4, 
  },
  dynamicItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // --- Estilos para el Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  iosDatePickerContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
  },
  pickerContainer: {
    width: '100%',
    height: 320,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
  },
  pickerColumns: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerList: {
    flex: 1,
  },
  pickerLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
    color: colors.text,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
});