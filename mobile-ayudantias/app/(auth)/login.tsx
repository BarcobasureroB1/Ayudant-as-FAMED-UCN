import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '../../hooks/useLogin';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function LoginPage() {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const { setToken, setUsertipo } = useAuth();
    const [errores, setErrores] = useState({rut: '', password: ''});

    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const loginMutation = useLogin(
        (data) => {
            setToken(data.access_token);
            setUsertipo(data.user.tipo);
        },
        (error) => {
            Alert.alert('error de login', error.message || 'Rut o contraseña inválidos');
        }
    );

    const validacionDatos = () => {
        const errores = {rut: '', password: ''};
        let valido = true;

        if (!rut.trim())
        {
            errores.rut = 'Ingrese su Rut';
            valido = false;
        }

        if (!password.trim())
        {
            errores.password = 'Ingrese su contraseña';
            valido = false;
        }

        setErrores(errores);
        return valido;
    }

    const enviar = () => {
        console.log("datos enviados");
        if (validacionDatos())
        {
            loginMutation.mutate({ rut, password });
        }
    };

    const filtrarRut = (text: string) => {
        
        const textoFiltrado = text.replace(/[^0-9]/g, ''); //expresion regular para que tome solo los datos numericos de rut
        setRut(textoFiltrado);
        if (errores.rut)
        {
            setErrores(prev => ({ ...prev, rut: ''}))
        }
    };

    const handleSetPassword = (text: string) => {
        setPassword(text);
        if (errores.password)
        {
            setErrores(prev => ({ ...prev, password: ''}));
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.appTitle}>
                        Bienvenid@s al sistema de ayudantias FAMED
                    </Text>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.title}>Iniciar Sesión</Text>
                        <Text style={styles.label}>RUT</Text>
                        <TextInput
                            style={[styles.input, errores.rut ? styles.inputError : null]}
                            placeholder="Ingrese su rut sin puntos ni guiones"
                            placeholderTextColor={colors.textPlaceholder}
                            value={rut}
                            onChangeText={filtrarRut}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            textContentType="none"
                            autoComplete="off"
                        />
                        {errores.rut ? <Text style={styles.errorText}>{errores.rut}</Text> : null}
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={[styles.inputContainer, errores.password ? styles.inputError : null]}>
                            <TextInput
                                style={styles.inputInContainer}
                                placeholder="Ingrese su contraseña"
                                placeholderTextColor={colors.textPlaceholder}
                                value={password}
                                onChangeText={handleSetPassword}
                                secureTextEntry={!mostrarPassword}
                                textContentType="password"
                            />
                            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.eyeIcon}>
                                <Ionicons name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280"/>
                            </TouchableOpacity>
                        </View>
                        {errores.password ? <Text style={styles.errorText}>{errores.password}</Text> : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loginMutation.isPending ? styles.buttonDisabled : null]}
                        onPress={enviar}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <ActivityIndicator color={colors.primaryText}/>
                        ):(
                            <Text style={styles.buttonText}>Ingresar</Text>
                        )}
                    </TouchableOpacity>

                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity style={styles.switchButton}>
                            <Text style={styles.switchButtonText}>
                                ¿Alumno no tienes cuenta? Registrate aquí
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
    )
}


const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, 
    },
    flexContainer: {
        flex: 1,
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
    appTitle: {
        fontSize: 22, 
        fontWeight: 'bold',
        color: colors.text, 
        textAlign: 'center',
        marginBottom: 8, 
    },
    title: {
        fontSize: 18, 
        fontWeight: '600',
        color: colors.textLabel, 
        textAlign: 'center',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 12,
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
    inputError: {
        borderColor: colors.errorBorder, 
        borderWidth: 1,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginBottom: 12, 
        marginTop: 4, 
    },
    button: {
        backgroundColor: colors.primary, 
        borderRadius: 8,
        padding: 14,
        alignItems: 'center', 
        marginTop: 0,
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