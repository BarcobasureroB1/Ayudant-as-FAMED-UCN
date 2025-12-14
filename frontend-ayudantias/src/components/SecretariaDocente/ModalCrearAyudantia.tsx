"use client";
import React, { useState } from 'react';
import { PostulanteCoordinadorData } from '@/hooks/useCoordinadores';
import { useCrearAyudantia } from '@/hooks/useAyudantia';
import { Calendar, DollarSign, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    abierto: boolean;
    onClose: () => void;
    postulante: PostulanteCoordinadorData | null;
    rutSecretaria: string;
    nombreAsignatura?: string;
}

export const ModalCrearAyudantia = ({ abierto, onClose, postulante, rutSecretaria, nombreAsignatura }: Props) => {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [semestre, setSemestre] = useState("1");
    const [tipoRemuneracion, setTipoRemuneracion] = useState("");
    const [error, setError] = useState("");
    
    const { mutate: crearAyudantia, isPending } = useCrearAyudantia();

    if (!abierto || !postulante) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!fechaInicio || !fechaFin || !tipoRemuneracion) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (!rutSecretaria) {
            setError("Error interno: No se ha identificado a la secretaria docente.");
            return;
        }

        const fInicioFmt = fechaInicio.replaceAll('-', '/');
        const fFinFmt = fechaFin.replaceAll('-', '/');
        
        const periodoString = `${fInicioFmt}-${fFinFmt}-${semestre}`;

        crearAyudantia({
            rut_alumno: postulante.rut_alumno,
            id_asignatura: postulante.id_asignatura,
            rut_coordinador_otro: rutSecretaria,
            periodo: periodoString,
            remunerada: tipoRemuneracion 
        }, {
            onSuccess: () => {
                alert("Ayudantía creada correctamente.");
                setFechaInicio("");
                setFechaFin("");
                setTipoRemuneracion("");
                setError("");
                onClose();
            },
            onError: () => {
                setError("Ocurrió un error al procesar la solicitud. Intente nuevamente.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
                
                <div className="bg-blue-700 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CheckCircle size={20} /> Formalizar Ayudantía
                    </h3>
                    <button onClick={onClose} className="hover:bg-blue-800 p-1 rounded transition"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
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
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Término</label>
                                <input 
                                    type="date" 
                                    required
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Semestre</label>
                            <select 
                                value={semestre}
                                onChange={(e) => setSemestre(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-800"
                            >
                                <option value="1">Primer Semestre (1)</option>
                                <option value="2">Segundo Semestre (2)</option>
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
                                className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-800"
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

                    <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                        >
                            {isPending ? 'Creando...' : 'Confirmar Ayudantía'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};