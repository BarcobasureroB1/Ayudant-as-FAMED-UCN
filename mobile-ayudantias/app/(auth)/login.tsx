import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '../../hooks/useLogin';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'expo-router';

export default function LoginPage() {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const { setToken, setUsertipo } = useAuth();

    const loginMutation = useLogin(
        (data) => {
            setToken(data.access_token);
            setUsertipo(data.user.tipo);
        },
        (error) => {
            Alert.alert('error de login', error.message || 'Rut o contraseña inválidos');
        }
    );

    const enviar = () => {
        loginMutation.mutate({ rut, password });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              <View style={styles.card}>
                  <Text style={styles.appTitle}>
                    Bienvenid@s al sistema de ayudantias FAMED
                  </Text>

                  <Text style={styles.title}>Iniciar Sesión</Text>
                  <Text style={styles.label}>RUT</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="12345678-9"
                      value={rut}
                      onChangeText={setRut}
                      autoCapitalize="none"
                  />

                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="*********"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                  />

                  <TouchableOpacity
                      style={[styles.button, loginMutation.isPending ? styles.buttonDisabled : null]}
                      onPress={enviar}
                      disabled={loginMutation.isPending}
                  >
                      {loginMutation.isPending ? (
                        <ActivityIndicator color="#FFF"/>
                      ):(
                        <Text style={styles.buttonText}>Ingresar</Text>
                      )}
                  </TouchableOpacity>

                  <Link href="/register" asChild>
                      <TouchableOpacity style={styles.switchButton}>
                          <Text style={styles.switchButtonText}>
                              ¿Alumno no tienes cuenta? Registrate aquí
                          </Text>
                      </TouchableOpacity>
                  </Link>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', 
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
    appTitle: {
        fontSize: 22, 
        fontWeight: 'bold',
        color: '#111827', 
        textAlign: 'center',
        marginBottom: 8, 
    },
    title: {
        fontSize: 18, 
        fontWeight: '600',
        color: '#4B5563', 
        textAlign: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 16,
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
});