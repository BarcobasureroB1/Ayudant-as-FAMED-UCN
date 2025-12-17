import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useRestablecerPassword } from '@/hooks/useForgotPassword'; // Hook adaptado para mobile

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);
    
    const router = useRouter();
    const params = useLocalSearchParams();
    const token = params.token as string; // Captura el token de la URL

    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const restablecerMutation = useRestablecerPassword(
        (data) => {
            Alert.alert('¡Éxito!', 'Contraseña actualizada correctamente.', [
                { text: 'Ir al Login', onPress: () => router.replace('/(auth)/login') }
            ]);
        },
        (error) => {
            Alert.alert('Error', error || 'No se pudo actualizar la contraseña.');
        }
    );

    useEffect(() => {
        if (!token) {
            Alert.alert('Error', 'Token inválido o no proporcionado. Vuelve a solicitar el enlace.');
        }
    }, [token]);

    const enviar = () => {
        if (!token) return;

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        restablecerMutation.mutate({ 
            token, 
            nuevaContrasena: password 
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.content}>
                        <View style={styles.card}>
                            <Text style={styles.title}>Restablecer Contraseña</Text>
                            <Text style={styles.subtitle}>
                                Ingresa tu nueva contraseña a continuación.
                            </Text>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Nueva Contraseña</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputInContainer}
                                        placeholder="Ingrese nueva contraseña"
                                        placeholderTextColor={colors.textPlaceholder}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!mostrarPassword}
                                    />
                                    <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.eyeIcon}>
                                        <Ionicons name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280"/>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Confirmar Contraseña</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputInContainer}
                                        placeholder="Repite la contraseña"
                                        placeholderTextColor={colors.textPlaceholder}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!mostrarConfirm}
                                    />
                                    <TouchableOpacity onPress={() => setMostrarConfirm(!mostrarConfirm)} style={styles.eyeIcon}>
                                        <Ionicons name={mostrarConfirm ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6B7280"/>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (restablecerMutation.isPending || !token) ? styles.buttonDisabled : null]}
                                onPress={enviar}
                                disabled={restablecerMutation.isPending || !token}
                            >
                                {restablecerMutation.isPending ? (
                                    <ActivityIndicator color={colors.primaryText} />
                                ) : (
                                    <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.backButton} 
                                onPress={() => router.replace('/(auth)/login')}
                            >
                                <Text style={styles.backButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text, 
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textPlaceholder,
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
    backButton: {
        marginTop: 16,
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        color: colors.textLabel,
        fontSize: 14,
        fontWeight: '500',
    }
});