"use client";
import React, { useState } from 'react';
import { PostulanteCoordinador } from '@/hooks/useCoordinadores';
import { useCrearAyudantia } from '@/hooks/useAyudantia';
import { Calendar, DollarSign, X, CheckCircle, AlertCircle, BookOpen, Loader2, HelpCircle } from 'lucide-react';

interface Props {
    abierto: boolean;
    onClose: () => void;
    postulante: PostulanteCoordinador | null;
    rutSecretaria: string;
    nombreAsignatura?: string;
}

export const ModalCrearAyudantia = ({ abierto, onClose, postulante, rutSecretaria, nombreAsignatura }: Props) => {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [semestre, setSemestre] = useState("1");
    const [tipoRemuneracion, setTipoRemuneracion] = useState("");
    const [tipoAyudantia, setTipoAyudantia] = useState("");
    
    // Estados para los popups
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState("");
    
    const { mutate: crearAyudantia, isPending } = useCrearAyudantia();

    if (!abierto || !postulante) return null;

    const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
        try {
            if ('showPicker' in e.currentTarget) {
                (e.currentTarget as any).showPicker();
            }
        } catch (error) {
            console.log("error en el datepicker", error);
        }
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!fechaInicio || !fechaFin || !tipoRemuneracion || !tipoAyudantia) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (!rutSecretaria) {
            setError("Error interno: No se ha identificado a la secretaria docente.");
            return;
        }

        setShowConfirmModal(true);
    };

    const handleFinalConfirm = () => {
        setShowConfirmModal(false);

        const fInicioFmt = fechaInicio.replaceAll('-', '/');
        const fFinFmt = fechaFin.replaceAll('-', '/');
        const periodoString = `${fInicioFmt}-${fFinFmt}-${semestre}`;

        crearAyudantia({
            rut_alumno: postulante.rut_alumno,
            id_asignatura: postulante.id_asignatura,
            rut_coordinador_otro: rutSecretaria,
            periodo: periodoString,
            remunerada: tipoRemuneracion, 
            tipo_ayudantia: tipoAyudantia,
        }, {
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: () => {
                setError("Ocurrió un error al procesar la solicitud. Intente nuevamente.");
            }
        });
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        setFechaInicio("");
        setFechaFin("");
        setTipoRemuneracion("");
        setTipoAyudantia("");
        setError("");
        onClose(); 
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
                
                <div className="bg-blue-700 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CheckCircle size={20} /> Formalizar Ayudantía
                    </h3>
                    
                    <button 
                        onClick={(isPending || showSuccessModal) ? undefined : onClose} 
                        className={`p-1 rounded transition ${(isPending || showSuccessModal) ? 'opacity-0 cursor-default' : 'hover:bg-blue-800'}`}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handlePreSubmit} className="p-6 space-y-5">
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="text-gray-500">Alumno:</span>
                            <span className="font-bold text-gray-800">{postulante.alumno.nombres} {postulante.alumno.apellidos}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="text-gray-500">RUT:</span>
                            <span className="font-mono text-gray-700">{postulante.rut_alumno}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Asignatura:</span>
                            <span className="font-medium text-blue-600">{nombreAsignatura || postulante.id_asignatura}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b pb-1">
                            <Calendar size={16} className="text-blue-600"/> Definición de Periodo
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Inicio</label>
                                <input 
                                    type="date" 
                                    required
                                    value={fechaInicio}
                                    onClick={handleDateClick}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Término</label>
                                <input 
                                    type="date" 
                                    required
                                    value={fechaFin}
                                    onClick={handleDateClick}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Semestre</label>
                            <select 
                                value={semestre}
                                onChange={(e) => setSemestre(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-800 cursor-pointer"
                            >
                                <option value="1">Primer Semestre (1)</option>
                                <option value="2">Segundo Semestre (2)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b pb-1">
                            <BookOpen size={16} className="text-blue-600"/> Modalidad
                        </h4>
                        <div>
                             <label className="text-xs font-semibold text-gray-500 block mb-1">Tipo de Ayudantía</label>
                            <select 
                                required
                                value={tipoAyudantia}
                                onChange={(e) => setTipoAyudantia(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                                <option value="">Seleccione opción...</option>
                                <option value="Docente">Docente</option>
                                <option value="Investigación">Investigación</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b pb-1">
                            <DollarSign size={16} className="text-blue-600"/> Remuneración
                        </h4>
                        <div>
                             <label className="text-xs font-semibold text-gray-500 block mb-1">Tipo de Contrato</label>
                            <select 
                                required
                                value={tipoRemuneracion}
                                onChange={(e) => setTipoRemuneracion(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                                <option value="">Seleccione opción...</option>
                                <option value="Remunerada">Remunerada</option>
                                <option value="Ad Honorem">Ad Honorem</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-xs flex items-center gap-2">
                            <AlertCircle size={16}/> {error}
                        </div>
                    )}

                    <div className="pt-2 flex justify-between items-center border-t border-gray-100 mt-2 min-h-[40px]">
                        
                        <div className="flex-1 mr-4">
                            {isPending && (
                                <div className="flex items-center gap-2 text-blue-600 text-xs font-medium animate-in fade-in">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Enviando notificación de selección al correo del alumno...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                disabled={isPending || showSuccessModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={isPending || showSuccessModal}
                                className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2"
                            >
                                {isPending ? 'Procesando...' : 'Confirmar Ayudantía'}
                            </button>
                        </div>
                    </div>
                </form>

                {showConfirmModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-6 animate-in fade-in">
                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm w-full animate-in zoom-in-95">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <HelpCircle size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">¿Confirmar Selección?</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    ¿Desea confirmar esta selección con los datos previamente ingresados? 
                                    Esta acción notificará al alumno y al sistema.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleFinalConfirm}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-xl shadow-2xl border border-green-100 p-8 max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col items-center text-center">
                            
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4 shadow-sm animate-in zoom-in spin-in-12 duration-500">
                                <CheckCircle size={48} strokeWidth={2.5} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Ayudantía Creada!</h3>
                            
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                La ayudantía se ha formalizado correctamente y se ha enviado la notificación correspondiente al alumno.
                            </p>
                            
                            <button
                                onClick={handleCloseSuccess}
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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