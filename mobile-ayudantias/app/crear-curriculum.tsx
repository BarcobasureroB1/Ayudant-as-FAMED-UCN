import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInputProps,
  Alert,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCrearCurriculum } from '@/hooks/useCurriculum';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter} from 'expo-router';
import { useAuth } from '@/context/AuthContext';
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
    placeholder,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    disabled = false,
    autoCapitalize= "none",
}) => (
    <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>{label}</ThemedText>
        <TextInput
            style={[styles.input, multiline && styles.textArea, disabled && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={!disabled}
            placeholderTextColor="#999"
            autoCapitalize={autoCapitalize}
        />
    </View>
);

export default function CrearCurriculumScreen() {
    const router = useRouter();
    const { data: user } = useUserProfile();
    const crearCurriculum = useCrearCurriculum();
    const { setToken, setUsertipo } = useAuth();

    const clienteQuery = useQueryClient();

    const [paso, setPaso] = useState<number>(1);
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
        ayudantias: [{ nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" }],
        cursos_titulos_grados: [{ nombre_asig: "", n_coordinador: "", evaluacion: "" }],
        actividades_cientificas: [{ nombre: "", descripcion: "", periodo_participacion: "" }],
        actividades_extracurriculares: [{ nombre: "", docente: "", descripcion: "", periodo_participacion: "" }],
    });

    const handleChange = (name: string, value: string) => {
        setForm(prevForm => ({
        ...prevForm,
        [name]: value,
        }));
    };


    const handleArrayChange = (key: keyof typeof form, index: number, name: string, value: string) => {
        const newArray = [...(form[key] as any[])];
        newArray[index][name] = value;
        setForm(prevForm => ({
        ...prevForm,
        [key]: newArray,
        }));
    };


    const addItem = (key: keyof typeof form, emptyItem: any) => {
        setForm(prevForm => ({
        ...prevForm,
        [key]: [...(prevForm[key] as any[]), emptyItem],
        }));
    };


    const removeItem = (key: keyof typeof form, index: number) => {
        const newArray = (form[key] as any[]).filter((_, i) => i !== index);
        setForm(prevForm => ({
        ...prevForm,
        [key]: newArray,
        }));
    };

    const logout = () => {
        clienteQuery.clear();
        if (setToken)
        {
            setToken(null);
        }
        if (setUsertipo)
        {
            setUsertipo(null);
        }
        //SecureStore.deleteItemAsync('token');
        //SecureStore.deleteItemAsync('tipoUser');

        router.replace('/(auth)/login');
    }


    const handleSubmit = () => {
        
        if (!form.nombres || !form.apellidos || !form.correo) {
        Alert.alert("Error", "Por favor completa Todos los campos.");
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
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Crear Curriculum',
                    headerBackVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <Ionicons name="log-out-outline" size={22} color="#C70039"/>
                            <ThemedText style={styles.logoutButtonText}>Salir</ThemedText>
                        </TouchableOpacity>
                    )
                }}
            /> 

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.stepIndicatorContainer}>
                    <ThemedText style={styles.stepText}>Paso {paso} de 2</ThemedText>
                    <View style={styles.stepBar}>
                        <View style={[styles.stepBarProgress, {width: `${(paso / 2) * 100}%`}]} />
                    </View>
                </View>

                {paso === 1 && (
                    <View style={styles.formContainer}>
                        <ThemedText type="title" style={styles.title}>Datos Personales</ThemedText>

                        <FormInput
                            label="RUT"
                            value={form.rut_alumno}
                            onChangeText={(text) => handleChange('rut_alumno', text)}
                            disabled
                            
                        />
                        <FormInput
                            label="Nombres"
                            value={form.nombres}
                            onChangeText={(text) => handleChange('nombres', text)}
                            placeholder="Juan Andrés"
                        />
                        <FormInput
                            label="Apellidos"
                            value={form.apellidos}
                            onChangeText={(text) => handleChange('apellidos', text)}
                            placeholder="Pérez Gonzáles"
                        />
                        <FormInput
                            label="Fecha de Nacimiento (AAAA-MM-DD)"
                            value={form.fecha_nacimiento}
                            onChangeText={(text) => handleChange('fecha_nacimiento', text)}
                            placeholder="1999-12-31"
                        />
                        <FormInput
                            label="Comuna"
                            value={form.comuna}
                            onChangeText={(text) => handleChange('comuna', text)}
                            placeholder="Providencia"
                        />
                        <FormInput
                            label="Ciudad"
                            value={form.ciudad}
                            onChangeText={(text) => handleChange('ciudad', text)}
                            placeholder="Santiago"
                        />
                        <FormInput
                            label="Número de Celular"
                            value={form.num_celular}
                            onChangeText={(text) => handleChange('num_celular', text)}
                            keyboardType="phone-pad"
                            placeholder="+56912345678"
                        />
                        <FormInput
                            label="Correo"
                            value={form.correo}
                            onChangeText={(text) => handleChange('correo', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="tu.correo@universidad.cl"
                        />
                        <FormInput
                            label="Carrera"
                            value={form.carrera}
                            onChangeText={(text) => handleChange('carrera', text)}
                            placeholder="Medicina, Kinesiología, etc..."
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.buttonNext]}
                            onPress={() => setPaso(2)}
                        >
                            <ThemedText style={styles.buttonText}>Siguiente</ThemedText>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>

                    </View>
                )}


                {paso === 2 && (
                    <View style={styles.formContainer}>
                        <ThemedText type="title" style={styles.title}>Información Académica</ThemedText>

                        <View style={styles.dynamicSection}>
                            <ThemedText style={styles.sectionTitle}>Ayudantias Previas</ThemedText>
                            {form.ayudantias.map((a, i) => (
                                <View key={`ayudantia-${i}`} style={styles.dynamicItem}>
                                    <FormInput label="Asignatura" value={a.nombre_asig} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_asig', t)}/>
                                    <FormInput label="Coordinador" value={a.nombre_coordinador} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_coordinador', t)}/>
                                    <FormInput label="Evaluación (Nota)" value={a.evaluacion_obtenida} onChangeText={(t) => handleArrayChange('ayudantias', i, 'evaluacion_obtenida', t)} keyboardType="numeric"/>
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeItem('ayudantias', i)}>
                                        <Ionicons name="trash-outline" size={20} color="#C70039"/>
                                    </TouchableOpacity>
                                </View>      
                            ))}
                            <TouchableOpacity style={styles.addButton} onPress={() => addItem('ayudantias', { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: ""})}>
                                <Ionicons name="add" size={20} color="#007bff" />
                                <ThemedText style={styles.addButtonText}>Agregar Ayudantía</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dynamicSection}>
                            <ThemedText style={styles.sectionTitle}>Cursos, Titulos y Grados</ThemedText>
                            {form.cursos_titulos_grados.map((c, i) => (
                                <View key={`curso-${i}`} style={styles.dynamicItem}>
                                    <FormInput label="Nombre Título/Curso" value={c.nombre_asig} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'nombre_asig', t)} />
                                    <FormInput label="Institución" value={c.n_coordinador} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'n_coordinador', t)} />
                                    <FormInput label="Fecha (AAAA-MM-DD)" value={c.evaluacion} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'evaluacion', t)} />
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeItem('cursos_titulos_grados', i)}>
                                        <Ionicons name="trash-outline" size={20} color="#C70039" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addButton} onPress={() => addItem('cursos_titulos_grados', { nombre_asig: "", n_coordinador: "", evaluacion: "" })}>
                                <Ionicons name="add" size={20} color="#007bff" />
                                <ThemedText style={styles.addButtonText}>Agregar Curso/Título</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dynamicSection}>
                            <ThemedText style={styles.sectionTitle}>Actividades Científicas</ThemedText>
                            {form.actividades_cientificas.map((a, i) => (
                                <View key={`cientifica-${i}`} style={styles.dynamicItem}>
                                    <FormInput label="Nombre Actividad" value={a.nombre} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'nombre', t)} />
                                    <FormInput label="Descripción" value={a.descripcion} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'descripcion', t)} />
                                    <FormInput label="Periodo de Participación" value={a.periodo_participacion} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'periodo_participacion', t)} />
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeItem('actividades_cientificas', i)}>
                                        <Ionicons name="trash-outline" size={20} color="#C70039" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addButton} onPress={() => addItem('actividades_cientificas', { nombre: "", descripcion: "", periodo_participacion: "" })}>
                                <Ionicons name="add" size={20} color="#007bff" />
                                <ThemedText style={styles.addButtonText}>Agregar Act. Científica</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dynamicSection}>
                            <ThemedText style={styles.sectionTitle}>Actividades Extracurriculares</ThemedText>
                            {form.actividades_extracurriculares.map((a, i) => (
                                <View key={`extra-${i}`} style={styles.dynamicItem}>
                                    <FormInput label="Nombre Actividad" value={a.nombre} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'nombre', t)} />
                                    <FormInput label="Docente / Institución" value={a.docente} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'docente', t)} />
                                    <FormInput label="Descripción" value={a.descripcion} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'descripcion', t)} />
                                    <FormInput label="Periodo de Participación" value={a.periodo_participacion} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'periodo_participacion', t)} />
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeItem('actividades_extracurriculares', i)}>
                                        <Ionicons name="trash-outline" size={20} color="#C70039" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addButton} onPress={() => addItem('actividades_extracurriculares', { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })}>
                                <Ionicons name="add" size={20} color="#007bff" />
                                <ThemedText style={styles.addButtonText}>Agregar Act. Extracurricular</ThemedText>
                            </TouchableOpacity>
                        </View>                       

                        <FormInput
                            label="Información Adicional (Opcional)"
                            value={form.otros}
                            onChangeText={(text) => handleChange('otros', text)}
                            multiline
                            numberOfLines={5}
                            placeholder="Logros, habilidades, proyectos, etc."
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBack]}
                                onPress={() => setPaso(1)}
                            >
                                <Ionicons name="arrow-back" size={18} color="#333"/>
                                <ThemedText style={styles.buttonTextBack}>Anterior</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonSubmit]}
                                onPress={handleSubmit}
                                disabled={crearCurriculum.isPending}
                            >
                                <ThemedText style={styles.buttonText}>
                                    {crearCurriculum.isPending ? 'Guardando...' : 'Guardar Currículum'}
                                </ThemedText>
                                <Ionicons name="save-outline" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}
    


    const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formContainer: {
        gap: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 24,
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
    stepIndicatorContainer: {
        marginBottom: 24,
    },
    stepText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#007bff',
        marginBottom: 8,
    },
    stepBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
    },
    stepBarProgress: {
        height: 6,
        backgroundColor: '#007bff',
        borderRadius: 3,
    },
    dynamicSection: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#fafafa'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    dynamicItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
        marginBottom: 12,
        position: 'relative',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: '#e6f7ff',
    },
    addButtonText: {
        color: '#007bff',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 10,
    },
    buttonNext: {
        backgroundColor: '#007bff',
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
        marginTop: 16,
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 10,
        gap: 4,
    },
    logoutButtonText: {
        color: '#C70039',
        fontWeight: '600',
        fontSize: 16,
    }
});