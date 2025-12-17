import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useForgotPassword } from '@/hooks/useForgotPassword'; 

export default function ForgotPasswordPage() {
    const [rut, setRut] = useState('');
    const [mensajeExito, setMensajeExito] = useState(false);
    const router = useRouter();
    
    const colors = useThemeColors();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const recuperarMutation = useForgotPassword(
        (data) => {
            setMensajeExito(true);
        },
        (error) => {
            Alert.alert('Error', error || 'No se pudo enviar el correo de recuperación.');
        }
    );

    const filtrarRut = (text: string) => { 
        const textoFiltrado = text.replace(/[^0-9]/g, '');
        setRut(textoFiltrado);
    }

    const enviar = () => {
        if (!rut.trim()) {
            Alert.alert('Campo requerido', 'Por favor ingresa tu RUT.');
            return;
        }
        recuperarMutation.mutate({ rut });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.content}>
                        <View style={styles.card}>
                            
                            {!mensajeExito ? (
                                <>
                                    <Text style={styles.title}>Recuperar Contraseña</Text>
                                    <Text style={styles.subtitle}>
                                        Ingresa tu RUT y te enviaremos un enlace para restablecer tu contraseña.
                                    </Text>

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
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.button, recuperarMutation.isPending ? styles.buttonDisabled : null]}
                                        onPress={enviar}
                                        disabled={recuperarMutation.isPending}
                                    >
                                        {recuperarMutation.isPending ? (
                                            <ActivityIndicator color={colors.primaryText} />
                                        ) : (
                                            <Text style={styles.buttonText}>Enviar enlace</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.successContainer}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="checkmark" size={32} color="#16a34a" />
                                    </View>
                                    <Text style={styles.successTitle}>¡Correo enviado!</Text>
                                    <Text style={styles.successText}>
                                        Correo enviado con éxito. Por favor revisa tu bandeja de entrada.
                                    </Text>
                                    
                                    <TouchableOpacity
                                        style={[styles.button, { marginTop: 20 }]}
                                        onPress={() => router.replace('/(auth)/login')}
                                    >
                                        <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!mensajeExito && (
                                <TouchableOpacity 
                                    style={styles.backButton} 
                                    onPress={() => router.back()}
                                >
                                    <Ionicons name="arrow-back" size={16} color={colors.textLabel} />
                                    <Text style={styles.backButtonText}>Volver al Login</Text>
                                </TouchableOpacity>
                            )}

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
        lineHeight: 20,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
        gap: 6,
    },
    backButtonText: {
        color: colors.textLabel,
        fontSize: 14,
        fontWeight: '500',
    },
    // Estilos de éxito
    successContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#dcfce7', // Green-100
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    successText: {
        fontSize: 14,
        color: colors.textLabel,
        textAlign: 'center',
        marginBottom: 10,
    }
});