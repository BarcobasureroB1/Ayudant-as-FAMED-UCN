import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { AxiosError } from 'axios';

interface RecuperarData {
    rut: string;
}

interface RestablecerData {
    token: string;
    nuevaContrasena: string;
}

interface AuthResponse {
    message: string;
}

export function useForgotPassword(
    onSuccess: (data: AuthResponse) => void, 
    onFail: (error: string) => void
) {
    return useMutation<AuthResponse, AxiosError, RecuperarData>({
        mutationFn: async ({ rut }: RecuperarData) => {
            const respuesta = await api.post('/auth/recuperar-contrasena', { rut });
            return respuesta.data;
        },
        onSuccess: (data) => {
            onSuccess(data);
        },
        onError: (error) => {
            const mensaje = (error.response?.data as { message: string })?.message || 'No se pudo enviar la solicitud.';
            onFail(mensaje);
        }
    });
}

export function useRestablecerPassword(
    onSuccess: (data: AuthResponse) => void, 
    onFail: (error: string) => void
) {
    return useMutation<AuthResponse, AxiosError, RestablecerData>({
        mutationFn: async ({ token, nuevaContrasena }: RestablecerData) => {
            const respuesta = await api.post('/auth/restablecer-contrasena', { 
                token, 
                nuevaContrasena 
            });
            return respuesta.data;
        },
        onSuccess: (data) => {
            onSuccess(data);
        },
        onError: (error) => {
            const mensaje = (error.response?.data as { message: string })?.message || 'El enlace ha expirado o es inválido.';
            onFail(mensaje);
        }
    });
}