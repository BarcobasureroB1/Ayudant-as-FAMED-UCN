"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { useForgotPassword } from "@/hooks/useForgotPassword";
export default function RecuperarPasswordPage() {
    const [rut, setRut] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeError, setMensajeError] = useState("");
    const router = useRouter();

    const recuperar = useForgotPassword(
        (data) => {
            setMensajeExito("Correo enviado con éxito. Por favor revisa tu bandeja de entrada.");
            setMensajeError("");
            setRut(""); 
        },
        (error) => {
            setMensajeError(error);
            setMensajeExito("");
        }
    );

    const enviar = (e: SyntheticEvent) => {
        e.preventDefault();
        if (!rut.trim()) return;
        
        setMensajeError("");
        setMensajeExito("");
        
        recuperar.mutate({ rut });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Contraseña</h1>
                    <p className="text-gray-500 text-sm">
                        Ingresa tu RUT y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                {!mensajeExito ? (
                    <form onSubmit={enviar} className="space-y-6">
                        <div>
                            <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                                RUT
                            </label>
                            <input
                                type="text"
                                id="rut"
                                value={rut}
                                onChange={(e) => setRut(e.target.value)}
                                placeholder="Ej: 12345678-9"
                                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800 border-gray-300"
                                required
                            />
                        </div>

                        {mensajeError && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2">
                                {mensajeError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={recuperar.isPending}
                            className={`w-full py-2.5 rounded-md text-white font-semibold transition shadow-sm ${
                                recuperar.isPending 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-black hover:bg-gray-800"
                            }`}
                        >
                            {recuperar.isPending ? "Enviando..." : "Enviar enlace de recuperación"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">¡Correo enviado!</h3>
                        <p className="text-gray-500 text-sm mt-2 mb-6">
                            {mensajeExito}
                        </p>
                        <button 
                             onClick={() => router.push("/login")}
                             className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                )}

                {!mensajeExito && (
                    <div className="mt-6 text-center border-t border-gray-100 pt-4">
                        <button
                            onClick={() => router.push("/login")}
                            className="text-gray-500 hover:text-black text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <span>←</span> Volver al Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}