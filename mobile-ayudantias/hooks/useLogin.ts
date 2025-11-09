import {useMutation} from '@tanstack/react-query';
import api from '../api/axios';
import { AxiosError } from 'axios';

interface Logindata {
    rut: string;
    password: string;
}

interface Loginresponse {
    message: string;
    //data: {
    access_token: string;
    user: {
        tipo: string;
    };
    statusCode: number;
    success: boolean;
}

export function useLogin(onSuccess: (data: Loginresponse)=> void, onError:(error:Error)=> void) {
    return useMutation<Loginresponse,AxiosError,Logindata>({ mutationFn: async ({rut, password}: Logindata): Promise<Loginresponse> => {
            const respuesta = await api.post('/auth/login', {rut, password});
            return respuesta.data;
        },
        onSuccess: (data) => {
            onSuccess(data);
        },
        onError,
    });
}