"use client";
import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface DescarteProps {
    onClose: () => void;
    onConfirm: (motivo: string) => Promise<void> | void;
}

export const ModalDescarte = ({ onClose, onConfirm }: DescarteProps) => {
    const [motivo, setMotivo] = useState("");
    
    // Estados de flujo
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    const handlePreSubmit = () => {
        if (!motivo.trim()) {
            return;
        }
        setShowConfirmModal(true);
    };

    const handleFinalConfirm = async () => {
        setShowConfirmModal(false);
        setIsPending(true);
        setError("");

        try {
            await onConfirm(motivo);
            setIsPending(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            setIsPending(false);
            setError("Ocurrió un error al intentar descartar. Intente nuevamente.");
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
                
                <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <AlertTriangle size={20} /> Descartar Postulante
                    </h3>
                    <button 
                        onClick={(isPending || showSuccessModal) ? undefined : onClose} 
                        className={`p-1 rounded transition ${(isPending || showSuccessModal) ? 'opacity-0 cursor-default' : 'hover:bg-red-700'}`}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Esta acción eliminará al postulante del proceso actual. Se debe ingresar un motivo para el registro y notificación.
                    </p>

                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        Motivo del descarte <span className="text-red-500">*</span>
                    </label>
                    
                    <textarea 
                        className="w-full border border-gray-300 p-3 rounded-lg h-32 resize-none text-sm text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="Ej: Disponibilidad horaria incompatible con la asignatura..."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        disabled={isPending}
                    />

                    {error && (
                        <div className="mt-3 bg-red-50 text-red-600 p-3 rounded text-xs flex items-center gap-2">
                            <AlertCircle size={16}/> {error}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                    
                    <div className="flex-1 w-full sm:w-auto">
                        {isPending && (
                            <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-pulse">
                                <Loader2 size={16} className="animate-spin flex-shrink-0" />
                                <span className="leading-tight">Enviando notificación de descarte al correo del alumno...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <button 
                            onClick={onClose} 
                            disabled={isPending || showSuccessModal}
                            className="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg text-sm font-medium transition disabled:opacity-50 border border-transparent hover:border-gray-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handlePreSubmit} 
                            disabled={!motivo.trim() || isPending || showSuccessModal}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            Descartar
                        </button>
                    </div>
                </div>

                {showConfirmModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[2px] p-6 animate-in fade-in">
                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-xs w-full animate-in zoom-in-95 text-center">
                            <div className="bg-red-100 p-3 rounded-full text-red-600 mx-auto w-fit mb-4">
                                <HelpCircle size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Está seguro?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Esta acción es irreversible y notificará al alumno inmediatamente.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleFinalConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                        <div className="flex flex-col items-center text-center max-w-xs w-full animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
                            
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4 shadow-sm animate-in zoom-in spin-in-12 duration-500">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Descarte Exitoso</h3>
                            
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                La postulación se ha descartado correctamente y se ha enviado la notificación correspondiente al alumno.
                            </p>
                            
                            <button
                                onClick={handleCloseSuccess}
                                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Entendido, cerrar
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};