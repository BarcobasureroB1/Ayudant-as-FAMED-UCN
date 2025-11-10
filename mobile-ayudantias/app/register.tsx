import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister } from '../hooks/useRegister';
import { Link, useRouter } from 'expo-router';

export default function RegisterPage() {
    const [rut, setRut] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const registerMutation = useRegister(
        () => {
            Alert.alert('Registro Correcto', 'Ahora puedes iniciar sesión', [
                {text: 'OK', onPress: () => router.push('/login')},
            ]);
        },
        (error) => {
            Alert.alert('Error de Registro', error || 'No se pudo completar el registro');
        }
    );

    const enviar = () => {
      if (!rut || !nombres || !apellidos || !password) {
        
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              <View style={styles.card}>
                  <Text style={styles.title}>Crear Cuenta</Text>
                  <Text style={styles.label}>RUT</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="12345678-9"
                      placeholderTextColor="#9CA3AF"
                      value={rut}
                      onChangeText={setRut}
                      autoCapitalize="none"
                  />

                  <Text style={styles.label}>Nombres</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="Jorge Gonzales"
                      placeholderTextColor="#9CA3AF"
                      value={nombres}
                      onChangeText={setNombres}
                  />

                  <Text style={styles.label}>Apellidos</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="Perez Tapia"
                      placeholderTextColor="#9CA3AF"
                      value={apellidos}
                      onChangeText={setApellidos}
                  />

                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity
                      style={[styles.button, registerMutation.isPending ? styles.buttonDisabled : null]}
                      onPress={enviar}
                      disabled={registerMutation.isPending}
                  >
                      {registerMutation.isPending ? (
                        <ActivityIndicator color="#FFF"/>
                      ): (
                        <Text style={styles.buttonText}>Registrarse</Text>
                      )}
                  </TouchableOpacity>

                  <Link href="/login" asChild>
                      <TouchableOpacity style={styles.switchButton}>
                          <Text style={styles.switchButtonText}>
                              ¿Alumno ya tienes cuenta? Inicia sesión
                          </Text>
                      </TouchableOpacity>
                  </Link>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
    );
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