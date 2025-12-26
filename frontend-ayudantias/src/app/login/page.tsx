"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "@/hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    const login = useLogin( async (data) => {
        setToken(data.access_token);
        setUsertipo(data.user.tipo);
        router.push("/dashboard");
    },
    (_error) => {
        setErrorMsg("Rut o contraseña incorrectos");
    });

    const submit = (e:SyntheticEvent) => {
        e.preventDefault();
        setErrorMsg("");
        login.mutate({ rut, password });
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <div className="flex mb-6 border-b border-gray-200">
                    <button onClick={() => router.push("/register")} className="w-1/2 text-sm font-medium py-2 text-center text-gray-400 hover:text-black transition-colors">
                        Crear Cuenta
                    </button>
                    <span className="w-1/2 text-sm font-semibold py-2 text-center border-b-2 border-black text-black cursor-default">
                        Iniciar Sesión
                    </span>
                </div>
                
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h1>
                
                <form onSubmit={submit} className="space-y-4">
                     <div>
                        <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                        <input
                            type="text" name="rut" id="rut" required value={rut}
                            onChange={(e) => setRut(e.target.value)}
                            placeholder="Ingrese por favor su RUT sin puntos ni guiones..."
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password" id="password" required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800 pr-10" // pr-10 deja espacio para el icono
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="flex justify-end mt-2">
                            <button 
                                type="button"
                                onClick={() => router.push("/recuperarPassword")}
                                className="text-sm text-gray-500 hover:text-black hover:underline transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={login.isPending}
                        className={`w-full py-2 rounded-md text-white font-semibold transition ${login.isPending ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
                    >
                        {login.isPending ? "Iniciando sesión..." : "Ingresar"}
                    </button>
                </form>
                {errorMsg && <p className="mt-4 text-sm text-red-600 text-center">{errorMsg}</p>}
            </div>
        </div>
    );
}