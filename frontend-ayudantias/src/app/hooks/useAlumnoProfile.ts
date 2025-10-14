import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';


export function useAlumnoProfile(rut_alumno?: string){
    return useQuery({
        queryKey:['alumno'],
        queryFn: async () => {
            const respuesta = await api.get(`usuario/alumno/${rut_alumno}`);
            console.log("datos alumno: ", respuesta.data);
            return respuesta.data;
        },
    });
}