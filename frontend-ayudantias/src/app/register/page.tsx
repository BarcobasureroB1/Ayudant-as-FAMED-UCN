"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRegister } from "@/hooks/useRegister";


export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [rut, setRut] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();


    const registrar = useRegister(() => 
        {
            router.push("/login") //redireccionar al login despues del registro
        },
        (error) => {
            setErrorMsg(error || "error en el registro");
        }
    );

    const enviar = (e: SyntheticEvent) => {
        e.preventDefault();
        setErrorMsg("");

        registrar.mutate({
            rut,
            nombres: nombre,
            apellidos: apellidos,
            tipo: "postulante",
            password: password,
        });
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <div className="flex mb-6 border-b border-gray-200">
                    <button onClick={() => router.push("/login")} className="w-1/2 text-sm font-medium py-2 text-center text-gray-400 hover:text-black transition-colors">
                        Iniciar sesión
                    </button>
                    <span className="w-1/2 text-sm font-semibold py-2 text-center border-b-2 border-black text-black cursor-default">
                        Crear cuenta
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Registro</h1>
                
                <form onSubmit={enviar} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ingrese su nombre completo..."
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
                    </div>


                    <div>
                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            name="apellidos"
                            id="apellidos"
                            required
                            value={apellidos}
                            onChange={(e) => setApellidos(e.target.value)}
                            placeholder="Ingrese sus apellidos..."
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
                    </div>

                    <div>
                        <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                            RUT
                        </label>
                        <input
                            type="text"
                            name="rut"
                            id="rut"
                            required
                            value={rut}
                            onChange={(e) => setRut(e.target.value)}
                            placeholder="Ingrese su RUT sin puntos ni guiones..."
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={registrar.isPending}
                        className={`w-full py-2 rounded-md text-white font-semibold transition ${
                            registrar.isPending ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                        }`}
                    >
                        {registrar.isPending ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
                
                {errorMsg && <p className="mt-4 text-sm text-red-600 text-center">{errorMsg}</p>}
            </div>
        </div>

    )
}