import {useMutation} from '@tanstack/react-query';
import api from '../api/axios';
import { AxiosError } from 'axios';

interface Logindata {
    rut: string;
    contrasena: string;
}

interface Loginresponse {
    message: string;
    //data: {
    token: string;
    statusCode: number;
    success: boolean;
}

export function useLogin(onSuccess: (data: Loginresponse)=> void, onError:(error:Error)=> void) {
    return useMutation<Loginresponse,AxiosError,Logindata>({ mutationFn: async ({rut, contrasena}: Logindata): Promise<Loginresponse> => {
            const respuesta = await api.post('/api/auth/login', {rut, contrasena});
            return respuesta.data;
        },
        onSuccess,
        onError,
    });
}