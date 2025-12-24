import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://192.168.1.108:3000'; //modificar por la ip del servidor en produccion

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    
    let token: string | null = null;

    if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync('token');
    } else {
        token = localStorage.getItem('token');
    }

    //para leer el token
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default api;