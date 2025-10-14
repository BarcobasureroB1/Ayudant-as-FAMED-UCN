"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const { setToken } = useAuth();

    const login = useLogin((response) => {
        const token = response.token;
        setToken(token)
        router.push("/dashboard");
    },
    (error) => {
        setErrorMsg(error.message || "rut o contraseña incorrectos");
    }
    );

    const submit = (e:SyntheticEvent) => {
        e.preventDefault();
        setErrorMsg("");

        login.mutate({
            rut,
            contrasena: password,
        });
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
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
                        <input
                            type="password" name="password" id="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
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