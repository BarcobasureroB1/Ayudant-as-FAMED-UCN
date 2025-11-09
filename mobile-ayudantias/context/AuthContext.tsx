import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface TipoAutenticacion {
    token: string | null;
    setToken: (token: string | null) => void;
    tipoUser: string | null;
    setUsertipo: (tipoUser: string | null ) => void;
    loading: boolean;
}

const contextoAutenticacion = createContext<TipoAutenticacion | undefined>(undefined);

const TOKEN_KEY = 'token';
const TIPO_USUARIO_KEY = 'tipoUser';

export const ProveedorAuth = ({ children }: { children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [tipoUser, setUsertipoState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            try {
                const tokenGuardado = await SecureStore.getItemAsync(TOKEN_KEY);
                const tipoUserGuardado = await SecureStore.getItemAsync(TIPO_USUARIO_KEY);
                //guarda el tipo de usuario y el token
                if(tokenGuardado)
                {
                    setTokenState(tokenGuardado);
                }
                if(tipoUserGuardado)
                {
                    setUsertipoState(tipoUserGuardado);
                }
            } catch (e) {
                console.error("error al cargar datos de auth", e);
            } finally {
                setLoading(false);
            }
        }

        cargarDatos();
    }, []);

    const setToken = async (nuevoToken: string | null) => {
        setTokenState(nuevoToken);
        if (nuevoToken)
        {
            await SecureStore.setItemAsync(TOKEN_KEY, nuevoToken);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    };

    const setUsertipo = async (nuevoTipoUser: string | null) => {
        setUsertipoState(nuevoTipoUser);

        if (nuevoTipoUser)
        {
            await SecureStore.setItemAsync(TIPO_USUARIO_KEY, nuevoTipoUser);
        } else {
            await SecureStore.deleteItemAsync(TIPO_USUARIO_KEY);
        }
    };


    const valorContexto = useMemo(() => ({token, setToken, tipoUser, setUsertipo, loading }),
        [token, tipoUser, loading]
    );

    return (
        <contextoAutenticacion.Provider value={valorContexto}>
            {children}
        </contextoAutenticacion.Provider>
    );
};


export const useAuth = (): TipoAutenticacion => {
    const contexto = useContext(contextoAutenticacion);
    if (!contexto)
    {
        throw new Error('useAuth tiene que ir dentro de ProveedorAuth');
    }
    return contexto;
}
