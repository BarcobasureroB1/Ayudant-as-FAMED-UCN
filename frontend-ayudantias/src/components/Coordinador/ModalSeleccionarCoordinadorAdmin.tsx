"use client";
import React, { useState, useMemo } from 'react';
import { CoordinadorData } from '@/hooks/useCoordinadores';
import { Search, User, Users } from 'lucide-react';

interface Props {
    abierto: boolean;
    onClose: () => void;
    onSelect: (rut: string) => void;
    coordinadores: CoordinadorData[] | undefined;
    isLoading: boolean;
}

export const ModalSeleccionarCoordinadorAdmin = ({ abierto, onClose, onSelect, coordinadores, isLoading }: Props) => {
    const [busqueda, setBusqueda] = useState("");

    const filtrados = useMemo(() => {
        if (!coordinadores || !Array.isArray(coordinadores)) {
            return [];
        }

        return coordinadores.filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
             c.rut.includes(busqueda)
        );
    }, [coordinadores, busqueda]);

    if (!abierto) return null;

    return (
        /* 1. FONDO: Usamos z-[60] para estar seguro sobre todo.
           2. bg-black/60: Oscuro transparente (evita el tono gris plano).
           3. backdrop-blur-sm: El efecto de vidrio esmerilado.
        */
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            {/* CONTENEDOR PRINCIPAL: Sombra fuerte y bordes redondeados */}
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* ENCABEZADO: Estilo Indigo (Igual que secretaría) */}
                <div className="p-5 bg-indigo-50 border-b border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-900">Seleccionar Coordinador</h3>
                    <p className="text-xs text-indigo-600 mb-3">Elija un coordinador para gestionar sus postulantes.</p>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* LISTA DE RESULTADOS */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Cargando coordinadores...</div>
                    ) : filtrados.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No se encontraron resultados.</div>
                    ) : (
                        filtrados.map((coord) => (
                            <button
                                key={coord.rut}
                                onClick={() => onSelect(coord.rut)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg transition-colors text-left group border border-transparent hover:border-indigo-100"
                            >
                                {/* Icono con fondo indigo suave */}
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 group-hover:bg-indigo-200">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">
                                        {coord.nombres} {coord.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">{coord.rut}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* PIE DE PÁGINA */}
                <div className="p-3 border-t bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};