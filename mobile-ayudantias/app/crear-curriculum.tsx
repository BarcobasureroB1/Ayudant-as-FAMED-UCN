import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  TextInputProps,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  Modal,
  FlatList
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Stack, useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '@/hooks/useThemeColors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCrearCurriculum } from '@/hooks/useCurriculum';
import { useUserProfile } from '@/hooks/useUserProfile';

// --- COMPONENTE INPUT MODERNO ---
interface ModernInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  showCharCount?: boolean;
  maxLength?: number;
  error?: string;
}

const ModernInput: React.FC<ModernInputProps & { styles: any, colors: any }> = ({
  label,
  icon,
  styles,
  colors,
  showCharCount,
  maxLength,
  value,
  editable = true,
  error,
  ...props
}) => (
  <View style={styles.inputWrapper}>
    <ThemedText style={styles.inputLabel}>{label}</ThemedText>
    <View style={[styles.inputContainer, props.multiline && styles.textAreaContainer, !editable && styles.inputDisabled, error ? { borderColor: colors.error } : {}]}>
      <Ionicons name={icon} size={20} color={error ? colors.error : (editable ? colors.primary : colors.textPlaceholder)} style={[styles.inputIcon, props.multiline && { marginTop: 12 }]} />
      <TextInput
        style={[styles.input, props.multiline && styles.textArea, !editable && { color: colors.textPlaceholder }]}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
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

// --- COMPONENTE PICKER MES / AÑO PERSONALIZADO ---
const MonthYearPicker = ({ visible, onClose, onConfirm, styles, colors }: any) => {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i); // Últimos 50 años

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const handleConfirm = () => {
        // Formato MM/AAAA
        const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
        onConfirm(`${monthStr}/${selectedYear}`);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={styles.pickerHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <ThemedText style={{ color: colors.error }}>Cancelar</ThemedText>
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold">Seleccionar Periodo</ThemedText>
                        <TouchableOpacity onPress={handleConfirm}>
                            <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>Confirmar</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Columns */}
                    <View style={styles.pickerColumns}>
                        {/* Meses */}
                        <View style={styles.pickerColumn}>
                            <ThemedText style={styles.pickerLabel}>Mes</ThemedText>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
                                {months.map((m, i) => (
                                    <TouchableOpacity 
                                        key={m} 
                                        onPress={() => setSelectedMonth(i)}
                                        style={[styles.pickerItem, selectedMonth === i && { backgroundColor: colors.primary + '20' }]}
                                    >
                                        <ThemedText style={[styles.pickerItemText, selectedMonth === i && { color: colors.primary, fontWeight: 'bold' }]}>
                                            {m}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Años */}
                        <View style={styles.pickerColumn}>
                            <ThemedText style={styles.pickerLabel}>Año</ThemedText>
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerList}>
                                {years.map((y) => (
                                    <TouchableOpacity 
                                        key={y} 
                                        onPress={() => setSelectedYear(y)}
                                        style={[styles.pickerItem, selectedYear === y && { backgroundColor: colors.primary + '20' }]}
                                    >
                                        <ThemedText style={[styles.pickerItemText, selectedYear === y && { color: colors.primary, fontWeight: 'bold' }]}>
                                            {y}
                                        </ThemedText>
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


export default function CrearCurriculumScreen() {
    const router = useRouter();
    const { data: user } = useUserProfile();
    const crearCurriculum = useCrearCurriculum();
    const { setToken, setUsertipo } = useAuth();
    const clienteQuery = useQueryClient();
    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const [paso, setPaso] = useState<number>(1);
    const [ayudantiaErrores, setAyudantiaErrores] = useState<{[key: number]: string}>({});

    const [form, setForm] = useState({
        rut_alumno: user?.rut || "",
        nombres: "",
        apellidos: "",
        fecha_nacimiento: "",
        comuna: "",
        ciudad: "",
        num_celular: "",
        correo: "",
        carrera: "",
        otros: "",
        ayudantias: [],
        cursos_titulos_grados: [],
        actividades_cientificas: [],
        actividades_extracurriculares: [],
    });

    // --- ESTADOS PARA DATE PICKERS ---
    // 1. Fecha completa (Nacimiento / Curso)
    const [showFullDatePicker, setShowFullDatePicker] = useState(false);
    const [fullDateObject, setFullDateObject] = useState(new Date());
    const [fullDateTarget, setFullDateTarget] = useState<{ type: 'nacimiento' | 'curso', index?: number } | null>(null);

    // 2. Mes/Año (Periodos)
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [monthYearTarget, setMonthYearTarget] = useState<{ type: 'cientifica' | 'extra', index: number } | null>(null);


    // --- HANDLERS GENERALES ---
    //Handler para validar nota ayudantía
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

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (key: keyof typeof form, index: number, name: string, value: string) => {
        const newArray = [...(form[key] as any[])];
        newArray[index][name] = value;
        setForm(prev => ({ ...prev, [key]: newArray }));
    };

    const addItem = (key: keyof typeof form, emptyItem: any) => {
        setForm(prev => ({ ...prev, [key]: [...(prev[key] as any[]), emptyItem] }));
    };

    const removeItem = (key: keyof typeof form, index: number) => {
        const newArray = (form[key] as any[]).filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, [key]: newArray }));
    };

    // --- HANDLERS FECHA COMPLETA (AAAA-MM-DD) ---

    const openFullDatePicker = (type: 'nacimiento' | 'curso', index?: number, currentDateString?: string) => {
        let dateToSet = new Date();
        if (currentDateString) {
             const d = new Date(currentDateString); 
             if (!isNaN(d.getTime())) dateToSet = d;
        }
        setFullDateObject(dateToSet);
        setFullDateTarget({ type, index });
        setShowFullDatePicker(true);
    };

    const onFullDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || fullDateObject;
        if (Platform.OS === 'android') setShowFullDatePicker(false);
        setFullDateObject(currentDate);

        if (!fullDateTarget) return;

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        if (fullDateTarget.type === 'nacimiento') {
            handleChange('fecha_nacimiento', formattedDate);
        } else if (fullDateTarget.type === 'curso' && fullDateTarget.index !== undefined) {
            handleArrayChange('cursos_titulos_grados', fullDateTarget.index, 'evaluacion', formattedDate);
        }
    };

    // --- HANDLERS MES/AÑO (MM/AAAA) ---

    const openMonthYearPicker = (type: 'cientifica' | 'extra', index: number) => {
        setMonthYearTarget({ type, index });
        setShowMonthYearPicker(true);
    };

    const onMonthYearConfirm = (value: string) => {
        if (!monthYearTarget) return;
        if (monthYearTarget.type === 'cientifica') {
            handleArrayChange('actividades_cientificas', monthYearTarget.index, 'periodo_participacion', value);
        } else {
            handleArrayChange('actividades_extracurriculares', monthYearTarget.index, 'periodo_participacion', value);
        }
    };


    const logout = () => {
        clienteQuery.clear();
        if (setToken) setToken(null);
        if (setUsertipo) setUsertipo(null);
        router.replace('/(auth)/login');
    }

    const handleSubmit = () => {
        if (!form.nombres || !form.apellidos || !form.correo) {
            Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
            return;
        }
        if (form.otros.length > 700) {
             Alert.alert("Error", "La información adicional excede el límite de 700 caracteres.");
             return;
        }

        const notaErrores = Object.values(ayudantiaErrores).find(err => err !== "");
        if (notaErrores) {
            Alert.alert("Error", "Por favor corrige la nota de ayudantias previas antes de continuar.");
            return;
        }

        crearCurriculum.mutate(form, {
            onSuccess: async () => {
                Alert.alert("¡Éxito!", "Currículum creado correctamente.");
                await clienteQuery.refetchQueries({queryKey: ['curriculum', user?.rut]});
                router.replace('/(tabs)');
            },
            onError: (error: any) => {
                Alert.alert("Error", `No se pudo crear el currículum: ${error.message}`);
            }
        });
    }

    return(
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} /> 

            {/* HEADER */}
            <View style={styles.header}>
                {paso > 1 ? (
                    <TouchableOpacity onPress={() => setPaso(paso - 1)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                ) : (
                    <View style={[styles.backButton, { opacity: 0 }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </View>
                )}
                <ThemedText type="subtitle" style={styles.headerTitle}>Crear Currículum</ThemedText>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color={colors.error}/>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    
                    {/* INDICADOR DE PASOS */}
                    <View style={styles.stepIndicatorContainer}>
                        <ThemedText style={styles.stepText}>Paso {paso} de 2</ThemedText>
                        <View style={styles.stepBar}>
                            <View style={[styles.stepBarProgress, {width: `${(paso / 2) * 100}%`, backgroundColor: colors.primary}]} />
                        </View>
                    </View>

                    {paso === 1 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} />
                                <ThemedText type="defaultSemiBold">Datos Personales</ThemedText>
                            </View>

                            <ModernInput label="RUT" icon="card" value={form.rut_alumno} onChangeText={() => {}} editable={false} styles={styles} colors={colors} />
                            
                            <View style={styles.row}>
                                <View style={{flex: 1}}>
                                    <ModernInput placeholder="Ej: Juan Andrés" label="Nombres" icon="person" value={form.nombres} onChangeText={(t) => handleChange('nombres', t)} styles={styles} colors={colors} />
                                </View>
                                <View style={{width: 10}} />
                                <View style={{flex: 1}}>
                                    <ModernInput placeholder="Ej: Pérez Soto" label="Apellidos" icon="person" value={form.apellidos} onChangeText={(t) => handleChange('apellidos', t)} styles={styles} colors={colors} />
                                </View>
                            </View>

                            {/* FECHA NACIMIENTO */}
                            <View style={styles.inputWrapper}>
                                <ThemedText style={styles.inputLabel}>Fecha de Nacimiento</ThemedText>
                                <Pressable onPress={() => openFullDatePicker('nacimiento', undefined, form.fecha_nacimiento)}>
                                    <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                                        <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                        <ThemedText style={[styles.dateText, !form.fecha_nacimiento && {color: colors.textPlaceholder}]}>
                                            {form.fecha_nacimiento || "DD/MM/AAAA"}
                                        </ThemedText>
                                    </View>
                                </Pressable>
                            </View>

                            <ModernInput placeholder="correo@institucional.cl" label="Correo" icon="mail" value={form.correo} onChangeText={(t) => handleChange('correo', t)} keyboardType="email-address" styles={styles} colors={colors} />
                            <ModernInput placeholder="Ej: 912345678" label="Celular" icon="call" value={form.num_celular} onChangeText={(t) => handleChange('num_celular', t)} keyboardType="phone-pad" styles={styles} colors={colors} />
                            
                            <View style={styles.row}>
                                <View style={{flex: 1}}>
                                    <ModernInput placeholder="Ej: Viña del Mar" label="Ciudad" icon="map" value={form.ciudad} onChangeText={(t) => handleChange('ciudad', t)} styles={styles} colors={colors} />
                                </View>
                                <View style={{width: 10}} />
                                <View style={{flex: 1}}>
                                    <ModernInput placeholder="Ej: Centro" label="Comuna" icon="location" value={form.comuna} onChangeText={(t) => handleChange('comuna', t)} styles={styles} colors={colors} />
                                </View>
                            </View>
                            
                            <ModernInput placeholder="Ej: Medicina / Kinesiología" label="Carrera" icon="school" value={form.carrera} onChangeText={(t) => handleChange('carrera', t)} styles={styles} colors={colors} />

                            <TouchableOpacity style={[styles.button, styles.buttonNext]} onPress={() => setPaso(2)}>
                                <ThemedText style={styles.buttonText}>Siguiente</ThemedText>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {paso === 2 && (
                        <>
                            <ThemedText type="title" style={styles.sectionPageTitle}>Información Académica</ThemedText>

                            {/* AYUDANTIAS */}
                            <DynamicSection 
                                title="Ayudantías Previas" 
                                icon="book-outline"
                                data={form.ayudantias} 
                                onAdd={() => addItem('ayudantias', { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })}
                                onRemove={(i: number) => {
                                    removeItem('ayudantias', i);
                                    const newErrores = {...ayudantiaErrores};
                                    delete newErrores[i];
                                    setAyudantiaErrores(newErrores);
                                }}
                                renderItem={(item: any, i: number) => (
                                    <>
                                        <ModernInput placeholder="Ej: Anatomía General / Fisiología" label="Asignatura" icon="book" value={item.nombre_asig} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_asig', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: Dr. Roberto González" label="Coordinador" icon="person-circle" value={item.nombre_coordinador} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_coordinador', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: 4.8" label="Evaluación (Nota)" icon="star" value={item.evaluacion_obtenida} keyboardType="numeric" onChangeText={(t) => handleNotaChange(i,t)} error={ayudantiaErrores[i]} styles={styles} colors={colors} />
                                    </>
                                )}
                                styles={styles}
                                colors={colors}
                            />

                            {/* CURSOS */}
                            <DynamicSection 
                                title="Cursos, Títulos y Grados" 
                                icon="ribbon-outline"
                                data={form.cursos_titulos_grados} 
                                onAdd={() => addItem('cursos_titulos_grados', { nombre_asig: "", n_coordinador: "", evaluacion: "" })}
                                onRemove={(i: number) => removeItem('cursos_titulos_grados', i)}
                                renderItem={(item: any, i: number) => (
                                    <>
                                        <ModernInput placeholder="Ej: Curso RCP Básico / ACLS" label="Nombre Título/Curso" icon="ribbon" value={item.nombre_asig} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'nombre_asig', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: American Heart Association (AHA)" label="Institución" icon="business" value={item.n_coordinador} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'n_coordinador', t)} styles={styles} colors={colors} />
                                        
                                        {/* Fecha Curso (Día completo) */}
                                        <View style={styles.inputWrapper}>
                                            <ThemedText style={styles.inputLabel}>Fecha (AAAA-MM-DD)</ThemedText>
                                            <Pressable onPress={() => openFullDatePicker('curso', i, item.evaluacion)}>
                                                <View style={[styles.inputContainer, { justifyContent: 'flex-start' }]}>
                                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                                    <ThemedText style={[styles.dateText, !item.evaluacion && {color: colors.textPlaceholder}]}>
                                                        {item.evaluacion || "AAAA-MM-DD"}
                                                    </ThemedText>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </>
                                )}
                                styles={styles}
                                colors={colors}
                            />

                            {/* CIENTIFICAS (MES/AÑO) */}
                            <DynamicSection 
                                title="Actividades Científicas" 
                                icon="flask-outline"
                                data={form.actividades_cientificas} 
                                onAdd={() => addItem('actividades_cientificas', { nombre: "", descripcion: "", periodo_participacion: "" })}
                                onRemove={(i: number) => removeItem('actividades_cientificas', i)}
                                renderItem={(item: any, i: number) => (
                                    <>
                                        <ModernInput placeholder="Ej: Publicación Case Report: Síndrome X" label="Nombre Actividad" icon="flask" value={item.nombre} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'nombre', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: Presentación de póster, co-autoría..." label="Descripción" icon="document-text" value={item.descripcion} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'descripcion', t)} styles={styles} colors={colors} />
                                        
                                        {/* Periodo (Mes/Año) */}
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

                            {/* EXTRACURRICULARES (MES/AÑO) */}
                            <DynamicSection 
                                title="Extracurriculares" 
                                icon="basketball-outline"
                                data={form.actividades_extracurriculares} 
                                onAdd={() => addItem('actividades_extracurriculares', { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })}
                                onRemove={(i: number) => removeItem('actividades_extracurriculares', i)}
                                renderItem={(item: any, i: number) => (
                                    <>
                                        <ModernInput placeholder="Ej: Operativo de Salud Rural / IFMSA" label="Nombre Actividad" icon="basketball" value={item.nombre} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'nombre', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: Dra. María Soto" label="Docente / Inst." icon="person" value={item.docente} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'docente', t)} styles={styles} colors={colors} />
                                        <ModernInput placeholder="Ej: Atención primaria supervisada..." label="Descripción" icon="document-text" value={item.descripcion} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'descripcion', t)} styles={styles} colors={colors} />
                                        
                                        {/* Periodo (Mes/Año) */}
                                        <View style={styles.inputWrapper}>
                                            <ThemedText style={styles.inputLabel}>Periodo (MM/AAAA)</ThemedText>
                                            <Pressable onPress={() => openMonthYearPicker('extra', i)}>
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

                            {/* OTROS - CON LÍMITE */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="layers-outline" size={20} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold">Otros Antecedentes</ThemedText>
                                </View>
                                <ModernInput
                                    label="Información Adicional (Opcional)"
                                    placeholder="Ej: Nivel de Inglés C1, Manejo de Excel Avanzado, Delegado de Generación 2023. Interés en área de investigación clínica."
                                    icon="create"
                                    value={form.otros}
                                    onChangeText={(text) => handleChange('otros', text)}
                                    multiline
                                    numberOfLines={5}
                                    styles={styles} 
                                    colors={colors}
                                    maxLength={700}
                                    showCharCount={true}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.button, styles.buttonBack]} onPress={() => setPaso(1)}>
                                    <Ionicons name="arrow-back" size={18} color={colors.text}/>
                                    <ThemedText style={styles.buttonTextBack}>Anterior</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={handleSubmit} disabled={crearCurriculum.isPending}>
                                    <ThemedText style={styles.buttonText}>
                                        {crearCurriculum.isPending ? 'Guardando...' : 'Guardar CV'}
                                    </ThemedText>
                                    <Ionicons name="save-outline" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* --- DATE PICKER COMPLETO (ANDROID/IOS) --- */}
            {Platform.OS === 'android' && showFullDatePicker && (
                <DateTimePicker
                    value={fullDateObject}
                    mode="date"
                    display="default"
                    onChange={onFullDateChange}
                    locale="es-ES"
                />
            )}
            {Platform.OS === 'ios' && (
                <Modal
                    transparent={true}
                    visible={showFullDatePicker}
                    animationType="fade"
                    onRequestClose={() => setShowFullDatePicker(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setShowFullDatePicker(false)}>
                        <View style={[styles.iosDatePickerContainer, { backgroundColor: colors.card }]}>
                            <View style={styles.iosDatePickerHeader}>
                                <TouchableOpacity onPress={() => setShowFullDatePicker(false)}>
                                    <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Listo</ThemedText>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={fullDateObject}
                                mode="date"
                                display="spinner"
                                onChange={onFullDateChange}
                                locale="es-ES"
                                textColor={colors.text}
                                themeVariant={colors.background === '#000' ? 'dark' : 'light'}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* --- MONTH YEAR PICKER (PERSONALIZADO) --- */}
            <MonthYearPicker 
                visible={showMonthYearPicker} 
                onClose={() => setShowMonthYearPicker(false)}
                onConfirm={onMonthYearConfirm}
                styles={styles}
                colors={colors}
            />

        </SafeAreaView>
    );
}

// --- Componente auxiliar con Scroll interno ---
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
    stepIndicatorContainer: {
        marginBottom: 24,
    },
    stepText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
    },
    stepBar: {
        height: 6,
        backgroundColor: colors.inputBorder,
        borderRadius: 3,
    },
    stepBarProgress: {
        height: 6,
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    sectionPageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.inputBorder,
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
    inputDisabled: {
        opacity: 0.7,
        backgroundColor: colors.inputBackground, 
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
    textAreaContainer: {
        height: 'auto',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dateText: {
        fontSize: 15,
        color: colors.text,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 11,
        color: colors.textPlaceholder,
        marginTop: 4,
        marginRight: 4,
    },
    
    // Grid
    row: {
        flexDirection: 'row',
        gap: 10,
    },

    // Dynamic Lists & Scroll
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.primary + '15',
        marginTop: 4,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Buttons
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
    },
    buttonNext: {
        backgroundColor: colors.primary,
        marginTop: 16,
    },
    buttonText: {
        color: '#fff', 
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    buttonBack: {
        flex: 1,
        backgroundColor: colors.card, 
        borderWidth: 1,
        borderColor: colors.inputBorder,
    },
    buttonTextBack: {
        color: colors.text, 
        fontSize: 16,
        fontWeight: '600',
    },
    buttonSubmit: {
        flex: 2,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },

    // iOS Picker Styles
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

    // Custom MonthYear Picker Styles
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
    },
    pickerItem: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    pickerItemText: {
        fontSize: 16,
    },
});