import axios from 'axios';
import Cookies from 'js-cookie';

const api_url = 'http://localhost:8080';

const api = axios.create({
    baseURL: api_url,
});

api.interceptors.request.use((config) => {
    //lee el token desde la cookie
    const token = Cookies.get('token');
    if (token)
    {
        config.headers.Authorization = `Bearer ${token}`; 
    }

    return config;
})

export default api;