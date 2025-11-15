import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  TextInputProps,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useEditarCurriculum, CurriculumResponse, useComprobarCurriculum, useActividadesExtracurriculares, useActividadescientificas, useAyudantias, useCursos_titulos_grados } from '@/hooks/useCurriculum';
import { useUserProfile } from '@/hooks/useUserProfile';


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
      style={[styles.input, props.multiline && styles.textArea, props.disabled && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#999"
      autoCapitalize="none"
      {...props}
    />
  </View>
);


export default function EditarCurriculumScreen() {
  const router = useRouter();
  const clienteQuery = useQueryClient();
  const {data: user} = useUserProfile();

  const { data: curriculum, isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);
  const { data: actividadesExtracurriculares, isLoading: cargaExtra } = useActividadesExtracurriculares(user?.rut);
  const { data: actividadesCientificas, isLoading: cargaCientificas } = useActividadescientificas(user?.rut);
  const { data: cursosTitulosGrados, isLoading: cargaCursos } = useCursos_titulos_grados(user?.rut);
  const { data: ayudantias, isLoading: cargaAyudantias } = useAyudantias(user?.rut);
  const {mutate: editarCurriculum, isPending } = useEditarCurriculum();

  const [formData, setFormData ] = useState<CurriculumDataEditar>({
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

  useEffect(() => {
    if (curriculum && ayudantias && cursosTitulosGrados && actividadesCientificas && actividadesExtracurriculares)
    {
      const d = curriculum as CurriculumResponse;
      console.log("CURRICULUM: ", d);

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
        ayudantias: ayudantias.map((a: typeof ayudantias) => ({
            nombre_asig: a.nombre_asig,
            nombre_coordinador: a.nombre_coordinador,
            evaluacion_obtenida: a.evaluacion, 
        })) || [],
        cursos_titulos_grados: cursosTitulosGrados.map((t: typeof cursosTitulosGrados) => ({
            nombre_asig: t.nombre_asig,
            n_coordinador: t.n_coordinador,
            evaluacion: t.evaluacion,
        })) || [],
        actividades_cientificas: actividadesCientificas.map((c: typeof actividadesCientificas) => ({
            nombre: c.nombre,
            descripcion: c.descripcion,
            periodo_participacion: c.periodo_participacion,
        })) || [],
        actividades_extracurriculares: actividadesExtracurriculares.map((e: typeof actividadesExtracurriculares) => ({
            nombre: e.nombre,
            docente: e.docente,
            descripcion: e.descripcion,
            periodo_participacion: e.periodo_participacion,
        })) || [],
      });
    }
  }, [curriculum, ayudantias, cursosTitulosGrados, actividadesCientificas, actividadesExtracurriculares]);

  const handleChange = (name: keyof CurriculumDataEditar, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleArrayChange = (
    key: keyof CurriculumDataEditar,
    index: number,
    field: string,
    value: string
  ) => {
    setFormData(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const updated = current.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        );
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


  const handleSubmit = async () => {
    if (!formData.id) return Alert.alert("Error", "Falta el ID del curriculum.");

      console.log("ID form: ", formData.id);
      console.log("form: ", formData);
      editarCurriculum(formData, {
      onSuccess: () => {
        Alert.alert("Éxito", "Currículum actualizado correctamente");
        if (user?.rut)
        {
          clienteQuery.invalidateQueries({ queryKey: ['curriculum', user?.rut] });
          clienteQuery.invalidateQueries({ queryKey: ['actividadesExtracurriculares', user?.rut] });
          clienteQuery.invalidateQueries({ queryKey: ['actividadesCientificas', user?.rut] });
          clienteQuery.invalidateQueries({ queryKey: ['cursosTitulosGrados', user?.rut] });
          clienteQuery.invalidateQueries({ queryKey: ['ayudantias', user?.rut] });
        }
        console.log("rut usuario: ", user?.rut);
        router.back(); 
      },
      onError: (error: any) => {
        Alert.alert("Error", `No se pudo guardar: ${error.message}`);
      }
    });



  };

  if (cargaCurriculum || cargaExtra || cargaCientificas || cargaCursos || cargaAyudantias) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" style={{marginTop: 50}} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Editar Currículum' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.title}>Información Personal</ThemedText>
        
        <FormInput
          label="Nombres"
          value={formData.nombres || ""}
          onChangeText={(t) => handleChange('nombres', t)}
        />
        <FormInput
          label="Apellidos"
          value={formData.apellidos || ""}
          onChangeText={(t) => handleChange('apellidos', t)}
        />
        <FormInput
          label="Correo"
          value={formData.correo || ""}
          onChangeText={(t) => handleChange('correo', t)}
          keyboardType="email-address"
        />
        <FormInput
          label="Comuna"
          value={formData.comuna || ""}
          onChangeText={(t) => handleChange('comuna', t)}
        />
        <FormInput
          label="Ciudad"
          value={formData.ciudad || ""}
          onChangeText={(t) => handleChange('ciudad', t)}
        />
        <FormInput
          label="Fecha de Nacimiento (AAAA-MM-DD)"
          value={formData.fecha_nacimiento || ""}
          onChangeText={(t) => handleChange('fecha_nacimiento', t)}
        />
        <FormInput
          label="Número de Celular"
          value={formData.num_celular || ""}
          onChangeText={(t) => handleChange('num_celular', t)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Carrera"
          value={formData.carrera || ""}
          onChangeText={(t) => handleChange('carrera', t)}
        />
        
        <View style={styles.dynamicSection}>
          <ThemedText style={styles.sectionTitle}>Ayudantías</ThemedText>
          {formData.ayudantias?.map((a, i) => (
            <View key={`ayudantia-${i}`} style={styles.dynamicItem}>
              <FormInput label="Asignatura" value={a.nombre_asig} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_asig', t)} />
              <FormInput label="Coordinador" value={a.nombre_coordinador} onChangeText={(t) => handleArrayChange('ayudantias', i, 'nombre_coordinador', t)} />
              <FormInput label="Evaluación" value={a.evaluacion_obtenida} onChangeText={(t) => handleArrayChange('ayudantias', i, 'evaluacion_obtenida', t)} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveArrayItem("ayudantias", i)}>
                <Ionicons name="trash-outline" size={20} color="#C70039" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddArrayItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })}>
            <Ionicons name="add" size={20} color="#007bff" />
            <ThemedText style={styles.addButtonText}>Agregar Ayudantía</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.dynamicSection}>
          <ThemedText style={styles.sectionTitle}>Cursos, Títulos y Grados</ThemedText>
          {formData.cursos_titulos_grados?.map((c, i) => (
            <View key={`curso-${i}`} style={styles.dynamicItem}>
              <FormInput label="Nombre Título/Curso" value={c.nombre_asig} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'nombre_asig', t)} />
              <FormInput label="Institución" value={c.n_coordinador} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'n_coordinador', t)} />
              <FormInput label="Fecha" value={c.evaluacion} onChangeText={(t) => handleArrayChange('cursos_titulos_grados', i, 'evaluacion', t)} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveArrayItem("cursos_titulos_grados", i)}>
                <Ionicons name="trash-outline" size={20} color="#C70039" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddArrayItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })}>
            <Ionicons name="add" size={20} color="#007bff" />
            <ThemedText style={styles.addButtonText}>Agregar Curso/Título</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.dynamicSection}>
          <ThemedText style={styles.sectionTitle}>Actividades Científicas</ThemedText>
          {formData.actividades_cientificas?.map((a, i) => (
            <View key={`cientifica-${i}`} style={styles.dynamicItem}>
              <FormInput label="Nombre Actividad" value={a.nombre} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'nombre', t)} />
              <FormInput label="Descripción" value={a.descripcion} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'descripcion', t)} />
              <FormInput label="Periodo" value={a.periodo_participacion} onChangeText={(t) => handleArrayChange('actividades_cientificas', i, 'periodo_participacion', t)} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveArrayItem("actividades_cientificas", i)}>
                <Ionicons name="trash-outline" size={20} color="#C70039" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddArrayItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })}>
            <Ionicons name="add" size={20} color="#007bff" />
            <ThemedText style={styles.addButtonText}>Agregar Act. Científica</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.dynamicSection}>
          <ThemedText style={styles.sectionTitle}>Actividades Extracurriculares</ThemedText>
          {formData.actividades_extracurriculares?.map((a, i) => (
            <View key={`extra-${i}`} style={styles.dynamicItem}>
              <FormInput label="Nombre Actividad" value={a.nombre} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'nombre', t)} />
              <FormInput label="Docente/Institución" value={a.docente} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'docente', t)} />
              <FormInput label="Descripción" value={a.descripcion} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'descripcion', t)} />
              <FormInput label="Periodo" value={a.periodo_participacion} onChangeText={(t) => handleArrayChange('actividades_extracurriculares', i, 'periodo_participacion', t)} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveArrayItem("actividades_extracurriculares", i)}>
                <Ionicons name="trash-outline" size={20} color="#C70039" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddArrayItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })}>
            <Ionicons name="add" size={20} color="#007bff" />
            <ThemedText style={styles.addButtonText}>Agregar Act. Extracurricular</ThemedText>
          </TouchableOpacity>
        </View>
        
        <FormInput
          label="Información Adicional (Otros)"
          value={formData.otros || ""}
          onChangeText={(t) => handleChange('otros', t)}
          multiline
          numberOfLines={5}
          placeholder="Logros, habilidades, proyectos, etc."
        />

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
            <Ionicons name="save-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
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
    paddingBottom: 60,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 12,
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
  dynamicSection: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
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
});