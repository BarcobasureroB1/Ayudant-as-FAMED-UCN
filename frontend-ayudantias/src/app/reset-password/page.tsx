"use client";

import { SyntheticEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRestablecerPassword } from "@/hooks/useForgotPassword";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setMensajeError("Token inválido o no proporcionado.");
        }
    }, [token]);

    const restablecer = useRestablecerPassword(
        (_data) => {
            setMensajeExito("Contraseña actualizada correctamente.");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        },
        (error) => {
            setMensajeError(error);
        }
    );

    const enviar = (e: SyntheticEvent) => {
        e.preventDefault();
        setMensajeError("");

        if (!token) {
            setMensajeError("No se encontró el token de seguridad. Vuelve a solicitar el correo.");
            return;
        }

        if (password.length < 6) {
            setMensajeError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setMensajeError("Las contraseñas no coinciden.");
            return;
        }

        restablecer.mutate({ 
            token, 
            nuevaContrasena: password 
        });
    };

    if (mensajeExito) {
        return (
            <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">¡Contraseña Actualizada!</h3>
                <p className="text-gray-500 text-sm mt-2 mb-6">
                    Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en breve.
                </p>
                <button 
                     onClick={() => router.push("/login")}
                     className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                >
                    Ir al Login ahora
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Restablecer Contraseña</h1>
                <p className="text-gray-500 text-sm">
                    Ingresa tu nueva contraseña a continuación.
                </p>
            </div>

            <form onSubmit={enviar} className="space-y-6">
                <div>
                    <label htmlFor="pass" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="pass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800 border-gray-300 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPass"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black placeholder:text-gray-400 text-gray-800 pr-10 ${
                                confirmPassword && password !== confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                            }`}
                        />
                         <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                         <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                </div>

                {mensajeError && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                        {mensajeError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={restablecer.isPending || !token}
                    className={`w-full py-2.5 rounded-md text-white font-semibold transition shadow-sm ${
                        restablecer.isPending || !token
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-black hover:bg-gray-800"
                    }`}
                >
                    {restablecer.isPending ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                
                <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}