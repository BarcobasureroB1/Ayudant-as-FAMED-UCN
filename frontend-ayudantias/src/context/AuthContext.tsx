'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface TipoAutenticacion {
    token: string | null;
    setToken: (token: string | null) => void;
    loading: boolean;
}

const contextoAutenticacion = createContext<TipoAutenticacion | undefined>(undefined);

//cookies
const TOKEN_COOKIE_KEY = 'token';

export const ProveedorAuth = ({children}: {children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    //leer la cookie para mantener la sesion
    useEffect(()=>{
        const tokenGuardado = Cookies.get(TOKEN_COOKIE_KEY);
        if (tokenGuardado)
        {
            setTokenState(tokenGuardado);
        }
        setLoading(false);
    },[]);

    //actualiza el token en el estado y en la cookie
    const setToken = (nuevoToken: string | null) => {
        setTokenState(nuevoToken);
        if (nuevoToken)
        {
            //se guarda el token en una cookie y expira en 7 dias
            Cookies.set(TOKEN_COOKIE_KEY, nuevoToken, {expires: 7});
        } else
        {
            Cookies.remove(TOKEN_COOKIE_KEY);
        }
    };

    return(
        <contextoAutenticacion.Provider value={{token, setToken, loading}}>
            {children}
        </contextoAutenticacion.Provider>

    );
};

export const useAuth = (): TipoAutenticacion => {
    const contexto = useContext(contextoAutenticacion);
    if (!contexto)
    {
        throw new Error('el hook de useAuth debe ir dentro de un ProveedorAuth');
    }
    return contexto;
}


