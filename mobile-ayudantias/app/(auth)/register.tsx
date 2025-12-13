import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister } from '../../hooks/useRegister';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function RegisterPage() {
    const [rut, setRut] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const router = useRouter();
    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const registerMutation = useRegister(
        () => {
            Alert.alert('Registro Correcto', 'Ahora puedes iniciar sesión', [
                {text: 'OK', onPress: () => router.replace('/(auth)/login')},
            ]);
        },
        (error) => {
            Alert.alert('Error de Registro', error || 'No se pudo completar el registro');
        }
    );

    const filtrarRut = (text: string) => { 
        const textoFiltrado = text.replace(/[^0-9]/g, '');
        setRut(textoFiltrado);
    }

    const enviar = () => {
      if (!rut || !nombres || !apellidos || !password) {
        Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
        return;
      }

      registerMutation.mutate({
          rut,
          nombres: nombres,
          apellidos: apellidos,
          tipo: 'alumno',
          password,
      });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>Crear Cuenta</Text>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>RUT</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese su rut sin puntos ni guiones"
                            placeholderTextColor={colors.textPlaceholder}
                            value={rut}
                            onChangeText={filtrarRut}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            textContentType="none"
                            autoComplete="off"
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Nombres</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Jorge Andres"
                            placeholderTextColor={colors.textPlaceholder}
                            value={nombres}
                            onChangeText={setNombres}
                            textContentType="givenName"
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Apellidos</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Perez Tapia"
                            placeholderTextColor={colors.textPlaceholder}
                            value={apellidos}
                            onChangeText={setApellidos}
                            textContentType="familyName"
                        />
                    </View>


                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputInContainer}
                                placeholder="Ingrese una contraseña de acceso"
                                placeholderTextColor={colors.textPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!mostrarPassword}
                                textContentType="newPassword"
                            />
                            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.eyeIcon}>
                                <Ionicons name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, registerMutation.isPending ? styles.buttonDisabled : null]}
                        onPress={enviar}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? (
                            <ActivityIndicator color={colors.primaryText}/>
                        ): (
                            <Text style={styles.buttonText}>Registrarse</Text>
                        )}
                    </TouchableOpacity>

                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.switchButton}>
                            <Text style={styles.switchButtonText}>
                                ¿Alumno ya tienes cuenta? Inicia sesión
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


/*const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', 
    },
    flexContainer: {
        flex:1,
    },
    content: {
        flex: 1,
        justifyContent: 'center', 
        padding: 16, 
    },
    card: {
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        padding: 24,
        shadowColor: "#000", 
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18, 
        fontWeight: '600',
        color: '#4B5563', 
        textAlign: 'center',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        
    },
    inputInContainer: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding:12,
    },
    button: {
        backgroundColor: '#007AFF', 
        borderRadius: 8,
        padding: 14,
        alignItems: 'center', 
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9E9E9E', 
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        padding: 8,
    },
    switchButtonText: {
        color: '#007AFF', 
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});*/

const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flexContainer: {
        flex:1,
    },
    content: {
        flex: 1,
        justifyContent: 'center', 
        padding: 16, 
    },
    card: {
        backgroundColor: colors.card, 
        borderRadius: 12, 
        padding: 24,
        shadowColor: "#000", 
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 22, // Ajustado para coincidir con login
        fontWeight: 'bold',
        color: colors.text, 
        textAlign: 'center',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textLabel,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
    },
    inputInContainer: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: colors.text,
    },
    eyeIcon: {
        padding: 12,
    },
    button: {
        backgroundColor: colors.primary, 
        borderRadius: 8,
        padding: 14,
        alignItems: 'center', 
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9E9E9E', 
    },
    buttonText: {
        color: colors.primaryText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        padding: 8,
    },
    switchButtonText: {
        color: colors.primary, 
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});